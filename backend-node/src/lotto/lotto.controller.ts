import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LottoService } from './lotto.service';
import { ExtractionService } from './extraction.service';
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
    return this.lottoService.getGamesByUserId(req.user.id, +page, +size);
  }

  /**
   * 생성된 로또 번호를 저장합니다.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('games')
  async saveGame(@Request() req: any, @Body() dto: SaveGameDto) {
    // 요청의 userId보다 토큰의 id 우선 사용
    dto.userId = req.user.id.toString();
    return this.lottoService.saveGeneratedGame(dto);
  }

  /**
   * 다양한 방식(꿈, 사주, 통계 등)으로 로또 번호를 추출합니다.
   */
  @Post('extraction')
  async extractNumbers(@Body() dto: ExtractNumbersDto) {
    const numbers = await this.extractionService.extractLottoNumbers(dto);
    return Array.from(new Set(numbers)).sort((a, b) => a - b);
  }
}
