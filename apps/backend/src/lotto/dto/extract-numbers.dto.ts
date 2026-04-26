import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { ExtractionMethod } from '../constants/lotto-extraction-data';


export class ExtractNumbersDto {
  /** 추출 방식 (자동, 꿈 해몽, 생년월일 등) */
  @IsEnum(ExtractionMethod)
  method: ExtractionMethod;

  /** 꿈 해몽 키워드 (꿈 해몽 방식 선택 시) */
  @IsOptional()
  @IsString()
  dreamKeyword?: string;

  /** 생년월일 (생년월일 방식 선택 시) */
  @IsOptional()
  @IsString()
  birthDate?: string;

  /** 개인별 키워드 배열 (키워드 조합 방식 선택 시) */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  personalKeywords?: string[];

  /** 자연환경 키워드 */
  @IsOptional()
  @IsString()
  natureKeyword?: string;

  /** 사주/운세 키워드 */
  @IsOptional()
  @IsString()
  divinationKeyword?: string;

  /** 색상 키워드 */
  @IsOptional()
  @IsString()
  colorKeyword?: string;

  /** 동물 키워드 */
  @IsOptional()
  @IsString()
  animalKeyword?: string;
}
