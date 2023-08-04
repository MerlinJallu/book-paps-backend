import { Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type BookDocument = Book & Document;

@Schema()
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  date: number;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  edition: string;

  @Prop({ required: true })
  price: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
