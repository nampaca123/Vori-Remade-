import { PrismaClient, Ticket } from '@prisma/client';
import { ClaudeClient, TicketSuggestion } from './claudeClient';
import { sendMessage, KAFKA_TOPICS } from '../lib/kafka';

export class TicketService {
  constructor(
    private prisma: PrismaClient,
    private claudeClient: ClaudeClient
  ) {}

  async processTranscript(meetingId: number): Promise<Ticket[]> {
    try {
      // 1. 기존 티켓 목록 조회
      const existingTickets = await this.prisma.ticket.findMany({
        where: { meetingId }
      });

      // 2. 트랜스크립트 수집
      const meetings = await this.prisma.meeting.findMany({
        where: { meetingId },
        orderBy: { createdAt: 'asc' }
      });

      if (!meetings.length) {
        throw new Error('Meeting not found');
      }

      // 2. 트랜스크립트 정리
      const fullTranscript = meetings
        .map(m => m.transcript)
        .filter(Boolean)
        .join('\n');

      // 3. Claude API 분석 (기존 티켓 정보 포함)
      const analysis = await this.claudeClient.analyzeTranscript(fullTranscript, existingTickets);

      // 4. 트랜잭션으로 처리
      const result = await this.prisma.$transaction(async (tx) => {
        // 4.1 새 티켓 생성
        const newTickets = await Promise.all(
          analysis.newTickets.map(ticket =>
            tx.ticket.create({
              data: {
                ...ticket,
                meetingId
              }
            })
          )
        );

        // 4.2 기존 티켓 상태 업데이트
        const updatedTickets = await Promise.all(
          analysis.ticketUpdates.map(update =>
            tx.ticket.update({
              where: { ticketId: update.ticketId },
              data: { status: update.newStatus }
            })
          )
        );

        return { newTickets, updatedTickets };
      });

      // 5. Kafka 이벤트 발행
      await Promise.all([
        sendMessage(KAFKA_TOPICS.TICKET.CREATED, { 
          meetingId, 
          tickets: result.newTickets 
        }),
        sendMessage(KAFKA_TOPICS.TICKET.UPDATED, { 
          meetingId, 
          tickets: result.updatedTickets 
        })
      ]);

      return [...result.newTickets, ...result.updatedTickets];
    } catch (error) {
      console.error('Error in processTranscript:', error);
      throw error;
    }
  }
}