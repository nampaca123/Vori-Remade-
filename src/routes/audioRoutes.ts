import express, { Request, Response } from 'express';
import { sendMessage } from '../lib/kafka';
import { KAFKA_TOPICS } from '../lib/kafka';
import { prisma } from '../lib/prisma';

const router = express.Router();

// 오디오 스트림 처리
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { audioData, meetingId, title = "New Meeting", userId = "default-user" } = req.body;
    console.log(`[AudioRoutes] Received audio data for meeting: ${meetingId}`);
    
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
    console.log(`[AudioRoutes] Successfully sent message to Kafka topic: ${KAFKA_TOPICS.AUDIO.RAW}`);

    // Whisper 서버로부터 받은 응답 로깅
    console.log("=".repeat(50));
    console.log("[AudioRoutes] Received response from Whisper server:");
    console.log("Meeting ID:", meetingId);
    console.log("Transcript:", meeting.transcript);
    console.log("=".repeat(50));

    res.status(200).json({ message: 'Audio data received', meeting });
  } catch (error) {
    console.error('[AudioRoutes] Error:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

export default router; 