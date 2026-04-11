import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

/**
 * PrismaService에 대한 단위 테스트입니다.
 * 데이터베이스 연결 설정 및 초기화 여부를 검증합니다.
 */
describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-database-url'),
            getOrThrow: jest.fn().mockReturnValue('mock-database-url'),
          },
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
