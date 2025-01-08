import express from 'express';
import { UserService } from '../services/userService';
import { prisma } from '../lib/prisma';
import { auth } from '../middlewares/auth';

const router = express.Router();
const userService = new UserService(prisma);

// Firebase 인증 후 사용자 정보 동기화
router.post('/sync', auth.requireAuth, async (req, res) => {
  const { email, name, firebaseUid } = req.body;
  const user = await userService.syncUser({ email, name, firebaseUid });
  res.status(201).json(user);
});

// 사용자 정보 조회
router.get('/me', auth.requireAuth, async (req, res) => {
  const user = await userService.getUser(req.user.userId);
  res.json(user);
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         프로덕션 환경: Firebase ID 토큰 필요
 *         개발 환경: 토큰 불필요 (테스트 사용자로 자동 인증)
 * 
 * /api/users/sync:
 *   post:
 *     summary: Firebase 인증 후 사용자 정보 동기화
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               firebaseUid:
 *                 type: string
 *     responses:
 *       201:
 *         description: 사용자 정보 동기화 성공
 * 
 * /api/users/me:
 *   get:
 *     summary: 현재 사용자 정보 조회
 *     description: |
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 반환 성공
 */

export default router;