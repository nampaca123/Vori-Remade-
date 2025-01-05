import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// 티켓 생성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, meetingId } = req.body;
    const ticket = await prisma.ticket.create({
      data: { 
        title, 
        content, 
        meetingId,
        status: 'TODO'  // 기본 상태
      }
    });
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: '티켓 생성 실패' });
  }
});

// 티켓 상태 업데이트
router.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const ticket = await prisma.ticket.update({
      where: { ticketId: id },
      data: { status }
    });
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: '티켓 업데이트 실패' });
  }
});

export default router; 