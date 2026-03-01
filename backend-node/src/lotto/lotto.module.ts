import { Module } from '@nestjs/common';
import { LottoController } from './lotto.controller';
import { LottoService } from './lotto.service';
import { ExtractionService } from './extraction.service';
import { LottoNumberExtractor } from './lotto-number.extractor';
import { WinningInfoCrawlerService } from './winning-info-crawler.service';
import { WinningCheckService } from './winning-check.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.service';

/**
 * 로또 번호 생성, 당첨 확인, 크롤링 기능을 제공하는 모듈입니다.
 */
@Module({
  imports: [UsersModule],
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
export class LottoModule {}
