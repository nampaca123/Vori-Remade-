export type TicketStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TicketSuggestion {
  ticketId: string;
  title: string;
  content: string;
  status: TicketStatus;
  meetingId: number;
  assigneeId?: number;
}

export interface TicketUpdate {
  ticketId: string;
  newStatus: TicketStatus;
  assigneeId?: number;
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