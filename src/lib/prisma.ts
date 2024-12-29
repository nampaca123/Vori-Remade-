import { PrismaClient } from '@prisma/client';

// 전역 변수 선언
declare global {
  var prisma: PrismaClient | undefined;
}

// 개발 환경에서 핫 리로딩시 여러 인스턴스 생성 방지
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 