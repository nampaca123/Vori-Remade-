from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from app.services.kafka import KafkaClient
from app.services.whisper import WhisperService
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# 로깅 설정 변경
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# aiokafka의 로깅 레벨만 WARNING으로 설정
logging.getLogger('aiokafka').setLevel(logging.WARNING)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Whisper Service...")
    kafka_client = KafkaClient(
        bootstrap_servers=[settings.KAFKA_BROKERS],
        client_id="whisper-service"
    )
    app.state.whisper_service = WhisperService(kafka_client)
    
    # Background task로 Kafka 소비자 시작
    import asyncio
    asyncio.create_task(kafka_client.start_consuming())
    
    yield
    
    # Shutdown
    logger.info("Shutting down Whisper Service...")
    await kafka_client.close()

app = FastAPI(
    title="Whisper Service",
    description="Kafka consumer for audio transcription using Whisper",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {"status": "healthy"} 

@app.websocket("/ws/meeting/{meeting_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    meeting_id: int,
    whisper_service: WhisperService = Depends(lambda: app.state.whisper_service)
):
    logger.info(f"New WebSocket connection for meeting {meeting_id}")
    await websocket.accept()
    try:
        # 메타데이터 수신
        metadata = await websocket.receive_json()
        if metadata.get('type') != 'metadata':
            raise WebSocketDisconnect("Invalid metadata")
        
        whisper_service.meeting_metadata[meeting_id] = metadata['data']
        logger.info(f"Received metadata for meeting {meeting_id}")
        
        while True:
            logger.info(f"Waiting for audio chunk from meeting {meeting_id}")
            audio_chunk = await websocket.receive_bytes()
            logger.info(f"Received audio chunk of size {len(audio_chunk)} bytes from meeting {meeting_id}")
            
            # 실시간 텍스트 변환 및 클라이언트에 전송
            text = await whisper_service.process_audio(meeting_id, audio_chunk)
            if text:  # None이 아닐 때만 처리
                logger.info(f"Processed audio chunk for meeting {meeting_id}: {text[:50]}...")
                await websocket.send_json({"text": text})
                logger.info(f"Sent transcribed text to meeting {meeting_id}")
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for meeting {meeting_id}")
        await whisper_service.handle_disconnect(meeting_id)
    except Exception as e:
        logger.error(f"Error in WebSocket connection for meeting {meeting_id}: {str(e)}")
        raise 