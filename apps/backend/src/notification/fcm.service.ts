import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private isFirebaseInitialized = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccountPath =
        this.configService.get<string>('FIREBASE_KEY_PATH');

      if (serviceAccountPath && !admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.isFirebaseInitialized = true;
        this.logger.log('Firebase Admin SDK 초기화 성공');
      } else if (!serviceAccountPath) {
        this.logger.warn(
          'FIREBASE_KEY_PATH가 설정되지 않았습니다. FCM 기능을 사용할 수 없습니다.',
        );
      }
    } catch (error) {
      this.logger.error('Firebase Admin SDK 초기화 실패', error.stack);
    }
  }

  async registerTokenById(userId: bigint, token: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: token },
    });
    this.logger.log(`사용자 ${userId}의 FCM 토큰 등록 완료 (ID 기반)`);
  }

  async registerToken(ssoQualifier: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { ssoQualifier } });
    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { fcmToken: token },
      });
      this.logger.log(`사용자 ${user.id}의 FCM 토큰 등록 완료`);
    }
  }

  async sendWinningNotification(
    token: string,
    rank: string,
    numbers: number[],
    amount?: bigint,
  ) {
    const amountText = amount ? ` (당첨금: ${amount.toLocaleString()}원)` : '';
    const body = `${rank} 당첨!${amountText} 번호: ${numbers.sort((a, b) => a - b).join(', ')}`;

    await this.sendMessage(token, '🎉 로또 당첨!', body, {
      type: 'WINNING',
      screen: 'history',
      rank,
    });
  }

  async sendBroadcastNotification(
    tokens: string[],
    title: string,
    body: string,
  ) {
    if (!this.isFirebaseInitialized || tokens.length === 0) return;

    const messages = tokens.map((token) => ({
      token,
      notification: { title, body },
      data: { type: 'DRAW_REMINDER' },
    }));

    try {
      const response = await admin.messaging().sendEach(messages);
      this.logger.log(
        `브로드캐스트 전송 완료: 성공 ${response.successCount}, 실패 ${response.failureCount}`,
      );
    } catch (error) {
      this.logger.error('브로드캐스트 전송 실패', error.stack);
    }
  }

  private async sendMessage(
    token: string,
    title: string,
    body: string,
    data: Record<string, string>,
  ) {
    if (!this.isFirebaseInitialized) {
      this.logger.warn(`FCM 미초기화로 알림 전송 스킵: ${body}`);
      return;
    }

    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data,
      });
      this.logger.log(`푸시 알림 전송 성공: ${token}`);
    } catch (error) {
      this.logger.error(`푸시 알림 전송 실패: ${token}`, error.stack);
    }
  }
}
