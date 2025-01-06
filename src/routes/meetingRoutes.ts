import express from 'express';
import { MeetingService } from '../services/meetingService';
import { prisma } from '../lib/prisma';
import { ClaudeClient } from '../services/core/claudeClient';

const router = express.Router();
const claudeClient = new ClaudeClient(prisma);
const meetingService = new MeetingService(prisma, claudeClient);

// 회의 생성
router.post('/', async (req, res) => {
  try {
    const { audioId, meetingId } = req.body;
    const meeting = await meetingService.createMeeting(audioId, meetingId);
    res.json(meeting);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create meeting' });
  }
});

// 회의 목록 조회
router.get('/', async (req, res) => {
  try {
    const meetings = await meetingService.getMeetings();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// 오디오 스트림 처리
router.post('/:id/stream', async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const { audioData, audioId } = req.body;
    const meeting = await meetingService.processAudioStream(audioData, audioId, meetingId);
    res.status(202).json({ message: 'Audio processing started', meeting });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// 회의 종료
router.post('/:id/end', async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const tickets = await meetingService.endMeeting(meetingId);
    res.json({ message: 'Meeting ended', tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end meeting' });
  }
});

// 회의별 티켓 조회
router.get('/:id/tickets', async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const tickets = await meetingService.getTicketsByMeetingId(meetingId);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// 회의 관련 티켓 생성
router.post('/:id/tickets', async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const { title, content } = req.body;
    const ticket = await meetingService.createTicket({
      title,
      content,
      meetingId
    });
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create ticket' });
  }
});

// 티켓 상태 업데이트
router.patch('/:id/tickets/:ticketId/status', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, reason } = req.body;
    const ticket = await meetingService.updateTicketStatus(ticketId, status, reason);
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update ticket status' });
  }
});

export default router;