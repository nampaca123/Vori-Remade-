import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient, Ticket } from '@prisma/client';

export interface TicketSuggestion {
  title: string;
  content: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  meetingId: number;
}

export interface TicketUpdate {
  ticketId: string;
  newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE';
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

  constructor() {
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
You are an expert agile project manager and meeting analyzer. Your task is to analyze the following meeting transcript to:
1. Create new actionable tickets
2. Update status of existing tickets based on mentions in the transcript

Context:
${existingTickets.length > 0 ? `
Existing Tickets:
${existingTickets.map(ticket => `
- Title: "${ticket.title}"
  ID: ${ticket.ticketId}
  Current Status: ${ticket.status}
`).join('\n')}
` : 'No existing tickets.'}

Requirements:
1. Create clear, specific tickets that are:
   - Measurable: Has clear completion criteria
   - Achievable: Can be completed in a reasonable timeframe
   - Relevant: Aligns with project goals
   - Time-bound: Has implicit or explicit deadline

2. Status Classification:
   - TODO: New tasks or not yet started work
   - IN_PROGRESS: Actively being worked on, mentioned as "working on", "implementing", etc.
   - DONE: Completed tasks, mentioned with "finished", "completed", "deployed", etc.

3. Ticket Format:
   - Title: Action-oriented, max 100 characters
   - Content: Must include:
     * Context from the discussion
     * Any mentioned requirements or constraints
     * Dependencies if mentioned
     * Priority level if discussed
     * Estimated effort if mentioned

Output Format:
{
  "newTickets": [
    {
      "title": "Brief, action-oriented title",
      "content": "Detailed description including context and requirements",
      "status": "TODO|IN_PROGRESS|DONE",
      "meetingId": <meeting_id>
    }
  ],
  "ticketUpdates": [
    {
      "ticketId": "existing-ticket-id",
      "newStatus": "IN_PROGRESS|DONE",
      "reason": "Brief explanation of why status changed based on transcript"
    }
  ],
  "meetingMetrics": {
    "actionableItemsCount": number,
    "statusUpdatesCount": number,
    "blockersMentioned": number
  }
}

Example Status Updates:
1. "Working on the API documentation right now" 
   → Update matching ticket to "IN_PROGRESS"
2. "Just finished implementing the login page" 
   → Update matching ticket to "DONE"
3. "Haven't started the database migration yet" 
   → Keep as "TODO"

Guidelines:
- Focus on concrete, implementable tasks
- Capture status updates for existing work
- Note any blockers or dependencies
- Include technical details when mentioned
- Maintain context between related tickets
- Avoid duplicate tickets
- Consider team capacity and current sprint

Meeting Transcript:
${transcript}
`;

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
    await this.saveMeetingMetrics(result.meetingMetrics);
    
    return result;
  }

  private async saveMeetingMetrics(metrics: any) {
    // TODO: Implement metrics saving logic
    // This will be used for Spark Streaming analysis later
  }
}