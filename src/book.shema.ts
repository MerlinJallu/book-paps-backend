import { Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type BookDocument = Book & Document;

@Schema()
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop()
  date: number;

  @Prop()
  author: string;

  @Prop()
  edition: string;

  @Prop()
  price: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
