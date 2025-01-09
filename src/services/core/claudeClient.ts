import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient, Ticket, User } from '@prisma/client';
import { 
  TicketStatus, 
  TicketSuggestion, 
  TicketUpdate, 
  TranscriptAnalysis 
} from '../../types/tickets';

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

  async analyzeTranscript(
    transcript: string, 
    existingTickets: (Ticket & { assignee?: User | null })[], 
    groupMembers: { userId: number; name: string; }[],
    meetingId: number
  ): Promise<TranscriptAnalysis> {
    const prompt = `
You are an expert agile project manager and meeting analyzer. Analyze the meeting transcript and return ONLY a JSON response in the exact format specified below.

RESPONSE FORMAT (Strict JSON):
{
  "newTickets": [
    {
      "title": string,       // Action-oriented, max 100 chars
      "content": string,     // Detailed description
      "status": "TODO" | "IN_PROGRESS" | "DONE",  // Determine from context
      "meetingId": number,   // Same as input meetingId
      "assigneeId": number | null  // User ID from group members list, or null if unclear
    }
  ],
  "ticketUpdates": [
    {
      "ticketId": string,    // Must match existing ticket ID
      "newStatus": "IN_PROGRESS" | "DONE",
      "assigneeId": number | null,  // Updated assignee if mentioned
      "reason": string       // Brief explanation
    }
  ],
  "meetingMetrics": {
    "actionableItemsCount": number,
    "statusUpdatesCount": number,
    "blockersMentioned": number
  }
}

Assignee Detection Guidelines:
1. Match context clues with group member names
2. Look for phrases like:
   - "I will handle..."
   - "Alice is working on..."
   - "This is Bob's task..."
   - "We assigned this to Carol..."
3. Set assigneeId to null if ownership is unclear
4. Only assign to users from the provided group members list

Example Valid Responses:

Case 1 - Clear Assignment:
{
  "newTickets": [
    {
      "title": "Implement user authentication API",
      "content": "Create REST endpoints for user login and registration",
      "status": "IN_PROGRESS",
      "meetingId": 101,
      "assigneeId": 1  // Alice mentioned "I'm working on the auth API"
    }
  ]
}

Case 2 - Unclear Assignment:
{
  "newTickets": [
    {
      "title": "Update database schema",
      "content": "Add new fields for user preferences",
      "status": "TODO",
      "meetingId": 101,
      "assigneeId": null  // No clear owner mentioned
    }
  ]
}

Case 3 - Indirect Assignment:
{
  "newTickets": [
    {
      "title": "Fix frontend bugs",
      "content": "Address reported UI issues in the dashboard",
      "status": "TODO",
      "meetingId": 101,
      "assigneeId": 2  // Bob mentioned "These frontend issues are in my domain"
    }
  ]
}

Context:
Group Members:
${groupMembers.map(member => 
  `- Name: "${member.name}"\n  ID: ${member.userId}`
).join('\n')}

Existing Tickets:
${existingTickets.length > 0 ? 
  existingTickets.map(ticket => 
    `- Title: "${ticket.title}"\n  ID: ${ticket.ticketId}\n  Status: ${ticket.status}\n  Assignee: ${ticket.assignee?.name || 'Unassigned'}`
  ).join('\n') 
  : 'No existing tickets.'
}

Meeting Transcript:
${transcript}

IMPORTANT: 
1. Return ONLY the JSON response with no additional text
2. For new tickets, carefully analyze the context to determine the correct initial status and assignee
3. Status should reflect the actual state of work, not when it was first mentioned
4. Only assign tickets to users from the provided group members list`;

    try {
      const response = await this.client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        messages: [{ 
          role: "user", 
          content: prompt
        }],
        system: "You are an expert agile project manager specializing in extracting actionable insights from development team meetings."
      });
      console.log('Claude API Response:', response.content[0]);
      
      const result = JSON.parse((response.content[0] as { type: string, text: string }).text);
      console.log('Parsed Result:', result);
      
      await this.saveMeetingMetrics(result.meetingMetrics, meetingId);
      return result;
    } catch (error) {
      console.error('Error in analyzeTranscript:', error);
      throw error;
    }
  }

  private async saveMeetingMetrics(metrics: TranscriptAnalysis['meetingMetrics'], meetingId: number) {
    try {
      await this.prisma.meetingMetrics.create({
        data: {
          actionableItemsCount: metrics.actionableItemsCount,
          statusUpdatesCount: metrics.statusUpdatesCount,
          blockersMentioned: metrics.blockersMentioned,
          meetingId: meetingId
        }
      });
    } catch (error) {
      console.error('Failed to save meeting metrics:', error);
      throw error;
    }
  }
}