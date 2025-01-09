import { PrismaClient } from '@prisma/client'

// 전역 변수 선언
declare global {
  var prisma: PrismaClient | undefined;
}

// 개발 환경에서 핫 리로딩시 여러 인스턴스 생성 방지
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// 기본 데이터 초기화 함수
export const initializeDatabase = async () => {
  try {
    // 1. 기본 그룹 생성
    const defaultGroup = await prisma.group.upsert({
      where: { groupId: 1 },
      update: {},
      create: {
        groupId: 1,
        name: "Default Group"
      }
    });

    // 2. 개발용 테스트 사용자 생성
    if (process.env.NODE_ENV === 'development') {
      const testUser = await prisma.user.upsert({
        where: { firebaseUid: 'test-uid' },
        update: {},
        create: {
          userId: 1,
          email: 'test@example.com',
          name: 'Test User',
          firebaseUid: 'test-uid'
        }
      });

      // 3. 테스트 사용자를 기본 그룹에 추가
      await prisma.groupMember.upsert({
        where: {
          userId_groupId: {
            userId: testUser.userId,
            groupId: defaultGroup.groupId
          }
        },
        update: {},
        create: {
          userId: testUser.userId,
          groupId: defaultGroup.groupId,
          role: 'ADMIN'
        }
      });

      console.log('Test user initialized:', testUser);
    }

    console.log('Default group initialized:', defaultGroup);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}; 