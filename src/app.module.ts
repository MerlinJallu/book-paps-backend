import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { CollectionsModule } from './collections/collections.module';
import { ConfigModule } from '@nestjs/config';

console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI);

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    BooksModule,
    CollectionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
