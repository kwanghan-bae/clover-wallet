import { IsString, IsNotEmpty, IsNumber, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsInt() // Assumes client sends integer ID
  @IsNotEmpty()
  postId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
