import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCollectionDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  label: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  description?: string;
}

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
