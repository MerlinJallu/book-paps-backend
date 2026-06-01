import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CollectionDocument = Collection & Document;

@Schema()
export class Collection {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  label: string;

  @Prop({ trim: true, default: '' })
  description?: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
