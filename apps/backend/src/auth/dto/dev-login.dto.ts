import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * @description 로컬 dev-login 엔드포인트 페이로드 DTO.
 */
export class DevLoginDto {
  @IsNotEmpty({ message: 'email이 필요합니다' })
  @IsEmail({}, { message: 'email 형식이 올바르지 않습니다' })
  @MaxLength(255)
  email!: string;
}
