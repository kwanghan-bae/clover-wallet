import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseStrategy } from '../supabase.strategy';
import { ConfigService } from '@nestjs/config';

/**
 * SupabaseStrategy에 대한 단위 테스트입니다.
 */
describe('SupabaseStrategy', () => {
  let strategy: SupabaseStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SUPABASE_JWT_SECRET') return 'test-jwt-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<SupabaseStrategy>(SupabaseStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return mapped user info from payload', async () => {
      const payload = {
        sub: 'user-uuid',
        email: 'test@example.com',
        role: 'authenticated',
      };
      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-uuid',
        email: 'test@example.com',
        role: 'authenticated',
      });
    });
  });
});
