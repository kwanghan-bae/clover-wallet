import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateCommentDto {
  /** 게시글 ID */
  @IsInt() // Assumes client sends integer ID
  @IsNotEmpty()
  postId: number;

  /** 댓글 내용 */
  @IsString()
  @IsNotEmpty()
  content: string;

  /** 부모 댓글 ID (대댓글인 경우) */
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
