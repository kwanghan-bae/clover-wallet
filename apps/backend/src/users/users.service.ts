import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * 사용자 정보 관리 및 비즈니스 로직을 처리하는 서비스입니다.
 */
@Injectable()
export class UsersService {
  /**
   * Prisma 서비스를 주입받습니다.
   * @param prisma 데이터베이스 접근 서비스
   */
  constructor(private prisma: PrismaService) {}

  /**
   * 특정 ID를 가진 사용자를 조회합니다.
   * @param id 사용자 ID
   * @throws NotFoundException 사용자를 찾을 수 없는 경우
   */
  async findUser(id: bigint | number | string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
    });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    return user;
  }

  /**
   * SSO 식별자(ssoQualifier)로 사용자를 조회합니다.
   * @param ssoQualifier SSO 고유 식별자
   * @param throwError 사용자를 찾지 못했을 때 예외 발생 여부
   */
  async findUserBySsoQualifier(ssoQualifier: string, throwError = true) {
    const user = await this.prisma.user.findUnique({
      where: { ssoQualifier },
    });
    if (!user && throwError) {
      throw new NotFoundException(
        `User not found with SSO qualifier: ${ssoQualifier}`,
      );
    }
    return user;
  }

  /**
   * SSO 식별자로 사용자를 찾거나, 없으면 새로 생성합니다.
   * @param ssoQualifier SSO 고유 식별자
   * @param email 사용자 이메일 (선택 사항)
   */
  async findOrCreateBySsoQualifier(ssoQualifier: string, email?: string) {
    const existingUser = await this.findUserBySsoQualifier(ssoQualifier, false);

    if (existingUser) {
      // 이메일이 변경되었거나 새로 추가된 경우 업데이트
      if (email && existingUser.email !== email) {
        return this.prisma.user.update({
          where: { id: existingUser.id },
          data: { email },
        });
      }
      return existingUser;
    }

    // 신규 사용자 생성
    return this.prisma.user.create({
      data: {
        ssoQualifier,
        email,
        age: 0,
        locale: 'ko',
      },
    });
  }

  /**
   * 사용자의 프로필 정보를 업데이트합니다.
   * @param id 사용자 ID
   * @param dto 업데이트할 정보
   */
  async updateUser(id: bigint | number | string, dto: UpdateUserDto) {
    await this.findUser(id); // 존재 여부 확인

    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        ...dto,
      },
    });
  }

  /**
   * 사용자의 계정을 삭제(회원 탈퇴)합니다. 연관된 데이터는 Cascade 옵션으로 삭제됩니다.
   * @param id 사용자 ID
   */
  async deleteUserAccount(id: bigint | number | string) {
    try {
      // Prisma schema에 onDelete: Cascade가 설정되어 있으므로 user 삭제 시 연관 데이터가 함께 삭제됨
      await this.prisma.user.delete({
        where: { id: BigInt(id) },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User not found with id: ${id}`);
      }
      throw error;
    }
  }

  /**
   * 사용자의 게임 통계 정보(총 게임 수, 당첨금 합계, 수익률 등)를 계산하여 반환합니다.
   * @param userId 사용자 ID
   */
  async getUserStats(userId: bigint | number | string) {
    const id = BigInt(userId);

    // 총 게임 수 조회
    const totalGames = await this.prisma.lottoGame.count({
      where: { userId: id },
    });

    // 총 당첨금 합계 조회
    const aggregate = await this.prisma.lottoGame.aggregate({
      where: { userId: id },
      _sum: {
        prizeAmount: true,
      },
    });
    const totalWinnings = aggregate._sum.prizeAmount || BigInt(0);

    // 총 지출 (1게임당 1000원 가정)
    const totalSpent = BigInt(totalGames) * BigInt(1000);

    // 수익률(ROI) 계산
    let roi = 0;
    if (totalSpent > BigInt(0)) {
      const profit = Number(totalWinnings) - Number(totalSpent);
      roi = Math.round((profit / Number(totalSpent)) * 100);
    }

    return {
      totalGames,
      totalWinnings,
      totalSpent,
      roi,
    };
  }
}
