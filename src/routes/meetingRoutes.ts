import express from 'express';
import { MeetingService } from '../services/meetingService';
import { prisma } from '../lib/prisma';
import { ClaudeClient } from '../services/core/claudeClient';
import { auth } from '../middlewares/auth';

const router = express.Router();
const claudeClient = new ClaudeClient(prisma);
const meetingService = new MeetingService(prisma, claudeClient);

// 모든 라우터에 인증 미들웨어 적용
router.use(auth.requireAuth);

// 회의 목록 조회
router.get('/', async (req, res) => {
  try {
    const meetings = await meetingService.getMeetings();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         프로덕션 환경: Firebase ID 토큰 필요
 *         개발 환경: 토큰 불필요 (테스트 사용자로 자동 인증, groupId: 1 자동 할당)
 *   
 *   schemas:
 *     Meeting:
 *       type: object
 *       properties:
 *         audioId:
 *           type: integer
 *           description: 오디오 식별자
 *         meetingId:
 *           type: integer
 *           description: 회의 식별자
 *         transcript:
 *           type: string
 *           nullable: true
 *           description: 음성 인식 결과 (처리 전에는 null)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 회의 생성 시간
 *         groupId:
 *           type: integer
 *           description: 그룹 식별자 (개발환경에서는 1)
 *       example:
 *         audioId: 315
 *         meetingId: 131
 *         transcript: "James will write the document tomorrow. And Julia is designing the UI right now."
 *         createdAt: "2025-01-09T07:33:23.446Z"
 *         groupId: 1
 *     
 *     Ticket:
 *       type: object
 *       properties:
 *         ticketId:
 *           type: string
 *           format: uuid
 *           description: 티켓 고유 식별자
 *         title:
 *           type: string
 *           description: 티켓 제목
 *         content:
 *           type: string
 *           description: 티켓 내용
 *         status:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
 *           description: 티켓 상태
 *         meetingId:
 *           type: integer
 *           description: 연관된 회의 ID
 *         assigneeId:
 *           type: integer
 *           nullable: true
 *           description: 담당자 ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 시간
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 시간
 *         assignee:
 *           type: object
 *           nullable: true
 *           description: 담당자 정보
 *       example:
 *         ticketId: "b2afe9bb-8744-4103-b151-4c407b0cb01f"
 *         title: "Write document"
 *         content: "James will write the document tomorrow."
 *         status: "TODO"
 *         meetingId: 131
 *         assigneeId: null
 *         createdAt: "2025-01-09T07:33:42.059Z"
 *         updatedAt: "2025-01-09T07:33:42.059Z"
 *         assignee: null
 * 
 * /api/meetings:
 *   get:
 *     summary: 회의 목록 조회
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       사용자의 그룹에 속한 모든 회의 목록을 조회합니다.
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자(groupId: 1)로 자동 인증됩니다.
 *     responses:
 *       200:
 *         description: 회의 목록 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meeting'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch meetings"
 * 
 * /api/meetings/{id}/stream:
 *   post:
 *     summary: 오디오 스트림 처리
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       오디오 데이터를 처리하고 회의 기록을 생성/업데이트합니다.
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audioData:
 *                 type: string
 *                 format: base64
 *                 description: base64로 인코딩된 오디오 데이터
 *               audioId:
 *                 type: integer
 *                 description: 오디오 식별자
 *           example:
 *             audioId: 315
 *             audioData: "GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAAAAaTa6S7j7OBALeK94EB8YICpPCBA7uRs4ITdbeL94EB8YMBLi7wgQQ="
 *     responses:
 *       202:
 *         description: 오디오 처리 시작됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Audio processing started"
 *                 meeting:
 *                   $ref: '#/components/schemas/Meeting'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to process audio"
 * 
 * /api/meetings/{id}/end:
 *   post:
 *     summary: 회의 종료
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       회의를 종료하고 관련 티켓들을 생성합니다.
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회의 ID
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
 *                   example: "Meeting ended"
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to end meeting"
 * 
 * /api/meetings/{id}/tickets:
 *   get:
 *     summary: 회의별 티켓 조회
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       특정 회의에서 생성된 모든 티켓을 조회합니다.
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회의 ID
 *     responses:
 *       200:
 *         description: 티켓 목록 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch tickets"
 * 
 *   post:
 *     summary: 회의 관련 티켓 생성
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       특정 회의에 새로운 티켓을 수동으로 생성합니다.
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 description: 티켓 제목
 *               content:
 *                 type: string
 *                 description: 티켓 내용
 *               assigneeId:
 *                 type: integer
 *                 nullable: true
 *                 description: 담당자 ID
 *           example:
 *             title: "Write document"
 *             content: "James will write the document tomorrow."
 *             assigneeId: null
 *     responses:
 *       201:
 *         description: 티켓 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create ticket"
 * 
 * /api/meetings/{meetingId}/tickets/{ticketId}:
 *   patch:
 *     summary: 티켓 수정
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       특정 티켓의 정보를 수정합니다.
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회의 ID
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: 티켓 ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 수정할 제목
 *               content:
 *                 type: string
 *                 description: 수정할 내용
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *                 description: 수정할 상태
 *               assigneeId:
 *                 type: integer
 *                 nullable: true
 *                 description: 수정할 담당자 ID
 *               reason:
 *                 type: string
 *                 description: 수정 사유
 *           example:
 *             title: "Updated document title"
 *             content: "Updated content"
 *             status: "IN_PROGRESS"
 *             assigneeId: 1
 *             reason: "Adding more details"
 *     responses:
 *       200:
 *         description: 티켓 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update ticket"
 */

export default router;