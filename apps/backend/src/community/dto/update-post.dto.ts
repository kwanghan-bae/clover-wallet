import { IsString, IsOptional, Length } from 'class-validator';

/**
 * 커뮤니티 게시글 수정을 위한 데이터 전송 객체(DTO)입니다.
 */
export class UpdatePostDto {
  /** 수정할 게시글 제목 (선택 사항) */
  @IsString()
  @IsOptional()
  @Length(1, 255)
  title?: string;

  /** 수정할 게시글 내용 (선택 사항) */
  @IsString()
  @IsOptional()
  content?: string;
}
