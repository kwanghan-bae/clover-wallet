import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 애플리케이션의 기본 엔드포인트를 처리하는 컨트롤러입니다.
 */
@Controller()
export class AppController {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly MIN_SUPPORTED_VERSION = '1.0.0';

  /**
   * AppController 생성자
   * @param appService AppService 주입
   */
  constructor(private readonly appService: AppService) {}

  /**
   * 애플리케이션의 헬스체크 또는 인사말을 반환합니다.
   * @returns "Hello World!" 문자열
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * 클라이언트 앱 버전을 확인하고 업데이트 필요 여부를 반환합니다.
   * @param clientVersion 클라이언트가 전달한 현재 버전 문자열
   * @returns 버전 정보 및 업데이트 필요 여부
   */
  @Get('app/version')
  checkVersion(@Query('currentVersion') clientVersion: string) {
    const compare = (a: string, b: string): number => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na !== nb) return na < nb ? -1 : 1;
      }
      return 0;
    };

    const needsUpdate =
      compare(clientVersion, AppController.MIN_SUPPORTED_VERSION) < 0;
    const hasUpdate =
      compare(clientVersion, AppController.CURRENT_VERSION) < 0;

    return {
      currentVersion: AppController.CURRENT_VERSION,
      minSupportedVersion: AppController.MIN_SUPPORTED_VERSION,
      needsUpdate,
      hasUpdate,
      updateMessage: needsUpdate
        ? '최신 버전으로 업데이트가 필요합니다.'
        : hasUpdate
          ? '새로운 버전이 있습니다.'
          : '최신 버전입니다.',
    };
  }
}
