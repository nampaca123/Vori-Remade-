import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middlewares/errorHandler';

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async syncUser({ email, name, firebaseUid }: {
    email: string;
    name?: string;
    firebaseUid: string;
  }) {
    return this.prisma.user.upsert({
      where: { email },
      update: {
        name,
        firebaseUid
      },
      create: {
        email,
        name,
        firebaseUid
      }
    });
  }

  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: {
        groups: {
          include: {
            group: true
          }
        }
      }
    });

    if (!user) {
      throw new CustomError(404, 'User not found');
    }

    return user;
  }
}