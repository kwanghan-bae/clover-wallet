import { Module } from '@nestjs/common';
import { LottoSpotController } from './lotto-spot.controller';
import { LottoSpotService } from './lotto-spot.service';
import { LottoWinningStoreService } from './lotto-winning-store.service';
import { LottoModule } from '../lotto/lotto.module';

@Module({
    imports: [LottoModule],
    controllers: [LottoSpotController],
    providers: [LottoSpotService, LottoWinningStoreService]
})
export class LottoSpotModule { }
