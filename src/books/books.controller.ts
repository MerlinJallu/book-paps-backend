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
import { diskStorage } from 'multer';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    // private readonly cloudinaryService: CloudinaryService,
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

  // @Post(':id/upload-image')
  //   @UseInterceptors(FileInterceptor('image'))
  //   async uploadImage(
  //     @Param('id') id: string,
  //     @UploadedFile() file: Express.Multer.File,
  //     @Req() req,
  //   ): Promise<BookDto> {
  //     const imageUrl = 'Votre logique pour obtenir l\'URL de l\'image';
  //     return this.booksService.updateImageUrl(id, imageUrl);
  //   }

}
