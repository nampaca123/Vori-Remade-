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

// -------------------- Swagger Documentation --------------------

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: 새로운 회의 생성
 *     tags: [Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audioId
 *               - meetingId
 *             properties:
 *               audioId:
 *                 type: number
 *                 example: 221
 *               meetingId:
 *                 type: number
 *                 example: 101
 *     responses:
 *       200:
 *         description: 회의가 성공적으로 생성됨
 *         content:
 *           application/json:
 *             example:
 *               audioId: 221
 *               meetingId: 101
 *               transcript: null
 *               createdAt: "2024-03-21T05:00:00.000Z"
 */

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: 전체 회의 목록 조회
 *     tags: [Meetings]
 *     responses:
 *       200:
 *         description: 회의 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               - audioId: 221
 *                 meetingId: 101
 *                 transcript: "회의 내용..."
 *                 createdAt: "2024-03-21T05:00:00.000Z"
 *               - audioId: 222
 *                 meetingId: 102
 *                 transcript: "다른 회의 내용..."
 *                 createdAt: "2024-03-21T06:00:00.000Z"
 */

/**
 * @swagger
 * /api/meetings/{id}/stream:
 *   post:
 *     summary: 회의 오디오 스트림 처리
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 회의 ID
 *         example: 101
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audioId
 *               - audioData
 *             properties:
 *               audioId:
 *                 type: number
 *                 example: 221
 *               audioData:
 *                 type: string
 *                 description: Base64로 인코딩된 오디오 데이터
 *                 example: "GkXfo59ChoEBQveBAULygQRC..."
 *     responses:
 *       202:
 *         description: 오디오 처리 시작됨
 *         content:
 *           application/json:
 *             example:
 *               message: "Audio processing started"
 *               meeting:
 *                 audioId: 221
 *                 meetingId: 101
 *                 transcript: null
 *                 createdAt: "2024-03-21T05:00:00.000Z"
 */

/**
 * @swagger
 * /api/meetings/{id}/end:
 *   post:
 *     summary: 회의 종료 및 티켓 생성
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 회의 ID
 *         example: 101
 *     responses:
 *       200:
 *         description: 회의 종료 및 티켓 생성 완료
 *         content:
 *           application/json:
 *             example:
 *               message: "Meeting ended"
 *               tickets:
 *                 - ticketId: "uuid-1"
 *                   title: "API 문서화"
 *                   content: "REST API 문서 작성 필요"
 *                   status: "TODO"
 *                   meetingId: 101
 *                   createdAt: "2024-03-21T05:00:00.000Z"
 *                   updatedAt: "2024-03-21T05:00:00.000Z"
 */

/**
 * @swagger
 * /api/meetings/{id}/tickets:
 *   get:
 *     summary: 회의별 티켓 목록 조회
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 회의 ID
 *         example: 101
 *     responses:
 *       200:
 *         description: 티켓 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               - ticketId: "uuid-1"
 *                 title: "API 문서화"
 *                 content: "REST API 문서 작성 필요"
 *                 status: "TODO"
 *                 meetingId: 101
 *                 createdAt: "2024-03-21T05:00:00.000Z"
 *                 updatedAt: "2024-03-21T05:00:00.000Z"
 */

/**
 * @swagger
 * /api/meetings/{id}/tickets:
 *   post:
 *     summary: 회의 관련 새 티켓 생성
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 회의 ID
 *         example: 101
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "API 문서화"
 *               content:
 *                 type: string
 *                 example: "REST API 문서 작성 필요"
 *     responses:
 *       200:
 *         description: 티켓 생성 성공
 *         content:
 *           application/json:
 *             example:
 *               ticketId: "uuid-1"
 *               title: "API 문서화"
 *               content: "REST API 문서 작성 필요"
 *               status: "TODO"
 *               meetingId: 101
 *               createdAt: "2024-03-21T05:00:00.000Z"
 *               updatedAt: "2024-03-21T05:00:00.000Z"
 */

/**
 * @swagger
 * /api/meetings/{id}/tickets/{ticketId}/status:
 *   patch:
 *     summary: 티켓 상태 업데이트
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 회의 ID
 *         example: 101
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: 티켓 ID
 *         example: "uuid-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - reason
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *                 example: "IN_PROGRESS"
 *               reason:
 *                 type: string
 *                 example: "Development started"
 *     responses:
 *       200:
 *         description: 티켓 상태 업데이트 성공
 *         content:
 *           application/json:
 *             example:
 *               ticketId: "uuid-1"
 *               title: "API 문서화"
 *               content: "REST API 문서 작성 필요"
 *               status: "IN_PROGRESS"
 *               meetingId: 101
 *               createdAt: "2024-03-21T05:00:00.000Z"
 *               updatedAt: "2024-03-21T05:01:00.000Z"
 */