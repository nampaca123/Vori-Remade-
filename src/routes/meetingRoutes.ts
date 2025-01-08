import express from 'express';
import { MeetingService } from '../services/meetingService';
import { prisma } from '../lib/prisma';
import { ClaudeClient } from '../services/core/claudeClient';

const router = express.Router();
const claudeClient = new ClaudeClient(prisma);
const meetingService = new MeetingService(prisma, claudeClient);

// 회의 목록 조회
router.get('/', async (req, res) => {
  try {
    const meetings = await meetingService.getMeetings();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// 오디오 스트림 처리 (회의 생성/업데이트 포함)
router.post('/:id/stream', async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    const { audioData, audioId } = req.body;
    const meeting = await meetingService.processAudioStream(
      audioData, 
      audioId, 
      meetingId,
      req.user.userId
    );
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
    const { title, content, assigneeId } = req.body;
    const ticket = await meetingService.createTicket({
      title,
      content,
      meetingId,
      assigneeId
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// 티켓 수정
router.patch('/:meetingId/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { title, content, status, assigneeId, reason } = req.body;
    const ticket = await meetingService.updateTicket(ticketId, {
      title,
      content,
      status,
      assigneeId,
      reason
    });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// -------------------- Swagger Documentation --------------------

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: 회의 목록 조회
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회의 목록 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meeting'
 * 
 * /api/meetings/{id}/stream:
 *   post:
 *     summary: 오디오 스트림 처리
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               audioData:
 *                 type: string
 *               audioId:
 *                 type: integer
 *     responses:
 *       202:
 *         description: 오디오 처리 시작됨
 * 
 * /api/meetings/{id}/end:
 *   post:
 *     summary: 회의 종료
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 회의 종료 및 티켓 생성 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 * 
 * /api/meetings/{id}/tickets:
 *   get:
 *     summary: 회의별 티켓 조회
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 티켓 목록 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *   post:
 *     summary: 회의 관련 티켓 생성
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               assigneeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 티켓 생성 성공
 * 
 * /api/meetings/{meetingId}/tickets/{ticketId}:
 *   patch:
 *     summary: 티켓 수정
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               assigneeId:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 티켓 수정 성공
 */

export default router;