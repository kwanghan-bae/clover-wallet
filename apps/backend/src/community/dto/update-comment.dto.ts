import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
  /** 수정할 댓글 내용 */
  @IsString()
  @IsNotEmpty()
  content: string;
}
