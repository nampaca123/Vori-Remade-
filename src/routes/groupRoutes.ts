import express from 'express';
import { GroupService } from '../services/groupService';
import { prisma } from '../lib/prisma';
import { auth } from '../middlewares/auth';

const router = express.Router();
const groupService = new GroupService(prisma);

// 모든 라우트에 인증 미들웨어 적용
router.use(auth.requireAuth);

// 그룹 목록 조회
router.get('/', async (req, res, next) => {
  try {
    const groups = await groupService.getUserGroups(req.user.userId);
    res.json(groups);
  } catch (error) {
    next(error);
  }
});

// 그룹 생성
router.post('/', auth.validateGroupAction('create'), async (req, res, next) => {
  try {
    const { name } = req.body;
    const group = await groupService.createGroup(name, req.user.userId);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
});

// 멤버 초대
router.post('/:groupId/members', auth.validateGroupAction('invite'), async (req, res, next) => {
  try {
    const { email } = req.body;
    const groupId = parseInt(req.params.groupId);
    await groupService.inviteMember(groupId, email, req.user.userId);
    res.status(201).json({ message: 'Member invited successfully' });
  } catch (error) {
    next(error);
  }
});

// 멤버 역할 수정
router.patch('/:groupId/members/:userId', auth.validateGroupAction('updateRole'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const groupId = parseInt(req.params.groupId);
    const userId = parseInt(req.params.userId);
    await groupService.updateMemberRole(groupId, userId, role, req.user.userId);
    res.json({ message: 'Member role updated' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: 그룹 목록 조회
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 그룹 목록 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   groupId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   members:
 *                     type: array
 *                     items:
 *                       type: object
 *   post:
 *     summary: 새 그룹 생성
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: 그룹 생성 성공
 * 
 * /api/groups/{groupId}/members:
 *   post:
 *     summary: 그룹 멤버 초대
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: 멤버 초대 성공
 */

export default router; 