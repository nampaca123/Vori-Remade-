from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from app.core.config import settings
from app.core.kafka_topics import KAFKA_TOPICS
import json
import logging

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
        try:
            audio_data = msg.value.get('audioData')
            meeting_id = msg.value.get('meetingId')
            
            if not audio_data or not meeting_id:
                logger.error("Invalid message format")
                return
                
            result = await whisper_service.transcribe(audio_data)
            
            # Kafka로 결과 전송
            await self.producer.send_and_wait(
                KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
                {
                    "meetingId": meeting_id,
                    "transcript": result,
                    "timestamp": msg.timestamp
                }
            )
            logger.info(f"Sent transcription result to Kafka for meeting: {meeting_id}")
            
        except Exception as e:
            logger.error(f"Failed to process audio: {str(e)}")
            raise 