import { PrismaClient, TicketStatus } from '@prisma/client';
import { ClaudeClient } from './core/claudeClient';
import { TicketService } from './core/ticketService';
import { CustomError } from '../middlewares/errorHandler';
import { Kafka, Consumer as KafkaConsumer } from 'kafkajs';
import { KAFKA_TOPICS } from '../lib/kafka';
import { logger } from '../middlewares/logger';
import { TranscriptionMessage } from '../types/audio';

interface KafkaMessagePayload {
  topic: string;
  partition: number;
  message: {
    value: Buffer | null;
    [key: string]: any;
  };
}

export class MeetingService {
  private ticketService: TicketService;
  private consumers: KafkaConsumer[] = [];
  private readonly NUM_PARTITIONS = 5;
  private kafka: Kafka;
  private messageListeners: Array<(payload: KafkaMessagePayload) => Promise<void>> = [];
  private isConsumerRunning: boolean = false;

  constructor(
    private prisma: PrismaClient,
    private claudeClient: ClaudeClient
  ) {
    this.ticketService = new TicketService(prisma, claudeClient);
    
    this.kafka = new Kafka({
      clientId: 'meeting-service',
      brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
    });

    console.log('MeetingService initialized');
  }

  async initialize() {
    try {
      console.log('Starting MeetingService initialization...');
      const consumer = this.kafka.consumer({ 
        groupId: 'meeting-service-group',
        sessionTimeout: 30000
      });
      
      await consumer.connect();
      console.log('Kafka consumer connected');

      await consumer.subscribe({ 
        topic: KAFKA_TOPICS.TRANSCRIPTION.COMPLETED,
        fromBeginning: true
      });
      
      await this.setupMessageHandler(consumer);
      this.consumers.push(consumer);
      
      console.log('Successfully initialized Kafka consumer');
    } catch (error) {
      console.error('Failed to initialize MeetingService:', error);
      throw error;
    }
  }

  private async setupMessageHandler(consumer: KafkaConsumer) {
    if (this.isConsumerRunning) {
      console.log('Consumer is already running');
      return;
    }

    this.isConsumerRunning = true;
    
    try {
      await consumer.run({
        partitionsConsumedConcurrently: this.NUM_PARTITIONS,
        eachMessage: async ({ topic, partition, message }) => {
          console.log(`Processing message from partition ${partition}`);
          try {
            const value = JSON.parse(message.value?.toString() || '{}');
            
            console.log('Received message:', value);
            
            await Promise.all(
              this.messageListeners.map(async (listener) => {
                try {
                  await listener({ topic, partition, message });
                } catch (error) {
                  console.error('Listener error:', error);
                }
              })
            );

            if (!value.meetingId || !value.audioId || !value.groupId) {
              console.warn('Received invalid message format:', value);
              return;
            }

            await this.prisma.meeting.upsert({
              where: { audioId: value.audioId },
              create: {
                audioId: value.audioId,
                meetingId: value.meetingId,
                groupId: value.groupId,
                transcript: value.transcript || '',
              },
              update: {
                transcript: value.transcript || '',
              },
            });
          } catch (error) {
            console.error('Error processing message:', error);
          }
        },
      });
    } catch (error) {
      this.isConsumerRunning = false;
      throw error;
    }
  }

  async cleanup() {
    try {
      await Promise.all(
        this.consumers.map(consumer => consumer.disconnect())
      );
      console.log('Disconnected all Kafka consumers');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async endMeeting(meetingId: number) {
    try {
      const meeting = await this.prisma.meeting.findFirst({
        where: { meetingId },
        include: {
          group: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      userId: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!meeting) {
        throw new CustomError(404, 'Meeting not found');
      }

      if (!meeting.transcript) {
        throw new CustomError(400, 'No transcript available for analysis');
      }

      const groupMembers = meeting.group.members.map(member => ({
        userId: member.user.userId,
        name: member.user.name || 'Unknown'
      }));

      const existingTickets = await this.ticketService.getTicketsByMeetingId(meetingId);

      const analysis = await this.claudeClient.analyzeTranscript(
        meeting.transcript,
        existingTickets,
        groupMembers,
        meetingId
      );

      const tickets = await this.ticketService.processTranscript(meetingId, analysis);
      return tickets;
      
    } catch (error) {
      logger.err(`Meeting ${meetingId} end failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new CustomError(500, 'Failed to process meeting end');
    }
  }

  async waitForTranscript(meetingId: number): Promise<TranscriptionMessage> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeMessageListener(messageHandler);
        reject(new Error('Transcript completion timeout'));
      }, 30000);

      const consumer = this.consumers[0];
      if (!consumer) {
        reject(new Error('No Kafka consumer available'));
        return;
      }

      const messageHandler = async (payload: any) => {
        try {
          const value = JSON.parse(payload.message.value?.toString() || '{}');
          
          if (value.meetingId === meetingId) {
            if (!value.audioId || !value.groupId) {
              throw new Error(
                `Invalid message format: Missing required metadata for meeting ${meetingId}`
              );
            }

            await this.prisma.meeting.upsert({
              where: { audioId: value.audioId },
              create: {
                audioId: value.audioId,
                meetingId: value.meetingId,
                groupId: value.groupId,
                transcript: value.transcript || '',
              },
              update: {
                transcript: value.transcript || '',
              },
            });

            const transcriptionMessage: TranscriptionMessage = {
              meetingId: value.meetingId,
              audioId: value.audioId,
              transcript: value.transcript,
              timestamp: new Date().toISOString(),
              metrics: value.metrics
            };

            clearTimeout(timeout);
            this.removeMessageListener(messageHandler);
            resolve(transcriptionMessage);
          }
        } catch (error) {
          clearTimeout(timeout);
          this.removeMessageListener(messageHandler);
          reject(error);
        }
      };

      this.addMessageListener(messageHandler);
    });
  }

  private addMessageListener(listener: (payload: KafkaMessagePayload) => Promise<void>) {
    this.messageListeners.push(listener);
  }

  private removeMessageListener(listener: (payload: KafkaMessagePayload) => Promise<void>) {
    const index = this.messageListeners.indexOf(listener);
    if (index > -1) {
      this.messageListeners.splice(index, 1);
    }
  }

  async getTicketsByMeetingId(meetingId: number) {
    return this.ticketService.getTicketsByMeetingId(meetingId);
  }

  async createTicket(data: { 
    title: string; 
    content: string; 
    meetingId: number;
    assigneeId?: number;
  }) {
    return this.ticketService.createTicket(data);
  }

  async getMeetings() {
    return this.prisma.meeting.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateTicket(ticketId: string, data: {
    title?: string;
    content?: string;
    status?: TicketStatus;
    assigneeId?: number;
    reason?: string;
  }) {
    return this.ticketService.updateTicket(ticketId, data);
  }
} 