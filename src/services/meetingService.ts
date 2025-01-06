import { PrismaClient, TicketStatus } from '@prisma/client';
import { ClaudeClient } from './core/claudeClient';
import { TicketService } from './core/ticketService';
import { sendMessage, KAFKA_TOPICS } from '../lib/kafka';

export class MeetingService {
  private ticketService: TicketService;

  constructor(
    private prisma: PrismaClient,
    private claudeClient: ClaudeClient
  ) {
    this.ticketService = new TicketService(prisma, claudeClient);
  }

  async createMeeting(audioId: number, meetingId: number) {
    return this.prisma.meeting.create({
      data: { audioId, meetingId, transcript: null }
    });
  }

  async processAudioStream(audioData: string, audioId: number, meetingId: number) {
    // 1. 먼저 Kafka로 오디오 데이터 전송
    await sendMessage(KAFKA_TOPICS.AUDIO.RAW, {
      meetingId,
      audioId,
      audioData,
      timestamp: new Date().toISOString()
    });

    // 2. Meeting 레코드 upsert (있으면 그대로 두고, 없으면 생성)
    let meeting = await this.prisma.meeting.upsert({
      where: { audioId },
      update: {},  // 이미 존재하면 아무것도 업데이트하지 않음
      create: {    // 없으면 새로 생성
        audioId, 
        meetingId, 
        transcript: null
      }
    });

    return meeting;
  }

  async endMeeting(meetingId: number) {
    // 회의 상태 업데이트 로직
    const tickets = await this.ticketService.processTranscript(meetingId);
    return tickets;
  }

  async getTicketsByMeetingId(meetingId: number) {
    return this.ticketService.getTicketsByMeetingId(meetingId);
  }

  async createTicket(data: { title: string; content: string; meetingId: number }) {
    return this.ticketService.createTicket(data);
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, reason: string) {
    return this.ticketService.updateTicketStatus(ticketId, status, reason);
  }

  async getMeetings() {
    return this.prisma.meeting.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
} 