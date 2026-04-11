import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

/**
 * Prisma 클라이언트를 관리하는 서비스입니다.
 * 데이터베이스 연결 설정 및 생명주기를 관리합니다.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * PrismaService 생성자
   * @param config ConfigService를 통해 환경 변수를 주입받습니다.
   */
  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  /**
   * 모듈 초기화 시 데이터베이스에 연결합니다.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * 모듈 파괴 시 데이터베이스 연결을 해제합니다.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
