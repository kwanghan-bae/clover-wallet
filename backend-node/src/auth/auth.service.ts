import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 사용자 인증 및 권한 부여를 담당하는 서비스 클래스입니다.
 * Kotlin AuthService 로직을 완벽히 이식함.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 로그인 로직: SSO 식별자로 사용자를 찾거나 생성하고 토큰을 발급합니다.
   * @param ssoQualifier SSO 고유 식별자 (sub)
   * @param email 사용자 이메일 (선택)
   */
  async login(ssoQualifier: string, email?: string) {
    const user = await this.usersService.findOrCreateBySsoQualifier(
      ssoQualifier,
      email,
    );

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Refresh Token DB 저장
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 (Kotlin 설정에 맞춤 가능)
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Access Token 갱신 로직
   * @param refreshToken 리프레시 토큰
   */
  async refresh(refreshToken: string) {
    try {
      // 1. Refresh Token 검증
      const payload = this.jwtService.verify(refreshToken);
      const userId = BigInt(payload.sub);

      // 2. DB에서 유효한 토큰인지 확인
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        if (storedToken) {
          await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        }
        throw new UnauthorizedException('유효하지 않거나 만료된 리프레시 토큰입니다');
      }

      // 3. 새 Access Token 발급
      const accessToken = this.generateAccessToken(userId);

      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('토큰 갱신에 실패했습니다');
    }
  }

  /**
   * 로그아웃: 토큰 무효화
   * @param accessToken 액세스 토큰
   * @param refreshToken 리프레시 토큰
   */
  async logout(accessToken: string, refreshToken: string) {
    // 1. Access Token을 블랙리스트에 추가
    try {
      const payload = this.jwtService.decode(accessToken);
      if (payload && payload.exp) {
        await this.prisma.tokenBlacklist.create({
          data: {
            token: accessToken,
            expiresAt: new Date(payload.exp * 1000),
          },
        });
      }
    } catch (e) {
      // Decode 실패 시 무시
    }

    // 2. Refresh Token 삭제
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private generateAccessToken(userId: bigint): string {
    return this.jwtService.sign({ sub: userId.toString() }, { expiresIn: '1h' });
  }

  private generateRefreshToken(userId: bigint): string {
    return this.jwtService.sign({ sub: userId.toString() }, { expiresIn: '7d' });
  }
}
