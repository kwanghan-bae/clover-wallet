import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommunityModule } from './community/community.module';
import { LottoModule } from './lotto/lotto.module';
import { LottoSpotModule } from './lotto-spot/lotto-spot.module';
import { PrismaModule } from './prisma/prisma.module';

/**
 * 애플리케이션의 루트 모듈입니다.
 * 모든 하위 도메인 모듈(Auth, Users, Community, Lotto 등)과 전역 설정을 통합합니다.
 */
@Module({
  imports: [
    // 전역 환경변수 설정을 위한 ConfigModule
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 크론잡 스케줄링 기능을 위한 ScheduleModule
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CommunityModule,
    LottoModule,
    LottoSpotModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
