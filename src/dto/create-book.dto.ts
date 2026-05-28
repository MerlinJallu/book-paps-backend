import { Transform } from 'class-transformer';
import { IsString, IsInt, IsOptional, IsNumber } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @Transform(({ value }) => toNumber(value)) @IsInt()
  date?: number;

  @IsOptional() @IsString()
  author?: string;

  @IsOptional() @IsString()
  edition?: string;

  @IsOptional() @Transform(({ value }) => toNumber(value)) @IsNumber()
  price?: number;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsString()
  state?: string;

  @IsOptional() @IsString()
  collectionSlug?: string;
}

function toNumber(value: unknown): unknown {
  if (typeof value !== 'string' || !value.trim()) {
    return value;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : value;
}
