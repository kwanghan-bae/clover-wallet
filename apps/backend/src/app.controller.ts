import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly MIN_SUPPORTED_VERSION = '1.0.0';


  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('app/version')
  checkVersion(@Query('currentVersion') clientVersion?: string) {
    if (!clientVersion) {
      return {
        currentVersion: AppController.CURRENT_VERSION,
        minSupportedVersion: AppController.MIN_SUPPORTED_VERSION,
        needsUpdate: false,
        hasUpdate: false,
        updateMessage: 'currentVersion 파라미터가 필요합니다.',
      };
    }

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
    const hasUpdate = compare(clientVersion, AppController.CURRENT_VERSION) < 0;

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
