from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from app.core.config import settings
from app.core.kafka_topics import KAFKA_TOPICS
import json
import logging
import time
from datetime import datetime
import asyncio
from typing import List, Dict
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
            KAFKA_TOPICS["AUDIO"]["RAW"],
            bootstrap_servers=settings.KAFKA_BROKERS,
            group_id="whisper_service",
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            enable_auto_commit=False  # 수동 커밋 사용
        )
        
        await self.producer.start()
        await self.consumer.start()
        logger.info("Kafka producer and consumer started successfully")
        
    async def stop(self):
        """Kafka 연결 종료 및 리소스 정리"""
        # 모든 워커 태스크 취소
        for worker in self.workers:
            worker.cancel()
        
        if self.workers:
            await asyncio.gather(*self.workers, return_exceptions=True)
        
        await self.producer.stop()
        await self.consumer.stop()
        logger.info("Kafka client stopped")
    
    async def start_consuming(self, whisper_service):
        """병렬 처리를 위한 다중 워커 시작"""
        try:
            await self.start()
            
            # 5개의 워커 생성
            for i in range(5):
                worker = asyncio.create_task(
                    self.process_messages(whisper_service, worker_id=i)
                )
                self.workers.append(worker)
                logger.info(f"Started worker {i}")
            
            # 모든 워커 실행
            await asyncio.gather(*self.workers)
            
        except Exception as e:
            logger.error(f"Error in consumer loop: {str(e)}")
            raise
        finally:
            await self.stop()
    
    async def process_messages(self, whisper_service, worker_id: int):
        """각 워커의 메시지 처리 로직"""
        try:
            async for msg in self.consumer:
                start_time = time.time()
                
                try:
                    # 메시지 데이터 추출
                    audio_data = msg.value.get('audioData')
                    meeting_id = msg.value.get('meetingId')
                    audio_id = msg.value.get('audioId')
                    message_timestamp = msg.value.get('timestamp')
                    
                    if not all([audio_data, meeting_id, audio_id]):
                        logger.error(f"Worker {worker_id}: Invalid message format")
                        continue
                    
                    # 처리 시간 계산
                    if message_timestamp:
                        processing_start_time = datetime.fromisoformat(
                            message_timestamp.replace('Z', '+00:00')
                        ).timestamp()
                        kafka_processing_time = start_time - processing_start_time
                    else:
                        kafka_processing_time = 0
                    
                    # Whisper 처리
                    whisper_start_time = time.time()
                    result = await whisper_service.transcribe(audio_data)
                    whisper_processing_time = time.time() - whisper_start_time
                    
                    total_time = time.time() - start_time
                    
                    # 결과 전송
                    await self.producer.send_and_wait(
                        KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
                        {
                            "meetingId": meeting_id,
                            "audioId": audio_id,
                            "transcript": result,
                            "timestamp": msg.timestamp,
                            "metrics": {
                                "kafkaDeliveryTime": kafka_processing_time,
                                "whisperProcessingTime": whisper_processing_time,
                                "totalProcessingTime": total_time,
                                "workerId": worker_id
                            }
                        }
                    )
                    
                    # 처리 완료된 메시지 커밋
                    await self.consumer.commit({
                        TopicPartition(msg.topic, msg.partition): msg.offset + 1
                    })
                    
                    logger.info(f"""
                        Worker {worker_id} completed processing:
                        Meeting ID: {meeting_id}
                        Partition: {msg.partition}
                        Kafka delivery time: {kafka_processing_time:.2f}s
                        Whisper processing time: {whisper_processing_time:.2f}s
                        Total processing time: {total_time:.2f}s
                    """)
                    
                except Exception as e:
                    logger.error(f"Worker {worker_id} failed to process message: {str(e)}")
                    
        except asyncio.CancelledError:
            logger.info(f"Worker {worker_id} was cancelled")
        except Exception as e:
            logger.error(f"Worker {worker_id} encountered an error: {str(e)}")
            raise 