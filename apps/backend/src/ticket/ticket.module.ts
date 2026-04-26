import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LottoTicketClient } from './client/lotto-ticket.client';
import { JsoupTicketParser } from './client/jsoup-ticket.parser';




@Module({
  imports: [PrismaModule],
  controllers: [TicketController],
  providers: [TicketService, LottoTicketClient, JsoupTicketParser],
  exports: [TicketService],
})
export class TicketModule {}
