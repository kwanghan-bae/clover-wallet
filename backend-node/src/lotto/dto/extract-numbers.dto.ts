import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { ExtractionMethod } from '../constants/lotto-extraction-data';

export class ExtractNumbersDto {
  @IsEnum(ExtractionMethod)
  method: ExtractionMethod;

  @IsOptional()
  @IsString()
  dreamKeyword?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  personalKeywords?: string[];

  @IsOptional()
  @IsString()
  natureKeyword?: string;

  @IsOptional()
  @IsString()
  divinationKeyword?: string;

  @IsOptional()
  @IsString()
  colorKeyword?: string;

  @IsOptional()
  @IsString()
  animalKeyword?: string;
}
