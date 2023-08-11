import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsInt()
  date?: number;

  @IsOptional() @IsString()
  author?: string;

  @IsOptional() @IsString()
  edition?: string;

  @IsOptional() @IsString()
  price?: string;
}
