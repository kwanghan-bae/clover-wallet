import { IsString, IsNotEmpty, IsInt } from 'class-validator';

/**
 * 게시글 댓글 생성을 위한 데이터 전송 객체(DTO)입니다.
 */
export class CreateCommentDto {
  /** 게시글 ID */
  @IsInt() // Assumes client sends integer ID
  @IsNotEmpty()
  postId: number;

  /** 댓글 내용 */
  @IsString()
  @IsNotEmpty()
  content: string;
}
