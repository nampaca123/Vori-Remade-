import app from './app';
import { connectProducer, createTopics } from './lib/kafka';
import { initializeDatabase } from './lib/prisma';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // DB 초기화
    await initializeDatabase();
    
    // Kafka 토픽 생성
    await createTopics();
    
    // Kafka 프로듀서 연결
    await connectProducer();
    
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
