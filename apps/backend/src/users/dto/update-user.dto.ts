import { IsOptional, IsString, IsInt, Min } from 'class-validator';


export class UpdateUserDto {
  /** 사용 언어 및 지역 설정 (예: ko, en) */
  @IsOptional()
  @IsString()
  locale?: string;

  /** 사용자 나이 */
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;
}
