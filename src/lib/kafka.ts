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
    await admin.connect();
    const topics = Object.values(KAFKA_TOPICS).flatMap(group => Object.values(group));
    
    await admin.createTopics({
      topics: topics.map(topic => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1
      }))
    });
    
    console.log('Kafka topics created successfully');
  } catch (error) {
    console.error('Failed to create Kafka topics:', error);
  } finally {
    await admin.disconnect();
  }
};

export { kafka, producer, consumer }; 