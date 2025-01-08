import { Request, Response, NextFunction } from 'express';
import { admin } from '../lib/firebase-admin';
import { prisma } from '../lib/prisma';
import { CustomError } from './errorHandler';
import { Role } from '@prisma/client';

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number;
        email: string;
        name: string | null;
        firebaseUid: string;
      }
    }
  }
}

// Role enum은 Prisma가 자동 생성한 것을 사용

export const auth = {
  // 기본 인증
  requireAuth: async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
      const testUser = await prisma.user.findUnique({
        where: { firebaseUid: 'test-uid' }
      });
      
      if (!testUser) {
        throw new CustomError(500, 'Test user not found. Did you run initializeDatabase?');
      }
      
      req.user = testUser;
      return next();
    }

    // 프로덕션 환경에서는 기존 Firebase 인증 로직 실행
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) throw new CustomError(401, 'No token provided');
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });
      
      if (!user) throw new CustomError(404, 'User not found');
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  },

  // 입력 검증 + 권한 검증이 필요한 경우
  validateGroupAction: (action: 'create' | 'invite' | 'updateRole') => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 1. 기본 인증
        if (!req.user) throw new CustomError(401, 'Authentication required');

        // 2. 입력 검증
        switch (action) {
          case 'create':
            if (!req.body.name?.trim()) {
              throw new CustomError(400, 'Group name is required');
            }
            break;
            
          case 'invite':
            if (!req.body.email || !req.body.email.includes('@')) {
              throw new CustomError(400, 'Valid email is required');
            }
            break;
            
          case 'updateRole':
            if (!Object.values(Role).includes(req.body.role)) {
              throw new CustomError(400, 'Invalid role');
            }
            break;
        }

        // 3. 권한 검증 (ADMIN 체크가 필요한 경우)
        if (action !== 'create') {
          const groupId = parseInt(req.params.groupId);
          const member = await prisma.groupMember.findFirst({
            where: {
              groupId,
              userId: req.user.userId,
              role: Role.ADMIN
            }
          });
          
          if (!member) {
            throw new CustomError(403, 'Admin permission required');
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}; 