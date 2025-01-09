export interface TranscriptionMessage {
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