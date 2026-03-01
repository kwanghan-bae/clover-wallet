import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from '../ticket.controller';
import { TicketService } from '../ticket.service';
import { AuthGuard } from '@nestjs/passport';

describe('TicketController', () => {
  let controller: TicketController;
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: {
            getMyTickets: jest.fn(),
            getTicketById: jest.fn(),
            saveScannedTicket: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TicketController>(TicketController);
    service = module.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyTickets', () => {
    it('should call service.getMyTickets', async () => {
      const mockResult = { content: [], totalElements: 0 };
      (service.getMyTickets as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getMyTickets({ user: { id: BigInt(1) } }, 0, 20);
      expect(service.getMyTickets).toHaveBeenCalledWith(BigInt(1), 0, 20);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getTicketDetail', () => {
    it('should call service.getTicketById', async () => {
      const mockTicket = { id: BigInt(1) };
      (service.getTicketById as jest.Mock).mockResolvedValue(mockTicket);

      const result = await controller.getTicketDetail('1');
      expect(service.getTicketById).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockTicket);
    });
  });

  describe('saveScannedTicket', () => {
    it('should call service.saveScannedTicket', async () => {
      const mockTicket = { id: BigInt(1) };
      (service.saveScannedTicket as jest.Mock).mockResolvedValue(mockTicket);

      const result = await controller.saveScannedTicket(
        { user: { id: BigInt(1) } },
        { url: 'test-url', extractionMethod: 'DREAM' },
      );

      expect(service.saveScannedTicket).toHaveBeenCalledWith(BigInt(1), 'test-url', 'DREAM');
      expect(result).toEqual(mockTicket);
    });
  });
});
