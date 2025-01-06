import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient, Ticket } from '@prisma/client';

export interface TicketSuggestion {
  ticketId: string;
  title: string;
  content: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  meetingId: number;
}

export interface TicketUpdate {
  ticketId: string;
  newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE';
  reason: string;
}

export interface TranscriptAnalysis {
  newTickets: TicketSuggestion[];
  ticketUpdates: TicketUpdate[];
  meetingMetrics: {
    actionableItemsCount: number;
    statusUpdatesCount: number;
    blockersMentioned: number;
  };
}

export class ClaudeClient {
  private client: Anthropic;
  
  constructor(private prisma: PrismaClient) {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not set in environment variables');
    }
    this.client = new Anthropic({
      apiKey
    });
  }

  async analyzeTranscript(transcript: string, existingTickets: Ticket[]): Promise<TranscriptAnalysis> {
    const prompt = `
You are an expert agile project manager and meeting analyzer. Analyze the meeting transcript and return ONLY a JSON response in the exact format specified below.

RESPONSE FORMAT (Strict JSON):
{
  "newTickets": [
    {
      "title": string,       // Action-oriented, max 100 chars
      "content": string,     // Detailed description
      "status": "TODO" | "IN_PROGRESS" | "DONE",  // Determine from context
      "meetingId": number    // Same as input meetingId
    }
  ],
  "ticketUpdates": [
    {
      "ticketId": string,    // Must match existing ticket ID
      "newStatus": "IN_PROGRESS" | "DONE",
      "reason": string       // Brief explanation
    }
  ],
  "meetingMetrics": {
    "actionableItemsCount": number,
    "statusUpdatesCount": number,
    "blockersMentioned": number
  }
}

Status Classification for New Tickets:
- "I need to implement..." → "TODO"
- "I'm currently working on..." → "IN_PROGRESS"
- "I've already finished..." → "DONE"
- "I started this last week..." → "IN_PROGRESS"
- "This was completed yesterday..." → "DONE"

Example Valid Response:
{
  "newTickets": [
    {
      "title": "Implement user authentication API",
      "content": "Create REST endpoints for user login and registration. Priority: High, Estimated effort: 3 days",
      "status": "IN_PROGRESS",  // Speaker mentioned they started this last week
      "meetingId": 101
    },
    {
      "title": "Update database schema",
      "content": "Add new fields for user preferences. Already completed during sprint preparation.",
      "status": "DONE",  // Speaker mentioned this was already finished
      "meetingId": 101
    }
  ],
  "ticketUpdates": [
    {
      "ticketId": "existing-uuid",
      "newStatus": "IN_PROGRESS",
      "reason": "Team started implementation"
    }
  ],
  "meetingMetrics": {
    "actionableItemsCount": 1,
    "statusUpdatesCount": 1,
    "blockersMentioned": 0
  }
}

Context:
${existingTickets.length > 0 ? 
  `Existing Tickets:\n${existingTickets.map(ticket => 
    `- Title: "${ticket.title}"\n  ID: ${ticket.ticketId}\n  Status: ${ticket.status}`
  ).join('\n')}` 
  : 'No existing tickets.'
}

Meeting Transcript:
${transcript}

IMPORTANT: 
1. Return ONLY the JSON response with no additional text
2. For new tickets, carefully analyze the context to determine the correct initial status
3. Status should reflect the actual state of work, not when it was first mentioned`;

    const response = await this.client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      messages: [{ 
        role: "user", 
        content: prompt
      }],
      system: "You are an expert agile project manager specializing in extracting actionable insights from development team meetings."
    });

    const result = JSON.parse((response.content[0] as { type: string, text: string }).text);
    await this.saveMeetingMetrics(result.meetingMetrics, result.meetingId);
    
    return result;
  }

  private async saveMeetingMetrics(metrics: TranscriptAnalysis['meetingMetrics'], meetingId: number) {
    try {
      await this.prisma.meetingMetrics.create({
        data: {
          meetingId,
          actionableItemsCount: metrics.actionableItemsCount,
          statusUpdatesCount: metrics.statusUpdatesCount,
          blockersMentioned: metrics.blockersMentioned
        }
      });
    } catch (error) {
      console.error('Failed to save meeting metrics:', error);
      // 메트릭스 저장 실패는 전체 프로세스를 중단시키지 않음
    }
  }
}