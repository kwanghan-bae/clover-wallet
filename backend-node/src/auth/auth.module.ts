import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SupabaseStrategy } from './supabase.strategy';

/**
 * 인증 기능을 제공하는 모듈입니다.
 * Supabase를 사용한 JWT 전략과 Passport 연동을 관리합니다.
 */
@Module({
  imports: [
    PassportModule,
    ConfigModule, // 전략(Strategy)에서 ConfigService를 사용하기 위해 필요
  ],
  providers: [AuthService, SupabaseStrategy],
  exports: [AuthService],
})
export class AuthModule { }
