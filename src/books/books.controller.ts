import {
  ArgumentsHost,
  Body,
  Catch,
  Controller,
  Delete,
  ExceptionFilter,
  Get,
  Param,
  PayloadTooLargeException,
  Post,
  Put,
  UseFilters,
  UseInterceptors, UploadedFiles, BadRequestException, InternalServerErrorException
} from '@nestjs/common';
import { Response } from 'express';
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

const MAX_UPLOAD_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

@Catch(PayloadTooLargeException)
class UploadImageExceptionFilter implements ExceptionFilter {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(400).json({
      statusCode: 400,
      message: 'Le fichier est trop lourd',
      error: 'Bad Request',
    });
  }
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
  ], {
    limits: {
      fileSize: MAX_UPLOAD_IMAGE_SIZE_BYTES,
    },
    fileFilter: (_request, file, callback) => {
      if (!ALLOWED_UPLOAD_IMAGE_MIME_TYPES.has(file.mimetype)) {
        callback(new BadRequestException('Type de fichier non autorisé'), false);
        return;
      }

      callback(null, true);
    },
  }))
  @UseFilters(UploadImageExceptionFilter)
  async uploadBookImage(
    @Param('id') bookId: string,
    @UploadedFiles() files: UploadImageFiles,
  ): Promise<UploadImageResponse> {
    const file = files?.file?.[0] ?? files?.image?.[0];

    validateUploadImageFile(file);

    await this.booksService.findOne(bookId);

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

function validateUploadImageFile(file?: Express.Multer.File): asserts file is Express.Multer.File {
  if (!file) {
    throw new BadRequestException('Aucun fichier fourni');
  }

  if (!ALLOWED_UPLOAD_IMAGE_MIME_TYPES.has(file.mimetype)) {
    throw new BadRequestException('Type de fichier non autorisé');
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
    throw new BadRequestException('Le fichier est trop lourd');
  }
}
