import { TicketMetrics, ProductivityMetrics, GroupTrendMetrics } from '../types/analytics';
import { Server } from 'ws';
import { Kafka } from 'kafkajs';
import WebSocket from 'ws';

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

    for (let i = 0; i < this.numWorkers; i++) {
      const consumer = kafka.consumer({ 
        groupId: `analytics-websocket-service-${i}`,
        sessionTimeout: 6000
      });
      
      await consumer.connect();
      await consumer.subscribe({ 
        topics: [
          'analytics.ticket.metrics',
          'analytics.productivity',
          'analytics.trends.groups'
        ] 
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
            case 'analytics.productivity':
              this.broadcastMetrics('productivity_metrics', data as ProductivityMetrics);
              break;
            case 'analytics.trends.groups':
              this.broadcastMetrics('group_trends', data as GroupTrendMetrics);
              break;
          }
        },
      });

      this.consumers.push(consumer);
      console.log(`Analytics worker ${i} started successfully`);
    }
  }

  private broadcastMetrics(
    type: 'ticket_metrics' | 'productivity_metrics' | 'group_trends',
    data: TicketMetrics | ProductivityMetrics | GroupTrendMetrics
  ) {
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

  async cleanup() {
    await Promise.all(
      this.consumers.map(consumer => consumer.disconnect())
    );
  }
} 