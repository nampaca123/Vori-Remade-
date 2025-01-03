from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.services.kafka import KafkaClient
from app.services.whisper import WhisperService
import logging

logger = logging.getLogger(__name__)

logging.basicConfig(level=logging.DEBUG)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Whisper Service...")
    whisper_service = WhisperService()
    kafka_client = KafkaClient()
    
    # Background task로 Kafka 소비자 시작
    import asyncio
    asyncio.create_task(kafka_client.start_consuming(whisper_service))
    
    yield
    
    # Shutdown
    logger.info("Shutting down Whisper Service...")
    await kafka_client.close()

app = FastAPI(
    title="Whisper Service",
    description="Kafka consumer for audio transcription using Whisper",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {"status": "healthy"} 