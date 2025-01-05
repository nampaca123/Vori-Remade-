import express, { Request, Response } from 'express';
import { sendMessage } from '../lib/kafka';
import { KAFKA_TOPICS } from '../lib/kafka';
import { prisma } from '../lib/prisma';
import { performance } from 'perf_hooks';

const router = express.Router();

// 오디오 스트림 처리
router.post('/stream', async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    const { audioData, meetingId, title = "New Meeting", userId = "default-user" } = req.body;
    
    // Meeting 존재 여부 확인
    let meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    });

    // Meeting이 없으면 생성
    if (!meeting) {
      console.log(`[AudioRoutes] Creating new meeting with ID: ${meetingId}`);
      meeting = await prisma.meeting.create({
        data: {
          id: meetingId,
          title,
          userId
        }
      });
      console.log(`[AudioRoutes] Created new meeting:`, meeting);
    }
    
    // Kafka로 raw 오디오 데이터 전송
    await sendMessage(KAFKA_TOPICS.AUDIO.RAW, {
      meetingId,
      audioData,
      timestamp: new Date().toISOString()
    });

    console.log(`[AudioRoutes] Time to process and send to Kafka: ${performance.now() - startTime}ms`);

    // 즉시 응답
    res.status(202).json({ 
      message: 'Audio processing started', 
      meetingId 
    });
    
  } catch (error) {
    console.error('[AudioRoutes] Error:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

export default router; 