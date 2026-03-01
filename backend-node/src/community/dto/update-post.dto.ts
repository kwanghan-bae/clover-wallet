import { IsString, IsOptional, Length } from 'class-validator';

export class UpdatePostDto {
    @IsString()
    @IsOptional()
    @Length(1, 255)
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;
}
