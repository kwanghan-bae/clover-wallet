import { IsString, IsNotEmpty, Length } from 'class-validator';

/**
 * 커뮤니티 게시글 생성을 위한 데이터 전송 객체(DTO)입니다.
 */
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
