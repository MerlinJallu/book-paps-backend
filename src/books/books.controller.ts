import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors, UploadedFiles, BadRequestException, InternalServerErrorException
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { IBook } from '../book.interface';
import { BookDto } from '../dto/book.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary.service';

interface UploadImageFiles {
  file?: Express.Multer.File[];
  image?: Express.Multer.File[];
}

interface UploadImageResponse extends BookDto {
  url: string;
}

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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]))
  async uploadBookImage(
    @Param('id') bookId: string,
    @UploadedFiles() files: UploadImageFiles,
  ): Promise<UploadImageResponse> {
    const file = files?.file?.[0] ?? files?.image?.[0];

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    let uploadResult;
    try {
      uploadResult = await this.cloudinaryService.uploadImage(file);
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      throw new InternalServerErrorException('Erreur lors de l\'upload de l\'image');
    }

    const imageUrl = uploadResult.secure_url;
    const updatedBook = await this.booksService.updateImageUrl(bookId, imageUrl);

    return {
      ...updatedBook,
      imageUrl,
      url: imageUrl,
    };
  }

}
