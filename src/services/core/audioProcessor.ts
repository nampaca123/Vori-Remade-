import WebSocket from 'ws';
import { Server } from 'ws';
import { prisma } from '../../lib/prisma';
import { consumer } from '../../lib/kafka';
import { KAFKA_TOPICS } from '../../lib/kafka';
import { performance } from 'perf_hooks';

interface TranscriptionMessage {
  meetingId: number;
  audioId: number;
  transcript: string;
  timestamp: string;
  metrics?: {
    kafkaDeliveryTime: number;
    whisperProcessingTime: number;
    totalProcessingTime: number;
  };
}

export class AudioProcessor {
  private static instance: AudioProcessor;
  private isProcessing: boolean = false;
  private wsServer: Server;
  private wsClients: Map<string, WebSocket>;

  private constructor() {
    this.wsClients = new Map();
    this.wsServer = new WebSocket.Server({ port: 8080 });
    this.setupWebSocketServer();
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

  static getInstance(): AudioProcessor {
    if (!AudioProcessor.instance) {
      AudioProcessor.instance = new AudioProcessor();
    }
    return AudioProcessor.instance;
  }

  async startProcessing() {
    if (this.isProcessing) return;

    try {
      console.log('[AudioProcessor] Starting audio processor...');
      await consumer.connect();
      console.log('[AudioProcessor] Connected to Kafka');
      
      await consumer.subscribe({ 
        topics: [KAFKA_TOPICS.TRANSCRIPTION.COMPLETED],
        fromBeginning: false 
      });
      console.log('[AudioProcessor] Subscribed to topics:', KAFKA_TOPICS.TRANSCRIPTION.COMPLETED);

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log('[AudioProcessor] Received message from topic:', topic);
          if (!message.value) return;
          await this.processTranscriptionMessage(message);
        },
      });

      this.isProcessing = true;
      console.log('[AudioProcessor] Started successfully');
    } catch (error) {
      console.error('[AudioProcessor] Error starting processor:', error);
      throw error;
    }
  }

  private async processTranscriptionMessage(message: any) {
    const startTime = performance.now();
    
    try {
      const transcriptionMessage = JSON.parse(message.value.toString());
      const { metrics } = transcriptionMessage;
      
      await this.updateDatabase(transcriptionMessage);
      const dbUpdateTime = performance.now() - startTime;
      
      console.log(`
        [AudioProcessor] Processing times for meeting ${transcriptionMessage.meetingId}:
        Kafka to Whisper: ${metrics.kafkaDeliveryTime.toFixed(2)}s
        Whisper processing: ${metrics.whisperProcessingTime.toFixed(2)}s
        Database update: ${dbUpdateTime.toFixed(2)}ms
        Total time: ${metrics.totalProcessingTime.toFixed(2)}s
      `);
      
      this.broadcastTranscription(transcriptionMessage);
    } catch (error) {
      console.error('[AudioProcessor] Error processing message:', error);
    }
  }

  private isValidTranscriptionMessage(msg: any): msg is TranscriptionMessage {
    return msg?.meetingId && msg?.audioId && msg?.transcript && msg?.timestamp;
  }

  private async updateDatabase(msg: TranscriptionMessage) {
    await prisma.meeting.update({
      where: { 
        meetingId: msg.meetingId,
        audioId: msg.audioId
      },
      data: { transcript: msg.transcript }
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
}

export default AudioProcessor.getInstance(); 