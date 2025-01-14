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
  private consumer: KafkaConsumer;

  constructor(
    private prisma: PrismaClient,
    private claudeClient: ClaudeClient
  ) {
    this.ticketService = new TicketService(prisma, claudeClient);
    
    const kafka = new Kafka({
      clientId: 'meeting-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    });

    this.consumer = kafka.consumer({ groupId: 'meeting-service-group' });
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

  private async waitForTranscript(meetingId: number): Promise<TranscriptionMessage> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Transcript completion timeout'));
      }, 30000);

      this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = JSON.parse(message.value?.toString() || '{}');
          if (value.meetingId === meetingId && value.status === 'completed') {
            clearTimeout(timeout);
            resolve(value);
            await this.consumer.disconnect();
          }
        },
      });

      this.consumer.subscribe({ 
        topic: KAFKA_TOPICS.TRANSCRIPTION.COMPLETED,
        fromBeginning: false 
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