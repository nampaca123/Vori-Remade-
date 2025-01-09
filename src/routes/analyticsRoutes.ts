import express from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { auth } from '../middlewares/auth';

const router = express.Router();

// 모든 라우터에 인증 미들웨어 적용
router.use(auth.requireAuth);

// 실시간 미팅 메트릭스 조회
router.get('/meetings/:meetingId/realtime', AnalyticsController.getRealTimeMetrics);

// 티켓 패턴 분석 결과 조회
router.get('/meetings/:meetingId/ticket-patterns', AnalyticsController.getTicketPatterns);

// 시간대별 생산성 패턴 조회
router.get('/productivity/hourly', AnalyticsController.getProductivityPatterns);

export default router;

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
 *         개발 환경: 토큰 불필요 (테스트 사용자로 자동 인증)
 * 
 * /api/analytics/meetings/{meetingId}/realtime:
 *   get:
 *     summary: 실시간 미팅 메트릭스 조회
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 미팅 ID
 *     responses:
 *       200:
 *         description: 실시간 미팅 메트릭스
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   windowStart:
 *                     type: string
 *                     format: date-time
 *                   windowEnd:
 *                     type: string
 *                     format: date-time
 *                   productivityScore:
 *                     type: number
 *                     description: 생산성 점수 (0-1)
 *                   ticketCount:
 *                     type: integer
 *                     description: 총 티켓 수
 *                   actionableCount:
 *                     type: integer
 *                     description: 실행 가능한 티켓 수
 *       500:
 *         description: 서버 에러
 * 
 * /api/analytics/meetings/{meetingId}/ticket-patterns:
 *   get:
 *     summary: 티켓 패턴 분석 결과 조회
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 미팅 ID
 *     responses:
 *       200:
 *         description: 티켓 패턴 분석 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   avgStatusChangeDuration:
 *                     type: number
 *                     description: 상태 변경 평균 소요 시간
 *                   blockerCount:
 *                     type: integer
 *                     description: 블로커 발생 횟수
 *                   analysisDate:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: 서버 에러
 * 
 * /api/analytics/productivity/hourly:
 *   get:
 *     summary: 시간대별 생산성 패턴 조회
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       개발 환경에서는 Authorization 헤더 없이도 테스트 사용자로 자동 인증됩니다.
 *     responses:
 *       200:
 *         description: 시간대별 생산성 패턴
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hourOfDay:
 *                     type: integer
 *                     description: 시간대 (0-23)
 *                   avgScore:
 *                     type: number
 *                     description: 평균 생산성 점수
 *                   meetingCount:
 *                     type: integer
 *                     description: 회의 수
 *       500:
 *         description: 서버 에러
 */ 