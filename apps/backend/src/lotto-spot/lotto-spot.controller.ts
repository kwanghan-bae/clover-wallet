import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LottoSpotService } from './lotto-spot.service';
import { LottoWinningStoreService } from './lotto-winning-store.service';
import { WinningInfoCrawlerService } from '../lotto/winning-info-crawler.service';
import { WinningCheckService } from '../lotto/winning-check.service';

@Controller('lotto-spots')
export class LottoSpotController {
  constructor(
    private readonly lottoSpotService: LottoSpotService,
    private readonly lottoWinningStoreService: LottoWinningStoreService,
    private readonly winningInfoCrawlerService: WinningInfoCrawlerService,
    private readonly winningCheckService: WinningCheckService,
  ) {}

  @Get()
  async getAllLottoSpots(@Query('page') page = 0, @Query('size') size = 20) {
    return this.lottoSpotService.getAllLottoSpots(+page, +size);
  }

  @Get('search')
  async searchByName(@Query('name') name: string) {
    return this.lottoSpotService.searchByName(name);
  }

  @Post('crawl/:round')
  async crawlStores(@Param('round') round: string) {
    const result =
      await this.lottoWinningStoreService.crawlWinningStores(+round);
    return { message: `Crawling started for round ${round}`, result };
  }

  @Post('winning-info/:round')
  async crawlWinningInfo(@Param('round') round: string) {
    await this.winningInfoCrawlerService.crawlWinningInfo(+round);
    return { message: `Winning Info Crawling started for round ${round}` };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('trigger/crawl/:round')
  async triggerCrawl(@Param('round', ParseIntPipe) round: number) {
    await this.winningInfoCrawlerService.crawlWinningInfo(round);
    return { message: `Crawl triggered for round ${round}` };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('trigger/check/:round')
  async triggerCheck(@Param('round', ParseIntPipe) round: number) {
    await this.winningCheckService.checkWinning(round);
    return { message: `Winning check triggered for round ${round}` };
  }

  @Get('winning-info/:round')
  async getWinningInfo(@Param('round') round: string) {
    return this.winningInfoCrawlerService.getWinningInfo(+round);
  }

  @Get('winning/:round')
  async getWinningStores(@Param('round') round: string) {
    return this.lottoWinningStoreService.getWinningStores(+round);
  }

  @Get(':spotId/history')
  async getSpotWinningHistory(@Param('spotId') spotId: string) {
    const spot = await this.lottoSpotService.getSpotById(BigInt(spotId));
    if (!spot) {
      throw new NotFoundException('판매점을 찾을 수 없습니다.');
    }
    return this.lottoWinningStoreService.getWinningHistoryByName(spot.name);
  }
}
