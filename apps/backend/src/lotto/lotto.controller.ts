import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LottoService } from './lotto.service';
import { ExtractionService } from './extraction.service';
import { LottoInfoService } from './lotto-info.service';
import { SaveGameDto } from './dto/save-game.dto';
import { ExtractNumbersDto } from './dto/extract-numbers.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('lotto')
export class LottoController {
  constructor(
    private readonly lottoService: LottoService,
    private readonly extractionService: ExtractionService,
    private readonly lottoInfoService: LottoInfoService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('games')
  async getMyGames(
    @Request() req: any,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return this.lottoService.getHistory(req.user.id, +page + 1, +size);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('games')
  async saveGame(@Request() req: any, @Body() dto: SaveGameDto) {
    return this.lottoService.saveGame(req.user.id, dto);
  }

  @Post('extraction')
  async extractNumbers(@Body() dto: ExtractNumbersDto) {
    const numbers = await this.extractionService.extractLottoNumbers(dto);
    return Array.from(new Set(numbers)).sort((a, b) => a - b);
  }

  @Get('next-draw')
  async getNextDraw() {
    return this.lottoInfoService.getNextDrawInfo();
  }

  @Get('draw-result/:round')
  async getDrawResult(@Param('round', ParseIntPipe) round: number) {
    return this.lottoInfoService.getDrawResult(round);
  }
}
