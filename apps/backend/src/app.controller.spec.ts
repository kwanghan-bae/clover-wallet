import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * AppController에 대한 단위 테스트입니다.
 * 기본 헬스 체크 엔드포인트의 동작을 검증합니다.
 */
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('checkVersion', () => {
    it('should return needsUpdate false for current version', () => {
      const result = appController.checkVersion('1.0.0');
      expect(result).toEqual(
        expect.objectContaining({
          currentVersion: '1.0.0',
          needsUpdate: false,
        }),
      );
    });

    it('should return needsUpdate true for old version', () => {
      const result = appController.checkVersion('0.9.0');
      expect(result).toEqual(
        expect.objectContaining({
          needsUpdate: true,
        }),
      );
    });

    it('should return error message when clientVersion is undefined', () => {
      const result = appController.checkVersion(undefined);
      expect(result).toEqual(
        expect.objectContaining({
          needsUpdate: false,
          hasUpdate: false,
          updateMessage: 'currentVersion 파라미터가 필요합니다.',
        }),
      );
    });
  });
});
