import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreatePostDto {
  /** 게시글 제목 */
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  /** 게시글 내용 */
  @IsString()
  @IsNotEmpty()
  content: string;
}
