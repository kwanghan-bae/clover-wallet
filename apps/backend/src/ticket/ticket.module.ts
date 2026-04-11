import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LottoTicketClient } from './client/lotto-ticket.client';
import { JsoupTicketParser } from './client/jsoup-ticket.parser';

/**
 * 로또 티켓 관련 기능을 제공하는 모듈입니다.
 */
@Module({
  imports: [PrismaModule],
  controllers: [TicketController],
  providers: [TicketService, LottoTicketClient, JsoupTicketParser],
  exports: [TicketService],
})
export class TicketModule {}
