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

@Module({
  imports: [
    // 전역 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'test',
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
export class AppModule {}
