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

  async processAudioStream(audioData: string, audioId: number, meetingId: number) {
    // 1. Kafka로 오디오 데이터 전송
    await sendMessage(KAFKA_TOPICS.AUDIO.RAW, {
      meetingId,
      audioId,
      audioData,
      timestamp: new Date().toISOString()
    });

    // 2. Meeting 레코드 upsert
    let meeting = await this.prisma.meeting.upsert({
      where: { audioId },
      update: {},
      create: {
        audioId,
        meetingId,
        transcript: null,
        groupId: 1
      }
    });

    return meeting;
  }

  async endMeeting(meetingId: number) {
    // 1. 미팅 정보 조회
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

    // 2. 그룹 멤버 목록 추출
    const groupMembers = meeting.group.members.map(member => ({
      userId: member.user.userId,
      name: member.user.name || 'Unknown'
    }));

    // 3. 기존 티켓 조회
    const existingTickets = await this.ticketService.getTicketsByMeetingId(meetingId);

    // 4. Claude 분석 요청
    const analysis = await this.claudeClient.analyzeTranscript(
      meeting.transcript || '',
      existingTickets,
      groupMembers
    );

    // 5. 분석 결과 처리
    const tickets = await this.ticketService.processTranscript(meetingId, analysis);
    return tickets;
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