import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection, CollectionDocument } from '../collection.schema';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';

export interface CollectionResponse {
  id: string;
  slug: string;
  label: string;
  description?: string;
}

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
  ) {}

  async findAll(): Promise<CollectionResponse[]> {
    await this.ensureHistoricalCollections();

    const collections = await this.collectionModel.find().exec();

    return collections.map((collection) => this.toResponse(collection));
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

    return this.toResponse(await collection.save());
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

    return this.toResponse(collection);
  }

  private async ensureHistoricalCollections(): Promise<void> {
    await Promise.all(
      HISTORICAL_COLLECTIONS.map((collection) =>
        this.collectionModel.updateOne(
          { slug: collection.slug },
          { $setOnInsert: collection },
          { upsert: true },
        ),
      ),
    );
  }

  private toResponse(collection: CollectionDocument): CollectionResponse {
    return {
      id: collection._id.toString(),
      slug: collection.slug,
      label: collection.label,
      description: collection.description,
    };
  }
}

function createSlug(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
