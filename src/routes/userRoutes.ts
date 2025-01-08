import express from 'express';
import { UserService } from '../services/userService';
import { prisma } from '../lib/prisma';

const router = express.Router();
const userService = new UserService(prisma);

// Firebase 인증 후 사용자 정보 동기화
router.post('/sync', async (req, res) => {
  const { email, name, firebaseUid } = req.body;
  const user = await userService.syncUser({ email, name, firebaseUid });
  res.status(201).json(user);
});

// 사용자 정보 조회
router.get('/me', async (req, res) => {
  const user = await userService.getUser(req.user.userId);
  res.json(user);
});

/**
 * @swagger
 * /api/users/sync:
 *   post:
 *     summary: Firebase 인증 후 사용자 정보 동기화
 *     tags: [Users]
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
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 */

export default router;