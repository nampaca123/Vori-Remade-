import { PrismaClient, Ticket, User } from '@prisma/client';
import { ClaudeClient } from './claudeClient';
import { sendMessage, KAFKA_TOPICS } from '../../lib/kafka';

type TicketStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

type TranscriptAnalysis = {
  newTickets: TicketSuggestion[];
  ticketUpdates: TicketUpdate[];
};

interface TicketSuggestion {
  title: string;
  content: string;
  status: TicketStatus;
  meetingId: number;
  assigneeId?: number;
}

interface TicketUpdate {
  ticketId: string;
  newStatus: TicketStatus;
  assigneeId?: number;
  reason: string;
}

export class TicketService {
  constructor(
    private prisma: PrismaClient,
    private claudeClient: ClaudeClient
  ) {}

  async processTranscript(
    meetingId: number, 
    analysis: TranscriptAnalysis
  ): Promise<Ticket[]> {
    try {
      // 1. 기존 티켓 목록 조회
      const existingTickets = await this.prisma.ticket.findMany({
        where: { meetingId },
        include: {
          assignee: true
        }
      });

      // 2. 트랜스크립트 수집
      const meetings = await this.prisma.meeting.findMany({
        where: { meetingId },
        orderBy: { createdAt: 'asc' }
      });

      if (!meetings.length) {
        throw new Error('Meeting not found');
      }

      // 3. 트랜스크립트 정리
      const fullTranscript = meetings
        .map(m => m.transcript)
        .filter(Boolean)
        .join('\n');

      // 4. 트랜잭션으로 처리
      const result = await this.prisma.$transaction(async (tx) => {
        // 4.1 새 티켓 생성
        const newTickets = await Promise.all(
          analysis.newTickets.map(ticket =>
            tx.ticket.create({
              data: {
                title: ticket.title,
                content: ticket.content,
                status: ticket.status,
                meetingId,
                assigneeId: ticket.assigneeId
              },
              include: {
                assignee: true
              }
            })
          )
        );

        // 4.2 기존 티켓 상태 업데이트
        const updatedTickets = await Promise.all(
          analysis.ticketUpdates.map(update =>
            tx.ticket.update({
              where: { ticketId: update.ticketId },
              data: { 
                status: update.newStatus,
                assigneeId: update.assigneeId
              },
              include: {
                assignee: true
              }
            })
          )
        );

        return { newTickets, updatedTickets };
      });

      // 5. Kafka 이벤트 발행
      await Promise.all([
        sendMessage(KAFKA_TOPICS.TICKET.CREATED, { 
          meetingId, 
          tickets: result.newTickets.map(ticket => ({
            ...ticket,
            assigneeName: ticket.assignee?.name
          }))
        }),
        sendMessage(KAFKA_TOPICS.TICKET.UPDATED, { 
          meetingId, 
          tickets: result.updatedTickets.map(ticket => ({
            ...ticket,
            assigneeName: ticket.assignee?.name
          }))
        })
      ]);

      return [...result.newTickets, ...result.updatedTickets];
    } catch (error) {
      console.error('Error in processTranscript:', error);
      throw error;
    }
  }

  async createTicket({ title, content, meetingId, assigneeId }: { 
    title: string; 
    content: string; 
    meetingId: number;
    assigneeId?: number;
  }) {
    return this.prisma.ticket.create({
      data: {
        title,
        content,
        meetingId,
        assigneeId,
        status: 'TODO'
      },
      include: {
        assignee: true
      }
    });
  }

  async getTicketsByMeetingId(meetingId: number) {
    return this.prisma.ticket.findMany({
      where: { meetingId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: true
      }
    });
  }

  async updateTicket(ticketId: string, data: {
    title?: string;
    content?: string;
    status?: TicketStatus;
    assigneeId?: number;
    reason?: string;
  }) {
    const ticket = await this.prisma.ticket.update({
      where: { ticketId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.status && { status: data.status }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId })
      },
      include: {
        assignee: true
      }
    });

    if (data.status) {
      await sendMessage(KAFKA_TOPICS.TICKET.UPDATED, {
        ticketId,
        status: data.status,
        assigneeId: ticket.assigneeId,
        assigneeName: ticket.assignee?.name,
        reason: data.reason
      });
    }

    return ticket;
  }
}