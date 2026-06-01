import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from '../book.shema';
import { Collection, CollectionDocument } from '../collection.schema';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';

export interface CollectionResponse {
  id: string;
  slug: string;
  label: string;
  description?: string;
  itemCount?: number;
}

const PROTECTED_COLLECTION_SLUG = 'birds-books';

const HISTORICAL_COLLECTIONS = [
  {
    slug: 'birds-books',
    label: "Livres d'oiseaux",
    description: 'Collection principale autour des oiseaux.',
  },
  {
    slug: 'bd',
    label: 'BD',
    description: 'Collection de bandes dessinées.',
  },
];

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private collectionModel: Model<CollectionDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  async findAll(): Promise<CollectionResponse[]> {
    await this.ensureHistoricalCollections();

    const collections = await this.collectionModel.find().exec();
    const booksCountByCollectionSlug = await this.countBooksByCollectionSlugs(
      collections.map((collection) => collection.slug),
    );

    return collections.map((collection) =>
      this.toResponse(collection, booksCountByCollectionSlug.get(collection.slug) ?? 0),
    );
  }

  async create(createCollectionDto: CreateCollectionDto): Promise<CollectionResponse> {
    await this.ensureHistoricalCollections();

    const slug = createSlug(createCollectionDto.label);

    if (!slug) {
      throw new BadRequestException('Le nom de collection ne permet pas de générer un slug');
    }

    const existingCollection = await this.collectionModel.findOne({ slug }).exec();

    if (existingCollection) {
      throw new ConflictException(`Collection with slug ${slug} already exists`);
    }

    const collection = new this.collectionModel({
      slug,
      label: createCollectionDto.label,
      description: createCollectionDto.description ?? '',
    });

    return this.toResponse(await collection.save(), 0);
  }

  async update(
    slug: string,
    updateCollectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponse> {
    await this.ensureHistoricalCollections();

    const collection = await this.collectionModel.findOneAndUpdate(
      { slug },
      {
        label: updateCollectionDto.label,
        description: updateCollectionDto.description ?? '',
      },
      { new: true },
    );

    if (!collection) {
      throw new NotFoundException(`Collection with slug ${slug} not found`);
    }

    const booksCount = await this.countBooksByCollectionSlug(slug);

    return this.toResponse(collection, booksCount);
  }

  async delete(slug: string): Promise<CollectionResponse> {
    const normalizedSlug = normalizeCollectionSlug(slug);

    await this.ensureHistoricalCollections();

    if (normalizedSlug === PROTECTED_COLLECTION_SLUG) {
      throw new ConflictException('La collection principale ne peut pas être supprimée');
    }

    const collection = await this.collectionModel.findOne({ slug: normalizedSlug }).exec();

    if (!collection) {
      throw new NotFoundException(`Collection with slug ${normalizedSlug} not found`);
    }

    const booksCount = await this.countBooksByCollectionSlug(normalizedSlug);

    if (booksCount > 0) {
      throw new ConflictException(
        `Cette collection contient encore ${booksCount} livre(s). Déplacez-les avant de la supprimer.`,
      );
    }

    await this.collectionModel.deleteOne({ slug: normalizedSlug }).exec();

    return this.toResponse(collection, 0);
  }

  private async ensureHistoricalCollections(): Promise<void> {
    const existingCollectionsCount = await this.collectionModel.countDocuments().exec();
    const collectionsToEnsure =
      existingCollectionsCount === 0
        ? HISTORICAL_COLLECTIONS
        : HISTORICAL_COLLECTIONS.filter(
            (collection) => collection.slug === PROTECTED_COLLECTION_SLUG,
          );

    await Promise.all(
      collectionsToEnsure.map((collection) =>
        this.collectionModel.updateOne(
          { slug: collection.slug },
          { $setOnInsert: collection },
          { upsert: true },
        ),
      ),
    );
  }

  private async countBooksByCollectionSlugs(slugs: string[]): Promise<Map<string, number>> {
    const collectionSlugs = slugs.map(normalizeCollectionSlug).filter(Boolean);

    if (!collectionSlugs.length) {
      return new Map();
    }

    const counts = await this.bookModel
      .aggregate<{ _id: string; count: number }>([
        { $match: { collectionSlug: { $in: collectionSlugs } } },
        { $group: { _id: '$collectionSlug', count: { $sum: 1 } } },
      ])
      .exec();

    return new Map(counts.map((count) => [count._id, count.count]));
  }

  private countBooksByCollectionSlug(slug: string): Promise<number> {
    return this.bookModel
      .countDocuments({ collectionSlug: normalizeCollectionSlug(slug) })
      .exec();
  }

  private toResponse(collection: CollectionDocument, itemCount?: number): CollectionResponse {
    return {
      id: collection._id.toString(),
      slug: collection.slug,
      label: collection.label,
      description: collection.description,
      itemCount,
    };
  }
}

function normalizeCollectionSlug(slug: string): string {
  return slug.trim();
}

function createSlug(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
