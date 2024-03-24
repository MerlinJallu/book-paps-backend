import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BookSchema } from '../book.shema';
import { CloudinaryModule } from './cloudinary.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }]),
  CloudinaryModule,],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
