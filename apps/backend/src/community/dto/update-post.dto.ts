import { IsString, IsOptional, Length } from 'class-validator';


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
