export interface TicketMetrics {
  meetingId: number;
  window: {
    start: string;
    end: string;
  };
  metrics: {
    actionableItemsCount: number;
    statusUpdatesCount: number;
    blockersMentioned: number;
  };
}

export interface ProductivityMetrics {
  meetingId: number;
  window: {
    start: string;
    end: string;
  };
  productivity_score: number;
  ticket_count: number;
  actionable_tickets: number;
}

export interface GroupTrendMetrics {
  groupId: number;
  metrics: {
    period: {
      start: string;
      end: string;
    };
    avg_productivity: number;
    avg_actionable_items: number;
    avg_status_updates: number;
    meeting_count: number;
  };
} 