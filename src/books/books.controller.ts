import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { IBook } from '../book.interface';
import { BookDto } from '../dto/book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get()
  findAll(): Promise<BookDto[]> {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<BookDto> {
    return this.booksService.findOne(id);
  }

  @Post()
  create(@Body() createBookDto: CreateBookDto): Promise<BookDto> {
    return this.booksService.create(createBookDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<IBook> {
    return this.booksService.delete(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() bookDto: BookDto,
  ): Promise<BookDto> {
    return this.booksService.update(id, bookDto);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBookImage(
    @Param('id') bookId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IBook> {
    try {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      const updatedBook = await this.booksService.updateBookImageUrl(bookId, uploadResult.secure_url);
      return updatedBook;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      throw new Error('Erreur lors de l\'upload de l\'image');
    }
  }

}
