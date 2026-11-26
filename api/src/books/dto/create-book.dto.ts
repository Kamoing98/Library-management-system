import {
  IsDateString,
  IsInt,
  IsISBN,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author: string;

  @IsISBN()
  isbn: string;

  // Stored in the `copies` column
  @IsInt()
  @Min(1)
  totalCopies: number;

  @IsUUID()
  genreId: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
