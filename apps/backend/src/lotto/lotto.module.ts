import { Module } from '@nestjs/common';
import { LottoController } from './lotto.controller';
import { LottoService } from './lotto.service';
import { ExtractionService } from './extraction.service';
import { LottoInfoService } from './lotto-info.service';
import { LottoNumberExtractor } from './lotto-number.extractor';
import { WinningInfoCrawlerService } from './winning-info-crawler.service';
import { WinningCheckService } from './winning-check.service';
import { WinnerNotificationService } from './winner-notification.service';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notification/notification.module';




@Module({
  imports: [UsersModule, NotificationModule],
  controllers: [LottoController],
  providers: [
    LottoService,
    ExtractionService,
    LottoInfoService,
    LottoNumberExtractor,
    WinningInfoCrawlerService,
    WinningCheckService,
    WinnerNotificationService,
  ],
  exports: [LottoService, WinningInfoCrawlerService, WinningCheckService],
})



export class LottoModule {}
