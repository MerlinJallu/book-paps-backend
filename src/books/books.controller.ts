import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { IBook } from '../book.interface';
import { BookDto } from '../dto/book.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(): Promise<BookDto[]> {
    return this.booksService.findAll();
  }

  @Post()
  create(@Body() createBookDto: CreateBookDto): Promise<BookDto> {
    return this.booksService.create(createBookDto);
  }

  @Post(':id/uploadImage')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.booksService.uploadImage(id, file);
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
}
