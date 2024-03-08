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
import { extname } from 'path';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    //private readonly cloudinaryService: CloudinaryService,
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
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueName}${extname(file.originalname)}`);
      },
    }),
  }))
  async update(
    @Param('id') id: string,
    @Body() bookDto: BookDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<BookDto> {
    let imageUrl;
    if (file) {
      imageUrl = `/uploads/${file.filename}`;
    }
    
    if (imageUrl) {
      bookDto.imageUrl = imageUrl;
    }

    return this.booksService.update(id, bookDto);
  }

}
