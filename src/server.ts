import app from './app';
import { connectProducer, createTopics } from './lib/kafka';
import { AudioProcessor } from './services/core/audioProcessor';

const PORT = process.env.PORT || 3000;

// 서버 시작 전 Kafka 설정
const startServer = async () => {
  try {
    // Kafka 토픽 생성
    await createTopics();
    
    // Kafka 프로듀서 연결
    await connectProducer();
    
    // AudioProcessor로 변경
    const audioProcessor = AudioProcessor.getInstance();
    await audioProcessor.startProcessing();
    
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

// 프로세스 종료 시 정리
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
