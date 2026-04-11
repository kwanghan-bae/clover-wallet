import { IsString, IsNotEmpty } from 'class-validator';

/**
 * 게시글 댓글 수정을 위한 데이터 전송 객체(DTO)입니다.
 */
export class UpdateCommentDto {
  /** 수정할 댓글 내용 */
  @IsString()
  @IsNotEmpty()
  content: string;
}
