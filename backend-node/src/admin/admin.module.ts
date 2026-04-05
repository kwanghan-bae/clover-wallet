import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LottoSpotModule } from '../lotto-spot/lotto-spot.module';

@Module({
  imports: [PrismaModule, LottoSpotModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
