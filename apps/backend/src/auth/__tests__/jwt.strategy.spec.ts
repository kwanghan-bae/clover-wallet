import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../jwt.strategy';
import { ConfigService } from '@nestjs/config';

/**
 * JwtStrategy에 대한 단위 테스트입니다.
 */
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user id from sub claim', async () => {
      const payload = { sub: '1', email: 'test@example.com' };
      const result = strategy.validate(payload);

      expect(result).toEqual({ id: BigInt(1) });
    });
  });
});
