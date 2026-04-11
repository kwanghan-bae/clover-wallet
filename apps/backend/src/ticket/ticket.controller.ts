import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * 로또 티켓 조회 및 등록을 담당하는 컨트롤러입니다.
 * Kotlin TicketController 로직을 이식함.
 */
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * 내 티켓 목록 조회 (페이징)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMyTickets(
    @Request() req: any,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return this.ticketService.getMyTickets(req.user.id, +page, +size);
  }

  /**
   * 티켓 상세 정보 조회
   */
  @Get(':id')
  async getTicketDetail(@Param('id') id: string) {
    return this.ticketService.getTicketById(BigInt(id));
  }

  /**
   * 스캔된 QR 코드를 통한 티켓 등록
   * @param req 인증된 사용자 정보
   * @param body url 및 추출 방식 포함
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('scan')
  async saveScannedTicket(
    @Request() req: any,
    @Body() body: { url: string; extractionMethod?: string },
  ) {
    return this.ticketService.saveScannedTicket(
      req.user.id,
      body.url,
      body.extractionMethod,
    );
  }
}
