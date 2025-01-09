import { Server } from 'ws';
import { Kafka } from 'kafkajs';

interface TicketMetrics {
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

interface TextAnalysis {
  meetingId: number;
  textAnalysis: {
    keywords: string[];
    topics: Array<{
      name: string;
      keywords: string[];
      frequency: number;
    }>;
  };
}

interface ProductivityMetrics {
  meetingId: number;
  productivityMetrics: {
    score: number;
    ticketCreationRate: number;
    decisionSpeed: number;
    actionItemRatio: number;
  };
}

export class AnalyticsService {
  private consumers: any[] = [];
  private readonly numWorkers = 5;

  constructor(private wss: Server) {
    this.initializeKafkaConsumers();
  }

  private async initializeKafkaConsumers() {
    const kafka = new Kafka({
      clientId: 'analytics-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });

    // 5개의 컨슈머 생성
    for (let i = 0; i < this.numWorkers; i++) {
      const consumer = kafka.consumer({ 
        groupId: `analytics-websocket-service-${i}`,
        sessionTimeout: 6000
      });
      
      await consumer.connect();
      await consumer.subscribe({ 
        topics: ['analytics.ticket.metrics', 'analytics.text', 'analytics.productivity'] 
      });

      await consumer.run({
        partitionsConsumedConcurrently: 1,
        eachMessage: async ({ topic, message }: { 
          topic: string; 
          message: { value: Buffer | null } 
        }) => {
          if (!message.value) return;
          
          const data = JSON.parse(message.value.toString());
          
          switch (topic) {
            case 'analytics.ticket.metrics':
              this.broadcastMetrics('ticket_metrics', data as TicketMetrics);
              break;
            case 'analytics.text':
              this.broadcastMetrics('text_analysis', data as TextAnalysis);
              break;
            case 'analytics.productivity':
              this.broadcastMetrics('productivity_metrics', data as ProductivityMetrics);
              break;
          }
        },
      });

      this.consumers.push(consumer);
      console.log(`Analytics worker ${i} started successfully`);
    }
  }

  private broadcastMetrics(type: string, data: TicketMetrics | TextAnalysis | ProductivityMetrics) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }
} 