import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}
