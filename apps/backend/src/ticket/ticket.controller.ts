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


@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMyTickets(
    @Request() req: any,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return this.ticketService.getMyTickets(req.user.id, +page, +size);
  }

  @Get(':id')
  async getTicketDetail(@Param('id') id: string) {
    return this.ticketService.getTicketById(BigInt(id));
  }


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
