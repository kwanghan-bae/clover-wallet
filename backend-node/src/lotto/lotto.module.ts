import { Module } from '@nestjs/common';
import { LottoController } from './lotto.controller';
import { LottoService } from './lotto.service';
import { ExtractionService } from './extraction.service';
import { LottoNumberExtractor } from './lotto-number.extractor';
import { WinningInfoCrawlerService } from './winning-info-crawler.service';
import { WinningCheckService } from './winning-check.service';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notification/notification.module';

/**
 * 로또 번호 생성, 당첨 확인, 크롤링 기능을 제공하는 모듈입니다.
 */
@Module({
  imports: [UsersModule, NotificationModule],
  controllers: [LottoController],
  providers: [
    LottoService,
    ExtractionService,
    LottoNumberExtractor,
    WinningInfoCrawlerService,
    WinningCheckService,
  ],
  exports: [LottoService, WinningInfoCrawlerService, WinningCheckService],
})
/**
 * @description 로또 번호 추출 및 당첨 정보 관리 등 로또 관련 핵심 로직을 포함하는 모듈입니다.
 */
export class LottoModule {}
