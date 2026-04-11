import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

/**
 * 데이터베이스 연결 및 쿼리를 담당하는 Prisma ORM 연동 모듈입니다.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
