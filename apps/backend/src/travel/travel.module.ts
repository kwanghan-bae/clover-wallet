import { Module } from '@nestjs/common';
import { TravelService } from './travel.service';
import { TravelController } from './travel.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * 여행 플랜 관련 기능을 제공하는 모듈입니다.
 */
@Module({
  imports: [PrismaModule],
  controllers: [TravelController],
  providers: [TravelService],
  exports: [TravelService],
})
export class TravelModule {}
