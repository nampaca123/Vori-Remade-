import { PrismaClient, TicketStatus } from '@prisma/client';
import { ClaudeClient } from './core/claudeClient';
import { TicketService } from './core/ticketService';
import { sendMessage, KAFKA_TOPICS } from '../lib/kafka';
import { CustomError } from '../middlewares/errorHandler';

export class MeetingService {
  private ticketService: TicketService;

  constructor(
    private prisma: PrismaClient,
    private claudeClient: ClaudeClient
  ) {
    this.ticketService = new TicketService(prisma, claudeClient);
  }

  async processAudioStream(audioData: string, audioId: number, meetingId: number, userId: number) {
    // 사용자의 그룹 확인
    const userGroup = await this.prisma.groupMember.findFirst({
      where: { userId },
      select: { groupId: true }
    });

    if (!userGroup) {
      throw new CustomError(404, 'User must belong to a group to create meetings');
    }

    // Kafka로 오디오 데이터 전송
    await sendMessage(KAFKA_TOPICS.AUDIO.RAW, {
      meetingId,
      audioId,
      audioData,
      timestamp: new Date().toISOString()
    });

    // Meeting 레코드 생성/업데이트
    let meeting = await this.prisma.meeting.upsert({
      where: { audioId },
      update: {},
      create: {
        audioId,
        meetingId,
        transcript: null,
        groupId: userGroup.groupId
      }
    });

    return meeting;
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

      console.log('Meeting transcript:', meeting.transcript); // 디버깅용 로그 추가

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
      console.error('Error in endMeeting:', error);
      throw error;
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