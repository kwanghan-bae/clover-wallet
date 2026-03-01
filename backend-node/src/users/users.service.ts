import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findUser(id: bigint | number | string) {
        const user = await this.prisma.user.findUnique({
            where: { id: BigInt(id) },
        });
        if (!user) {
            throw new NotFoundException(`User not found with id: ${id}`);
        }
        return user;
    }

    async findUserBySsoQualifier(ssoQualifier: string) {
        const user = await this.prisma.user.findUnique({
            where: { ssoQualifier },
        });
        if (!user) {
            throw new NotFoundException(`User not found with SSO qualifier: ${ssoQualifier}`);
        }
        return user;
    }

    async updateUser(id: bigint | number | string, dto: UpdateUserDto) {
        await this.findUser(id); // Ensure user exists

        return this.prisma.user.update({
            where: { id: BigInt(id) },
            data: {
                ...dto,
            },
        });
    }

    async deleteUserAccount(id: bigint | number | string) {
        // Check existence first if strictly needed, or let delete throw if not found
        // But typical "fail if not found" logic implies checking or handling the error.
        try {
            await this.prisma.user.delete({
                where: { id: BigInt(id) },
            });
        } catch (error) {
            // Prisma P2025: Record to delete does not exist.
            if (error.code === 'P2025') {
                throw new NotFoundException(`User not found with id: ${id}`);
            }
            throw error;
        }
    }
}
