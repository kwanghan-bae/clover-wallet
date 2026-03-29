import { Test, TestingModule } from '@nestjs/testing';
import { LottoModule } from './lotto.module';
import { LottoService } from './lotto.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

/**
 * @description LottoModule의 정의 및 의존성 로드 여부를 확인하는 단위 테스트입니다.
 */
describe('LottoModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        LottoModule,
        EventEmitterModule.forRoot(),
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn(),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(module.get<LottoService>(LottoService)).toBeDefined();
  });
});
