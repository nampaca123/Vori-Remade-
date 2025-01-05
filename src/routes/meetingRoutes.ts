import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// 회의 생성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { audioId, meetingId } = req.body;
    
    if (!audioId || !meetingId) {
      res.status(400).json({ error: 'audioId and meetingId are required' });
      return;
    }

    const meeting = await prisma.meeting.create({
      data: {
        audioId,
        meetingId,
        transcript: null
      }
    });
    res.json(meeting);
    return;
  } catch (error) {
    res.status(400).json({ error: 'Failed to create meeting' });
    return;
  }
});

// 회의 목록 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const meetings = await prisma.meeting.findMany({
      select: {
        audioId: true,
        meetingId: true,
        transcript: true,
        createdAt: true
      }
    });
    res.json(meetings);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
    return;
  }
});

export default router; 