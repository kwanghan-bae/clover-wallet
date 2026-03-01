import { Module } from '@nestjs/common';
import { LottoController } from './lotto.controller';
import { LottoService } from './lotto.service';
import { ExtractionService } from './extraction.service';
import { LottoNumberExtractor } from './lotto-number.extractor';
import { WinningInfoCrawlerService } from './winning-info-crawler.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [LottoController],
    providers: [LottoService, ExtractionService, LottoNumberExtractor, WinningInfoCrawlerService],
    exports: [LottoService, WinningInfoCrawlerService]
})
export class LottoModule { }
