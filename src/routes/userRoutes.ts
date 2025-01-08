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

export default router;