import { consumer, producer, KAFKA_TOPICS } from '../lib/kafka';
import { prisma } from '../lib/prisma';

interface AudioMessage {
  meetingId: string;
  audioData: string;  // base64 encoded webm
  timestamp: string;
}

interface TranscriptionMessage {
  meetingId: string;
  transcript: string;
  timestamp: string;
}

export class AudioProcessor {
  private static instance: AudioProcessor;
  private isProcessing: boolean = false;

  private constructor() {
    // 싱글톤 패턴
  }

  static getInstance(): AudioProcessor {
    if (!AudioProcessor.instance) {
      AudioProcessor.instance = new AudioProcessor();
    }
    return AudioProcessor.instance;
  }

  // 오슈머 시작
  async startProcessing() {
    if (this.isProcessing) return;
    
    try {
      await consumer.connect();
      await consumer.subscribe({ 
        topics: [KAFKA_TOPICS.TRANSCRIPTION.COMPLETED] 
      });
      
      await consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (topic === KAFKA_TOPICS.TRANSCRIPTION.COMPLETED) {
            console.log("=".repeat(50));
            console.log("Received transcription from Whisper:");
            const data = JSON.parse(message.value?.toString() || '');
            console.log("Meeting ID:", data.meetingId);
            console.log("Transcript:", data.transcript);
            console.log("=".repeat(50));
            await this.processTranscriptionMessage(message);
          }
        }
      });
      
      this.isProcessing = true;
      console.log('Audio processor started');
      
    } catch (error) {
      console.error('Error in audio processor:', error);
      throw error;
    }
  }

  private async processTranscriptionMessage(message: any) {
    console.log('[AudioProcessor] Processing transcription message');
    try {
      const transcriptionMessage: TranscriptionMessage = JSON.parse(message.value?.toString() || '');
      console.log(`[AudioProcessor] Parsed transcription for meeting: ${transcriptionMessage.meetingId}`);
      
      await prisma.meeting.update({
        where: { id: transcriptionMessage.meetingId },
        data: { transcript: transcriptionMessage.transcript }
      });
      console.log(`[AudioProcessor] Updated transcript in database for meeting: ${transcriptionMessage.meetingId}`);
    } catch (error) {
      console.error('[AudioProcessor] Error processing transcription:', error);
      throw error;
    }
  }

  // 컨슈머 중지
  async stopProcessing() {
    if (!this.isProcessing) return;
    
    try {
      await consumer.disconnect();
      this.isProcessing = false;
      console.log('Audio processor stopped');
    } catch (error) {
      console.error('Error stopping audio processor:', error);
      throw error;
    }
  }
}

export default AudioProcessor.getInstance(); 