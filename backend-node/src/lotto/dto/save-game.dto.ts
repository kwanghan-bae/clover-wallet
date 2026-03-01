import { IsEnum, IsNotEmpty, IsArray, IsNumber, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ExtractionMethod } from '../constants/lotto-extraction-data';

export class SaveGameDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number; // BigInt handled in service

    @IsArray()
    @ArrayMinSize(6)
    @ArrayMaxSize(6)
    @IsNumber({}, { each: true })
    numbers: number[];

    @IsEnum(ExtractionMethod)
    extractionMethod: ExtractionMethod;
}
