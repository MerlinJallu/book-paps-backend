import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from '../book.shema';
import { CreateBookDto } from '../dto/create-book.dto';
import { BookDto } from '../dto/book.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>,) {}

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
      };
    } catch (error) {
      console.error("Erreur lors de la création du livre:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<BookDto> {
    const deletedBook = await this.bookModel.findByIdAndRemove(id);
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
    };
  }

  async update(id: string, bookDto: BookDto): Promise<BookDto> {
    const updatedBook = await this.bookModel.findByIdAndUpdate(id, bookDto, {
      new: true,
    });

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
    };
  }

  async updateImageUrl(bookId: string, imageUrl: string): Promise<BookDto> {
    const book = await this.bookModel.findByIdAndUpdate(bookId, { imageUrl }, { new: true });
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
    };
  }

  async findOne(id: string): Promise<BookDto> {
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
    };
  }

  async updateBookImageUrl(bookId: string, imageUrl: string): Promise<Book> {
    return this.bookModel.findByIdAndUpdate(bookId, { imageUrl }, { new: true });
  }
  
}
