import { Test, TestingModule } from '@nestjs/testing';
import { CommunityModule } from './community.module';
import { CommunityService } from './community.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * @description CommunityModule의 정의 및 의존성 로드 여부를 확인하는 단위 테스트입니다.
 */
describe('CommunityModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommunityModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(module.get<CommunityService>(CommunityService)).toBeDefined();
  });
});
