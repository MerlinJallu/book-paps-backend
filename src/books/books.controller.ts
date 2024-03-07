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
  Req,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { IBook } from '../book.interface';
import { BookDto } from '../dto/book.dto';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll(): Promise<BookDto[]> {
    return this.booksService.findAll();
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
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BookDto> {
    const result = await this.cloudinaryService.uploadImage(file); // Utilise CloudinaryService pour uploader l'image
    const imageUrl = result.url; // Obtient l'URL de l'image depuis le résultat
    return this.booksService.update(id, { imageUrl }); // Met à jour le livre avec la nouvelle URL de l'image
  }
}
