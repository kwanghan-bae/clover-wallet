import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFollow(followerId: bigint, followingId: bigint) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      await this.prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }
    await this.prisma.follow.create({ data: { followerId, followingId } });
    return { following: true };
  }

  async getCounts(userId: bigint) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  async getFollowers(userId: bigint, page: number, size: number) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      skip: page * size,
      take: size,
      include: { follower: { select: { id: true, ssoQualifier: true, badges: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFollowing(userId: bigint, page: number, size: number) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      skip: page * size,
      take: size,
      include: { following: { select: { id: true, ssoQualifier: true, badges: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFollowingIds(userId: bigint): Promise<bigint[]> {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    return follows.map((f) => f.followingId);
  }
}
