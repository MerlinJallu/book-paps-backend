import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BookSchema } from '../book.shema';
import { CloudinaryService } from '../cloudinary.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }]),
],
  providers: [BooksService, CloudinaryService],
  controllers: [BooksController],
})
export class BooksModule {}
