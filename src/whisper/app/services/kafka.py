from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from app.core.config import settings
from app.core.kafka_topics import KAFKA_TOPICS
import json
import logging
import asyncio
from typing import List
from aiokafka.structs import TopicPartition

logger = logging.getLogger(__name__)

class KafkaClient:
    def __init__(self):
        self.producer = None
        self.consumer = None
        self.workers: List[asyncio.Task] = []
        
    async def start(self):
        """Kafka 프로듀서와 컨슈머 초기화"""
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        self.consumer = AIOKafkaConsumer(
            KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
            bootstrap_servers=settings.KAFKA_BROKERS,
            group_id="whisper_service",
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            enable_auto_commit=False
        )
        
        await self.producer.start()
        await self.consumer.start()
        logger.info("Kafka producer and consumer started successfully")
        
    async def stop(self):
        """Kafka 연결 종료 및 리소스 정리"""
        for worker in self.workers:
            worker.cancel()
        
        if self.workers:
            await asyncio.gather(*self.workers, return_exceptions=True)
        
        await self.producer.stop()
        await self.consumer.stop()
        logger.info("Kafka client stopped")
    
    async def start_consuming(self):
        """병렬 처리를 위한 다중 워커 시작"""
        try:
            await self.start()
            
            for i in range(5):
                worker = asyncio.create_task(
                    self.process_messages(worker_id=i)
                )
                self.workers.append(worker)
                logger.info(f"Started worker {i}")
            
            await asyncio.gather(*self.workers)
            
        except Exception as e:
            logger.error(f"Error in consumer loop: {str(e)}")
            raise
        finally:
            await self.stop()
    
    async def process_messages(self, worker_id: int):
        """각 워커의 메시지 처리 로직"""
        try:
            async for msg in self.consumer:
                try:
                    meeting_id = msg.value.get('meetingId')
                    if not meeting_id:
                        logger.error(f"Worker {worker_id}: Invalid message format")
                        continue
                    
                    await self.consumer.commit({
                        TopicPartition(msg.topic, msg.partition): msg.offset + 1
                    })
                    
                    logger.info(f"Worker {worker_id} processed message for meeting {meeting_id}")
                    
                except Exception as e:
                    logger.error(f"Worker {worker_id} failed to process message: {str(e)}")
                    
        except asyncio.CancelledError:
            logger.info(f"Worker {worker_id} was cancelled")
        except Exception as e:
            logger.error(f"Worker {worker_id} encountered an error: {str(e)}")
            raise

    async def send_message(self, topic: str, message: dict):
        """Kafka 메시지 전송"""
        try:
            await self.producer.send_and_wait(topic, message)
            logger.info(f"Message sent to topic {topic}")
        except Exception as e:
            logger.error(f"Failed to send message to topic {topic}: {str(e)}")
            raise 