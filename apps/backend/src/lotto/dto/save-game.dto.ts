import {
  IsEnum,
  IsNotEmpty,
  IsArray,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ExtractionMethod } from '../constants/lotto-extraction-data';

export class SaveGameDto {
  /** 사용자 ID */
  @IsNotEmpty()
  @IsNumber()
  userId: number; // BigInt handled in service

  /** 선택된 6개의 로또 번호 배열 */
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsNumber({}, { each: true })
  numbers: number[];

  /** 번호 추출 방식 (자동, 꿈 해몽 등) */
  @IsEnum(ExtractionMethod)
  extractionMethod: ExtractionMethod;
}
