import express from 'express';
import { GroupService } from '../services/groupService';
import { prisma } from '../lib/prisma';
import { Request } from 'express';

const router = express.Router();
const groupService = new GroupService(prisma);

// Request에 user 프로퍼티 타입 확장
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number;
      }
    }
  }
}

// 그룹 관련 엔드포인트
router.get('/', async (req, res) => {
  // 사용자의 그룹 목록 조회
  const groups = await groupService.getUserGroups(req.user.userId);
  res.json(groups);
});

router.post('/', async (req, res) => {
  // 새 그룹 생성
  const { name } = req.body;
  const group = await groupService.createGroup(name, req.user.userId);
  res.status(201).json(group);
});

// 그룹 멤버 관리
router.post('/:groupId/members', async (req, res) => {
  // 멤버 초대
  const { email } = req.body;
  const { groupId } = req.params;
  await groupService.inviteMember(parseInt(groupId), email, req.user.userId);
  res.status(201).json({ message: 'Member invited successfully' });
});

router.patch('/:groupId/members/:userId', async (req, res) => {
  // 멤버 역할 수정 (ADMIN만 가능)
  const { role } = req.body;
  const { groupId, userId } = req.params;
  await groupService.updateMemberRole(
    parseInt(groupId), 
    parseInt(userId), 
    role,
    req.user.userId
  );
  res.json({ message: 'Member role updated' });
});

router.delete('/:groupId/members/:userId', async (req, res) => {
  // 멤버 제거
  const { groupId, userId } = req.params;
  await groupService.removeMember(
    parseInt(groupId), 
    parseInt(userId), 
    req.user.userId
  );
  res.json({ message: 'Member removed' });
});

export default router; 