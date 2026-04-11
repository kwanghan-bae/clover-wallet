import { Test, TestingModule } from '@nestjs/testing';
import { TravelController } from '../travel.controller';
import { TravelService } from '../travel.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * TravelController에 대한 단위 테스트입니다.
 * 여행 계획 목록 조회 및 상세 조회 기능을 검증합니다.
 */
describe('TravelController', () => {
  let controller: TravelController;
  let service: TravelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TravelController],
      providers: [
        {
          provide: TravelService,
          useValue: {
            getAllTravelPlans: jest.fn(),
            getRecommendedTravelPlans: jest.fn(),
            getTravelPlansBySpot: jest.fn(),
            getTravelPlansByTheme: jest.fn(),
            getTravelPlanById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TravelController>(TravelController);
    service = module.get<TravelService>(TravelService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTravelPlans', () => {
    it('should call service.getAllTravelPlans', async () => {
      await controller.getAllTravelPlans();
      expect(service.getAllTravelPlans).toHaveBeenCalled();
    });
  });

  describe('getTravelPlanById', () => {
    it('should call service.getTravelPlanById', async () => {
      await controller.getTravelPlanById('1');
      expect(service.getTravelPlanById).toHaveBeenCalledWith(BigInt(1));
    });
  });
});
