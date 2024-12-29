import express, { Request, Response } from 'express';
import { sendMessage } from '../lib/kafka';
import { KAFKA_TOPICS } from '../lib/kafka';

const router = express.Router();

// 오디오 스트림 처리
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { audioData, meetingId } = req.body;
    
    // Kafka로 raw 오디오 데이터 전송
    await sendMessage(KAFKA_TOPICS.AUDIO.RAW, {
      meetingId,
      audioData,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ message: 'Audio data received' });
  } catch (error) {
    res.status(500).json({ error: '오디오 처리 실패' });
  }
});

export default router; 