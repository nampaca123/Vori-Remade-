import app from './app';
import { connectProducer, createTopics } from './lib/kafka';
import { initializeDatabase } from './lib/prisma';
import { MeetingService } from './services/meetingService';
import { prisma } from './lib/prisma';
import { ClaudeClient } from './services/core/claudeClient';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // DB 초기화
    await initializeDatabase();
    
    // Kafka 토픽 생성 및 프로듀서 연결
    await createTopics();
    await connectProducer();
    
    // MeetingService 초기화
    const claudeClient = new ClaudeClient(prisma);
    const meetingService = new MeetingService(prisma, claudeClient);
    await meetingService.initialize();
    
    // MeetingService를 app에서 사용할 수 있도록 설정
    app.set('meetingService', meetingService);
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
