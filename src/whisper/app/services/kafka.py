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
    
    async def start_consuming(self, whisper_service):
        try:
            await self.producer.start()
            await self.consumer.start()
            
            async for msg in self.consumer:
                try:
                    await self.process_audio(msg, whisper_service)
                except Exception as e:
                    logger.error(f"Error processing message: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Kafka connection error: {str(e)}")
        finally:
            await self.close()
    
    async def process_audio(self, msg, whisper_service):
        try:
            # 메시지에서 오디오 데이터 추출 및 처리
            audio_data = msg.value.get('audioData')
            meeting_id = msg.value.get('meetingId')
            
            if not audio_data or not meeting_id:
                raise ValueError("Invalid message format")
                
            result = await whisper_service.transcribe(audio_data)
            
            # 처리 결과를 다른 토픽으로 전송
            await self.producer.send_and_wait(
                KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
                {
                    "meetingId": meeting_id,
                    "transcript": result,
                    "timestamp": msg.timestamp
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to process audio: {str(e)}")
            raise
    
    async def close(self):
        try:
            await self.producer.stop()
            await self.consumer.stop()
        except Exception as e:
            logger.error(f"Error closing Kafka client: {str(e)}") 