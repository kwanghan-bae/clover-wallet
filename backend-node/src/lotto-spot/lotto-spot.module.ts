import { Module } from '@nestjs/common';
import { LottoSpotController } from './lotto-spot.controller';
import { LottoSpotService } from './lotto-spot.service';
import { LottoWinningStoreService } from './lotto-winning-store.service';
import { LottoModule } from '../lotto/lotto.module';

/**
 * 로또 판매점 및 당첨 판매점 정보를 관리하는 모듈입니다.
 */
@Module({
  imports: [LottoModule],
  controllers: [LottoSpotController],
  providers: [LottoSpotService, LottoWinningStoreService],
})
export class LottoSpotModule {}
