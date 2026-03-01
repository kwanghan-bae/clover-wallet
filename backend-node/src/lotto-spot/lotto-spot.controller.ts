import { Controller, Get, Post, Param, Query, NotFoundException } from '@nestjs/common';
import { LottoSpotService } from './lotto-spot.service';
import { LottoWinningStoreService } from './lotto-winning-store.service';
import { WinningInfoCrawlerService } from '../lotto/winning-info-crawler.service';

/**
 * 로또 판매점 정보 및 당첨 판매점 크롤링을 담당하는 컨트롤러입니다.
 * Kotlin LottoSpotController 로직을 이식함.
 */
@Controller('lotto-spots')
export class LottoSpotController {
    constructor(
        private readonly lottoSpotService: LottoSpotService,
        private readonly lottoWinningStoreService: LottoWinningStoreService,
        private readonly winningInfoCrawlerService: WinningInfoCrawlerService
    ) { }

    /**
     * 모든 로또 판매점을 페이지네이션하여 조회합니다.
     */
    @Get()
    async getAllLottoSpots(
        @Query('page') page = 0,
        @Query('size') size = 20
    ) {
        return this.lottoSpotService.getAllLottoSpots(+page, +size);
    }

    /**
     * 이름으로 로또 판매점을 검색합니다.
     */
    @Get('search')
    async searchByName(@Query('name') name: string) {
        return this.lottoSpotService.searchByName(name);
    }

    /**
     * 특정 회차의 당첨 판매점 정보를 크롤링하여 저장합니다.
     */
    @Post('crawl/:round')
    async crawlStores(@Param('round') round: string) {
        const result = await this.lottoWinningStoreService.crawlWinningStores(+round);
        return { message: `Crawling started for round ${round}`, result };
    }

    /**
     * 특정 회차의 당첨 정보를 크롤링합니다.
     */
    @Post('winning-info/:round')
    async crawlWinningInfo(@Param('round') round: string) {
        await this.winningInfoCrawlerService.crawlWinningInfo(+round);
        return { message: `Winning Info Crawling started for round ${round}` };
    }

    /**
     * 특정 회차의 당첨 정보를 조회합니다.
     */
    @Get('winning-info/:round')
    async getWinningInfo(@Param('round') round: string) {
        return this.winningInfoCrawlerService.getWinningInfo(+round);
    }

    /**
     * 특정 회차의 당첨 판매점 목록을 조회합니다.
     */
    @Get('winning/:round')
    async getWinningStores(@Param('round') round: string) {
        return this.lottoWinningStoreService.getWinningStores(+round);
    }

    /**
     * 특정 판매점의 역대 당첨 이력을 조회합니다.
     */
    @Get(':spotId/history')
    async getSpotWinningHistory(@Param('spotId') spotId: string) {
        const spot = await this.lottoSpotService.getSpotById(BigInt(spotId));
        if (!spot) {
            throw new NotFoundException("판매점을 찾을 수 없습니다.");
        }
        return this.lottoWinningStoreService.getWinningHistoryByName(spot.name);
    }
}
