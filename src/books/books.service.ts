import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Book, BookDocument } from '../book.shema';
import { CreateBookDto } from '../dto/create-book.dto';
import { BookDto } from '../dto/book.dto';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>,) {}

  private validateBookId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }

  async findAll(): Promise<BookDto[]> {
    const books = await this.bookModel.find().exec();
    return books.map((book) => ({
      id: book._id.toString(),
      title: book.title,
      description: book.description,
      category: book.category,
      date: book.date,
      author: book.author,
      edition: book.edition,
      price: book.price,
      imageUrl: book.imageUrl,
      state: book.state,
      collectionSlug: book.collectionSlug,
    }));
  }
  async create(createBookDto: CreateBookDto): Promise<BookDto> {
    try {
      const createdBook = new this.bookModel({
        ...createBookDto,
      });
      const savedBook = await createdBook.save();
      return {
        id: savedBook._id.toString(),
        title: savedBook.title,
        description: savedBook.description,
        category: savedBook.category,
        date: savedBook.date,
        author: savedBook.author,
        edition: savedBook.edition,
        price: savedBook.price,
        imageUrl: savedBook.imageUrl,
        state: savedBook.state,
        collectionSlug: savedBook.collectionSlug,
      };
    } catch (error) {
      console.error("Erreur lors de la création du livre:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<BookDto> {
    this.validateBookId(id);
    const deletedBook = await this.bookModel.findByIdAndRemove(id);
    if (!deletedBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return {
      id: deletedBook._id.toString(),
      title: deletedBook.title,
      description: deletedBook.description,
      category: deletedBook.category,
      date: deletedBook.date,
      author: deletedBook.author,
      edition: deletedBook.edition,
      price: deletedBook.price,
      imageUrl: deletedBook.imageUrl,
      state: deletedBook.state,
      collectionSlug: deletedBook.collectionSlug,
    };
  }

  async update(id: string, bookDto: BookDto): Promise<BookDto> {
    this.validateBookId(id);
    const updatedBook = await this.bookModel.findByIdAndUpdate(id, bookDto, {
      new: true,
    });
    if (!updatedBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return {
      id: updatedBook._id.toString(),
      title: updatedBook.title,
      description: updatedBook.description,
      category: updatedBook.category,
      date: updatedBook.date,
      author: updatedBook.author,
      edition: updatedBook.edition,
      price: updatedBook.price,
      imageUrl: updatedBook.imageUrl,
      state: updatedBook.state,
      collectionSlug: updatedBook.collectionSlug,
    };
  }

  async updateImageUrl(bookId: string, imageUrl: string): Promise<BookDto> {
    this.validateBookId(bookId);
    const book = await this.bookModel.findByIdAndUpdate(bookId, { imageUrl }, { new: true });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    return {
      id: book._id.toString(),
      title: book.title,
      description: book.description,
      category: book.category,
      date: book.date,
      author: book.author,
      edition: book.edition,
      price: book.price,
      imageUrl: book.imageUrl,
      state: book.state,
      collectionSlug: book.collectionSlug,
    };
  }

  async findOne(id: string): Promise<BookDto> {
    this.validateBookId(id);
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return {
        id: book._id.toString(),
        title: book.title,
        description: book.description,
        category: book.category,
        date: book.date,
        author: book.author,
        edition: book.edition,
        price: book.price,
        imageUrl: book.imageUrl,
        state: book.state,
        collectionSlug: book.collectionSlug,
    };
  }

  async updateBookImageUrl(bookId: string, imageUrl: string): Promise<Book> {
    this.validateBookId(bookId);
    const book = await this.bookModel.findByIdAndUpdate(bookId, { imageUrl }, { new: true });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }
    return book;
  }
  
}
