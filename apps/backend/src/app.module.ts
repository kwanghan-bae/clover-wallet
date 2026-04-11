import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommunityModule } from './community/community.module';
import { LottoModule } from './lotto/lotto.module';
import { LottoSpotModule } from './lotto-spot/lotto-spot.module';
import { TicketModule } from './ticket/ticket.module';
import { TravelModule } from './travel/travel.module';
import { NotificationModule } from './notification/notification.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';

/**
 * 애플리케이션의 루트 모듈입니다.
 * 모든 하위 도메인 모듈들을 통합합니다.
 */
@Module({
  imports: [
    // 전역 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 크론잡 스케줄링
    ScheduleModule.forRoot(),
    // 이벤트 처리기 설정
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    CommunityModule,
    LottoModule,
    LottoSpotModule,
    TicketModule,
    TravelModule,
    NotificationModule,
    PrismaModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
/**
 * @description 애플리케이션의 루트 모듈로, 공통 서비스와 컨트롤러를 통합합니다.
 */
export class AppModule {}
