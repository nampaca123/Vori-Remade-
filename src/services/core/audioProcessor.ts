import WebSocket from 'ws';
import { Server } from 'ws';
import { PrismaClient } from '@prisma/client';
import { Kafka, Consumer as KafkaConsumer } from 'kafkajs';
import { KAFKA_TOPICS } from '../../lib/kafka';
import { performance } from 'perf_hooks';
import { TranscriptionMessage } from '../../types/audio';

export class AudioProcessor {
  private static instance: AudioProcessor;
  private consumers: KafkaConsumer[] = [];
  private readonly numWorkers = 5;
  private wsServer: Server;
  private wsClients: Map<string, WebSocket>;

  private constructor(
    private readonly prisma: PrismaClient,
    private readonly kafka: Kafka
  ) {
    this.wsClients = new Map();
    this.wsServer = new WebSocket.Server({ port: 8080 });
    this.setupWebSocketServer();
  }

  static getInstance(): AudioProcessor {
    if (!AudioProcessor.instance) {
      AudioProcessor.instance = new AudioProcessor(new PrismaClient(), new Kafka({
        clientId: 'vori-backend',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      }));
    }
    return AudioProcessor.instance;
  }

  private setupWebSocketServer() {
    this.wsServer.on('connection', (ws, req) => {
      const meetingId = this.getMeetingIdFromUrl(req.url);
      if (!meetingId) {
        ws.close();
        return;
      }

      this.wsClients.set(meetingId, ws);
      
      ws.on('close', () => {
        this.wsClients.delete(meetingId);
      });

      ws.on('error', () => {
        this.wsClients.delete(meetingId);
        ws.close();
      });
    });
  }

  async startProcessing() {
    try {
      console.log('[AudioProcessor] Starting audio processor...');
      
      // 여러 컨슈머 인스턴스 생성
      for (let i = 0; i < this.numWorkers; i++) {
        const consumer = this.kafka.consumer({ 
          groupId: `vori-audio-processor-${i}`,
          sessionTimeout: 6000,
        });

        await consumer.connect();
        await consumer.subscribe({ 
          topic: KAFKA_TOPICS.TRANSCRIPTION.COMPLETED,
          fromBeginning: false 
        });

        // 각 컨슈머에 대한 메시지 처리 시작
        await this.startWorker(consumer, i);
        this.consumers.push(consumer);
      }

      console.log(`[AudioProcessor] Started ${this.numWorkers} workers successfully`);
    } catch (error) {
      console.error('[AudioProcessor] Error starting processor:', error);
      throw error;
    }
  }

  private async startWorker(consumer: KafkaConsumer, workerId: number) {
    try {
      await consumer.run({
        partitionsConsumedConcurrently: 1,
        eachMessage: async ({ topic, partition, message }) => {
          const startTime = performance.now();
          
          try {
            if (!message.value) return;
            
            const transcriptionMessage: TranscriptionMessage = 
              JSON.parse(message.value.toString());
            
            await this.updateDatabase(transcriptionMessage);
            const dbUpdateTime = performance.now() - startTime;
            
            console.log(`
              [AudioProcessor] Worker ${workerId} processing times:
              Meeting ID: ${transcriptionMessage.meetingId}
              Partition: ${partition}
              Kafka to Whisper: ${transcriptionMessage.metrics?.kafkaDeliveryTime.toFixed(2)}s
              Whisper processing: ${transcriptionMessage.metrics?.whisperProcessingTime.toFixed(2)}s
              Database update: ${dbUpdateTime.toFixed(2)}ms
              Total time: ${transcriptionMessage.metrics?.totalProcessingTime.toFixed(2)}s
            `);
            
            this.broadcastTranscription(transcriptionMessage);
            
          } catch (error) {
            console.error(`[AudioProcessor] Worker ${workerId} failed to process message:`, error);
          }
        }
      });
    } catch (error) {
      console.error(`[AudioProcessor] Worker ${workerId} failed to start:`, error);
      throw error;
    }
  }

  private async updateDatabase(msg: TranscriptionMessage) {
    await this.prisma.meeting.update({
      where: { 
        meetingId: msg.meetingId,
        audioId: msg.audioId
      },
      data: { 
        transcript: msg.transcript
      }
    });
  }

  private getMeetingIdFromUrl(url: string | undefined): string | null {
    if (!url) return null;
    const match = url.match(/\/ws\/([^\/]+)/);
    return match ? match[1] : null;
  }

  private broadcastTranscription(transcriptionMessage: TranscriptionMessage): void {
    const ws = this.wsClients.get(String(transcriptionMessage.meetingId));
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        transcript: transcriptionMessage.transcript,
        timestamp: transcriptionMessage.timestamp
      }));
    }
  }

  async stop() {
    await Promise.all(
      this.consumers.map(consumer => consumer.disconnect())
    );
    this.wsServer.close();
    console.log('[AudioProcessor] All workers and WebSocket server stopped');
  }
}

export default AudioProcessor.getInstance(); 