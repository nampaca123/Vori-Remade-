import { PrismaClient, TicketStatus } from '@prisma/client';
import { ClaudeClient } from './core/claudeClient';
import { TicketService } from './core/ticketService';
import { CustomError } from '../middlewares/errorHandler';
import { Kafka, Consumer as KafkaConsumer } from 'kafkajs';
import { KAFKA_TOPICS } from '../lib/kafka';
import { logger } from '../middlewares/logger';
import { TranscriptionMessage } from '../types/audio';

export class MeetingService {
  private ticketService: TicketService;
  private consumers: KafkaConsumer[] = [];
  private readonly NUM_WORKERS = 5;  // 파티션 수와 동일하게 설정
  private kafka: Kafka;

  constructor(
    private prisma: PrismaClient,
    private claudeClient: ClaudeClient
  ) {
    this.ticketService = new TicketService(prisma, claudeClient);
    
    this.kafka = new Kafka({
      clientId: 'meeting-service',
      brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
    });
  }

  async initialize() {
    try {
      await this.initializeConsumers();
      console.log('Initialized Kafka consumers');
    } catch (error) {
      console.error('Failed to initialize consumers:', error);
      throw error;
    }
  }

  private async initializeConsumers() {
    for (let i = 0; i < this.NUM_WORKERS; i++) {
      const consumer = this.kafka.consumer({ 
        groupId: `meeting-service-group-${i}` 
      });
      await consumer.connect();
      await consumer.subscribe({ 
        topic: KAFKA_TOPICS.TRANSCRIPTION.COMPLETED 
      });
      this.consumers.push(consumer);
    }
  }

  // 서비스 종료 시 리소스 정리
  async cleanup() {
    await Promise.all(
      this.consumers.map(consumer => consumer.disconnect())
    );
    console.log('Disconnected all Kafka consumers');
  }

  async endMeeting(meetingId: number) {
    try {
      const transcriptResult = await this.waitForTranscript(meetingId);
      
      await this.prisma.meeting.updateMany({
        where: { meetingId },
        data: { transcript: transcriptResult.transcript }
      });

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

      const groupMembers = meeting.group.members.map(member => ({
        userId: member.user.userId,
        name: member.user.name || 'Unknown'
      }));

      const existingTickets = await this.ticketService.getTicketsByMeetingId(meetingId);
      if (!meeting.transcript) {
        throw new CustomError(400, 'No transcript available for analysis');
      }

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
        reject(new Error('Transcript completion timeout'));
      }, 30000);

      const consumer = this.consumers[0];
      if (!consumer) {
        reject(new Error('No Kafka consumer available'));
        return;
      }

      consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = JSON.parse(message.value?.toString() || '{}');
          if (value.meetingId === meetingId && value.status === 'completed') {
            clearTimeout(timeout);
            resolve(value);
            await consumer.disconnect();
          }
        },
      });
    });
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