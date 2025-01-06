import express, { Request, Response } from 'express';
import { TicketService } from '../services/ticketService';
import { prisma } from '../lib/prisma';
import { ClaudeClient } from '../services/claudeClient';

const router = express.Router();
const claudeClient = new ClaudeClient(prisma);
const ticketService = new TicketService(prisma, claudeClient);

// 티켓 생성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, meetingId } = req.body;
    const ticket = await ticketService.createTicket({
      title,
      content,
      meetingId
    });
    res.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(400).json({ error: '티켓 생성 실패' });
  }
});

// 티켓 상태 업데이트
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const ticket = await ticketService.updateTicketStatus(id, status, reason);
    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(400).json({ error: '티켓 업데이트 실패' });
  }
});

// 회의별 티켓 목록 조회
router.get('/meeting/:meetingId', async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const tickets = await ticketService.getTicketsByMeetingId(parseInt(meetingId));
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: '티켓 조회 실패' });
  }
});

export default router; 