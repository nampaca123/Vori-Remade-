import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const router = express.Router();

// 회의 생성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, userId } = req.body;
    const meeting = await prisma.meeting.create({
      data: {
        id: crypto.randomUUID(),
        title,
        userId
      }
    });
    res.json(meeting);
  } catch (error) {
    res.status(400).json({ error: '회의 생성 실패' });
  }
});

// 회의 목록 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const meetings = await prisma.meeting.findMany({
      include: { 
        tickets: true  // user 대신 tickets만 include
      }
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: '회의 목록 조회 실패' });
  }
});

export default router; 