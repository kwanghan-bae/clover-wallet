import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
const request = require('supertest');

describe('System Integration (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    post: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    lottoGame: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: BigInt(1), ssoQualifier: 'test@test.com' }),
    },
    winningInfo: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    lottoTicket: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    // 글로벌 인터셉터 수동 등록 (Kotlin 규격 맞춤 확인용)
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1 (GET) - Health Check', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .then(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBe('Hello World!');
      });
  });

  it('/api/v1/lotto/extraction (POST) - Number Generation', () => {
    return request(app.getHttpServer())
      .post('/api/v1/lotto/extraction')
      .send({ method: 'RANDOM' })
      .expect(201)
      .then(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(6);
      });
  });

  it('/api/v1/community/posts (GET) - Community Feed', () => {
    return request(app.getHttpServer())
      .get('/api/v1/community/posts')
      .expect(200)
      .then(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.content).toBeDefined();
      });
  });
});
