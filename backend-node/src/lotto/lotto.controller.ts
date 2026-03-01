import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { LottoService } from './lotto.service';
import { ExtractionService } from './extraction.service';
import { WinningInfoCrawlerService } from './winning-info-crawler.service';
import { ExtractNumbersDto } from './dto/extract-numbers.dto';
import { SaveGameDto } from './dto/save-game.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Controller('lotto')
export class LottoController {
  constructor(
    private readonly lottoService: LottoService,
    private readonly extractionService: ExtractionService,
    private readonly usersService: UsersService,
    private readonly winningInfoCrawlerService: WinningInfoCrawlerService
  ) { }

  @Get('games')
  async getMyGames(
    @Query('userId') userIdParam: string,
    @Query('page') page = 0,
    @Query('size') size = 20,
    @Request() req: any
  ) {
    return this.lottoService.getGamesByUserId(BigInt(userIdParam), +page, +size);
  }

  @Post('games')
  async saveGame(@Body() dto: SaveGameDto) {
    return this.lottoService.saveGeneratedGame(dto);
  }

  @Post('extraction')
  async extractNumbers(@Body() dto: ExtractNumbersDto) {
    return this.extractionService.extractLottoNumbers(dto);
  }

  @Post('winning-info/:round')
  async crawlWinningInfo(@Param('round') round: string) {
    await this.winningInfoCrawlerService.crawlWinningInfo(+round);
    return { message: `Winning info crawling started for round ${round}` };
  }

  @Get('winning-info/:round')
  async getWinningInfo(@Param('round') round: string) {
    return this.winningInfoCrawlerService.getWinningInfo(+round);
  }
}
