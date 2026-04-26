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

/**
 * 로또 번호 생성 및 저장을 담당하는 컨트롤러입니다.
 * Kotlin LottoController 로직을 이식함.
 */
@Controller('lotto')
export class LottoController {
  constructor(
    private readonly lottoService: LottoService,
    private readonly extractionService: ExtractionService,
    private readonly lottoInfoService: LottoInfoService,
  ) {}

  /**
   * 내 로또 게임 목록을 조회합니다. (페이징)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('games')
  async getMyGames(
    @Request() req: any,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return this.lottoService.getHistory(req.user.id, +page + 1, +size);
  }

  /**
   * 생성된 로또 번호를 저장합니다.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('games')
  async saveGame(@Request() req: any, @Body() dto: SaveGameDto) {
    // 요청의 userId보다 토큰의 id 우선 사용
    dto.userId = req.user.id.toString();
    return this.lottoService.saveGame(req.user.id, dto);
  }

  /**
   * 다양한 방식(꿈, 사주, 통계 등)으로 로또 번호를 추출합니다.
   */
  @Post('extraction')
  async extractNumbers(@Body() dto: ExtractNumbersDto) {
    const numbers = await this.extractionService.extractLottoNumbers(dto);
    return Array.from(new Set(numbers)).sort((a, b) => a - b);
  }

  /**
   * 다음 추첨 정보를 반환합니다. (현재 회차, 추첨일, 남은 시간 등)
   */
  @Get('next-draw')
  async getNextDraw() {
    return this.lottoInfoService.getNextDrawInfo();
  }

  /**
   * 특정 회차의 당첨 결과를 조회합니다. DB에 없으면 외부 API에서 가져옵니다.
   */
  @Get('draw-result/:round')
  async getDrawResult(@Param('round', ParseIntPipe) round: number) {
    return this.lottoInfoService.getDrawResult(round);
  }
}
