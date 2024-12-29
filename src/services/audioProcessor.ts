import { consumer, producer, KAFKA_TOPICS } from '../lib/kafka';
import path from 'path';
import fs from 'fs/promises';

// 오디오 저장 디렉토리 설정
const AUDIO_DIR = path.join(__dirname, '../../uploads/audio');

interface AudioMessage {
  meetingId: string;
  audioData: string;  // base64 encoded webm
  timestamp: string;
}

export class AudioProcessor {
  private static instance: AudioProcessor;
  private isProcessing: boolean = false;

  private constructor() {
    // 싱글톤 패턴
    this.ensureAudioDirectory();
  }

  static getInstance(): AudioProcessor {
    if (!AudioProcessor.instance) {
      AudioProcessor.instance = new AudioProcessor();
    }
    return AudioProcessor.instance;
  }

  // 오디오 저장 디렉토리 생성
  private async ensureAudioDirectory() {
    try {
      await fs.access(AUDIO_DIR);
    } catch {
      await fs.mkdir(AUDIO_DIR, { recursive: true });
    }
  }

  // 오디오 데이터 저장
  private async saveAudio(meetingId: string, audioData: string): Promise<string> {
    const filename = `${meetingId}_${Date.now()}.webm`;
    const filepath = path.join(AUDIO_DIR, filename);
    
    // base64 디코딩 후 파일 저장
    const buffer = Buffer.from(audioData, 'base64');
    await fs.writeFile(filepath, buffer);
    
    return filepath;
  }

  // 컨슈머 시작
  async startProcessing() {
    if (this.isProcessing) return;
    
    try {
      await consumer.connect();
      await consumer.subscribe({ topic: KAFKA_TOPICS.AUDIO.RAW });
      
      await consumer.run({
        eachMessage: async ({ message }) => {
          const audioMessage: AudioMessage = JSON.parse(message.value?.toString() || '');
          
          // 오디오 파일 저장
          const filepath = await this.saveAudio(
            audioMessage.meetingId, 
            audioMessage.audioData
          );
          
          // 처리된 오디오 정보 전송
          await producer.send({
            topic: KAFKA_TOPICS.AUDIO.PROCESSED,
            messages: [{
              value: JSON.stringify({
                meetingId: audioMessage.meetingId,
                filepath,
                timestamp: audioMessage.timestamp
              })
            }]
          });
        }
      });
      
      this.isProcessing = true;
      console.log('Audio processor started');
      
    } catch (error) {
      console.error('Error in audio processor:', error);
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