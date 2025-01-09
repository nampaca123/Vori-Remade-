import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsController {
  // 실시간 미팅 메트릭스 조회
  static async getRealTimeMetrics(req: Request, res: Response) {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const metrics = await prisma.realTimeMetrics.findMany({
        where: { meetingId },
        orderBy: { windowStart: 'desc' },
      });
      
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
      res.status(500).json({ error: 'Failed to fetch realtime metrics' });
    }
  }

  // 티켓 패턴 분석 결과 조회
  static async getTicketPatterns(req: Request, res: Response) {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const patterns = await prisma.ticketPatternAnalysis.findMany({
        where: { meetingId },
        orderBy: { analysisDate: 'desc' },
      });

      res.json(patterns);
    } catch (error) {
      console.error('Error fetching ticket patterns:', error);
      res.status(500).json({ error: 'Failed to fetch ticket patterns' });
    }
  }

  // 시간대별 생산성 패턴 조회
  static async getProductivityPatterns(req: Request, res: Response) {
    try {
      const patterns = await prisma.productivityPattern.findMany({
        orderBy: { hourOfDay: 'asc' },
      });

      res.json(patterns);
    } catch (error) {
      console.error('Error fetching productivity patterns:', error);
      res.status(500).json({ error: 'Failed to fetch productivity patterns' });
    }
  }
} 