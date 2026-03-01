import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from '../ticket.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LottoTicketClient } from '../client/lotto-ticket.client';
import { JsoupTicketParser } from '../client/jsoup-ticket.parser';
import { NotFoundException } from '@nestjs/common';

describe('TicketService', () => {
  let service: TicketService;
  let prisma: PrismaService;
  let client: LottoTicketClient;
  let parser: JsoupTicketParser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: PrismaService,
          useValue: {
            lottoTicket: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            lottoGame: {
              createMany: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb(prisma)),
          },
        },
        {
          provide: LottoTicketClient,
          useValue: {
            getHtmlByUrl: jest.fn(),
          },
        },
        {
          provide: JsoupTicketParser,
          useValue: {
            parse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    prisma = module.get<PrismaService>(PrismaService);
    client = module.get<LottoTicketClient>(LottoTicketClient);
    parser = module.get<JsoupTicketParser>(JsoupTicketParser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyTickets', () => {
    it('should return paginated tickets', async () => {
      (prisma.lottoTicket.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1) }]);
      (prisma.lottoTicket.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getMyTickets(BigInt(1));

      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });
  });

  describe('getTicketById', () => {
    it('should return ticket with games', async () => {
      const mockTicket = { id: BigInt(1), games: [] };
      (prisma.lottoTicket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

      const result = await service.getTicketById(BigInt(1));
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      (prisma.lottoTicket.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getTicketById(BigInt(1))).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveScannedTicket', () => {
    it('should return existing ticket if already scanned', async () => {
      const mockTicket = { id: BigInt(1), url: 'test-url' };
      (prisma.lottoTicket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

      const result = await service.saveScannedTicket(BigInt(1), 'test-url');

      expect(result).toEqual(mockTicket);
      expect(client.getHtmlByUrl).not.toHaveBeenCalled();
    });

    it('should parse and save new ticket', async () => {
      (prisma.lottoTicket.findUnique as jest.Mock).mockResolvedValue(null);
      (client.getHtmlByUrl as jest.Mock).mockResolvedValue('<html></html>');
      (parser.parse as jest.Mock).mockReturnValue({
        ordinal: 1150,
        status: 'WINNING',
        games: [{ status: 'LOSING', number1: 1, number2: 2, number3: 3, number4: 4, number5: 5, number6: 6 }],
      });
      (prisma.lottoTicket.create as jest.Mock).mockResolvedValue({ id: BigInt(2) });

      const result = await service.saveScannedTicket(BigInt(1), 'new-url');

      expect(prisma.lottoTicket.create).toHaveBeenCalled();
      expect(prisma.lottoGame.createMany).toHaveBeenCalled();
      expect(result.id).toBe(BigInt(2));
    });
  });
});
