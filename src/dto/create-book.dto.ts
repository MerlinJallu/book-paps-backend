import { IsString, IsInt } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsInt()
  date: number;

  @IsString()
  author: string;

  @IsString()
  edition: string;

  @IsString()
  price: string;
}
