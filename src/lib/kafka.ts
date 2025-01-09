import { Kafka } from 'kafkajs';

// Kafka 토픽 정의
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
  },
  ANALYTICS: {
    TICKET_METRICS: 'analytics.ticket.metrics',
    GROUP_TRENDS: 'analytics.trends.groups'
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
    
    // 모든 토픽 추출
    const allTopics = [
      ...Object.values(KAFKA_TOPICS).flatMap(group => Object.values(group)),
      'analytics.ticket.metrics',
      'analytics.text',
      'analytics.productivity'
    ];

    const topicConfigs = allTopics.map(topic => ({
      topic,
      numPartitions: 5,  // 모든 토픽 5개 파티션으로 통일
      replicationFactor: 1
    }));

    await admin.createTopics({
      topics: topicConfigs,
      waitForLeaders: true
    });

    console.log('Successfully created topics');
    await admin.disconnect();
  } catch (error) {
    console.error('Failed to create Kafka topics:', error);
    throw error;
  }
};

export { kafka, producer, consumer }; 