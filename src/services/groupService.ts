import { PrismaClient, Role } from '@prisma/client';
import { CustomError } from '../middlewares/errorHandler';

export class GroupService {
  constructor(private prisma: PrismaClient) {}

  async getUserGroups(userId: number) {
    return this.prisma.group.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                userId: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  async createGroup(name: string, creatorId: number) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: { name }
      });

      // 생성자를 ADMIN으로 추가
      await tx.groupMember.create({
        data: {
          userId: creatorId,
          groupId: group.groupId,
          role: Role.ADMIN
        }
      });

      return group;
    });
  }

  async inviteMember(groupId: number, email: string, requesterId: number) {
    // 요청자가 ADMIN인지 확인
    await this.validateAdmin(groupId, requesterId);

    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new CustomError(404, 'User not found');
    }

    return this.prisma.groupMember.create({
      data: {
        userId: user.userId,
        groupId,
        role: Role.MEMBER
      }
    });
  }

  async updateMemberRole(
    groupId: number, 
    targetUserId: number, 
    newRole: Role,
    requesterId: number
  ) {
    await this.validateAdmin(groupId, requesterId);

    return this.prisma.groupMember.update({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId
        }
      },
      data: { role: newRole }
    });
  }

  async removeMember(groupId: number, targetUserId: number, requesterId: number) {
    await this.validateAdmin(groupId, requesterId);

    return this.prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId
        }
      }
    });
  }

  private async validateAdmin(groupId: number, userId: number) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!membership || membership.role !== Role.ADMIN) {
      throw new CustomError(403, 'Admin permission required');
    }
  }
} 