from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from app.core.config import settings
from app.core.kafka_topics import KAFKA_TOPICS
import json
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

class KafkaClient:
    def __init__(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        self.consumer = AIOKafkaConsumer(
            KAFKA_TOPICS["AUDIO"]["RAW"],
            bootstrap_servers=settings.KAFKA_BROKERS,
            group_id="whisper_service",
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )
    
    async def start(self):
        await self.producer.start()
        await self.consumer.start()
        
    async def stop(self):
        await self.producer.stop()
        await self.consumer.stop()
    
    async def start_consuming(self, whisper_service):
        try:
            await self.start()
            async for msg in self.consumer:
                await self.process_audio(msg, whisper_service)
        except Exception as e:
            logger.error(f"Error in consumer loop: {str(e)}")
            raise
        finally:
            await self.stop()
    
    async def process_audio(self, msg, whisper_service):
        start_time = time.time()
        
        try:
            audio_data = msg.value.get('audioData')
            meeting_id = msg.value.get('meetingId')
            message_timestamp = msg.value.get('timestamp')  # ISO 형식 문자열
            
            if not audio_data or not meeting_id:
                logger.error("Invalid message format")
                return
            
            # ISO 문자열을 timestamp로 변환
            if message_timestamp:
                processing_start_time = datetime.fromisoformat(message_timestamp.replace('Z', '+00:00')).timestamp()
                kafka_processing_time = start_time - processing_start_time
            else:
                kafka_processing_time = 0
            
            whisper_start_time = time.time()
            result = await whisper_service.transcribe(audio_data)
            whisper_processing_time = time.time() - whisper_start_time
            
            total_time = time.time() - start_time
            
            await self.producer.send_and_wait(
                KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
                {
                    "meetingId": meeting_id,
                    "transcript": result,
                    "timestamp": msg.timestamp,
                    "metrics": {
                        "kafkaDeliveryTime": kafka_processing_time,
                        "whisperProcessingTime": whisper_processing_time,
                        "totalProcessingTime": total_time
                    }
                }
            )
            logger.info(f"""
                Processing times for meeting {meeting_id}:
                Kafka delivery time: {kafka_processing_time:.2f}s
                Whisper processing time: {whisper_processing_time:.2f}s
                Total processing time: {total_time:.2f}s
            """)
            
        except Exception as e:
            logger.error(f"Failed to process audio: {str(e)}")
            raise 