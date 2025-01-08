import { Kafka } from 'kafkajs';

// Kafka 클픽 정의
export const KAFKA_TOPICS = {
  AUDIO: {
    RAW: 'audio.raw',
    PROCESSED: 'audio.processed'
  },
  TRANSCRIPTION: {
    PENDING: 'transcription.pending',
    COMPLETED: 'transcription.completed'
  },
  MEETING: {
    CREATED: 'meeting.created',
    UPDATED: 'meeting.updated',
    SUMMARY: 'meeting.summary'
  },
  TICKET: {
    CREATED: 'ticket.created',
    UPDATED: 'ticket.updated',
    EXTRACTED: 'ticket.extracted'
  }
};

// Kafka 클라이언트 설정
const kafka = new Kafka({
  clientId: 'vori-backend',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

// 프로듀서 인스턴스 생성
const producer = kafka.producer();
const admin = kafka.admin();

// 컨슈머 인스턴스 생성
const consumer = kafka.consumer({ 
  groupId: 'vori-audio-processing-group' 
});

// 프로듀서 연결 함수
export const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Producer connected to Kafka');
  } catch (error) {
    console.error('Failed to connect producer:', error);
  }
};

// 메시지 전송 함수
export const sendMessage = async (topic: string, message: any) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

// 토픽 생성 함수
export const createTopics = async () => {
  try {
    console.log('Creating Kafka topics...');
    await admin.connect();
    
    // 모든 토픽을 평면화된 배열로 변환
    const topics = [
      KAFKA_TOPICS.AUDIO.RAW,
      KAFKA_TOPICS.AUDIO.PROCESSED,
      KAFKA_TOPICS.TRANSCRIPTION.PENDING,
      KAFKA_TOPICS.TRANSCRIPTION.COMPLETED,
      KAFKA_TOPICS.MEETING.CREATED,
      KAFKA_TOPICS.MEETING.UPDATED,
      KAFKA_TOPICS.MEETING.SUMMARY,
      KAFKA_TOPICS.TICKET.CREATED,
      KAFKA_TOPICS.TICKET.UPDATED,
      KAFKA_TOPICS.TICKET.EXTRACTED
    ];

    // 오디오 처리 관련 토픽만 파티션 수 증가
    const topicConfigs = [
      {
        topic: KAFKA_TOPICS.AUDIO.RAW,
        numPartitions: 5,  // 오디오 입력 파티션
        replicationFactor: 1
      },
      {
        topic: KAFKA_TOPICS.AUDIO.PROCESSED,
        numPartitions: 5,  // 처리� 오디오 파티션
        replicationFactor: 1
      },
      // 나머지 토픽들은 기본값 유지
      ...topics.filter(t => ![KAFKA_TOPICS.AUDIO.RAW, KAFKA_TOPICS.AUDIO.PROCESSED].includes(t))
        .map(topic => ({
          topic,
          numPartitions: 1,
          replicationFactor: 1
        }))
    ];

    await admin.createTopics({ topics: topicConfigs });

    console.log('Successfully created topics:', topics);
    await admin.disconnect();
  } catch (error) {
    console.error('Failed to create Kafka topics:', error);
    throw error;
  }
};

export { kafka, producer, consumer }; 