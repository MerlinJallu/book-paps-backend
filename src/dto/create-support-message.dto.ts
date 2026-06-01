import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum SupportMessageType {
  Bug = 'bug',
  Idea = 'idea',
  Question = 'question',
}

export class CreateSupportMessageDto {
  @IsEnum(SupportMessageType)
  type: SupportMessageType;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  subject: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  message: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pageUrl?: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(200)
  honeypot?: string;
}

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
