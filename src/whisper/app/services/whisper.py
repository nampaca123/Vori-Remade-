import whisper
import logging
from app.core.config import settings
import tempfile
import base64
from concurrent.futures import ThreadPoolExecutor
import asyncio

logger = logging.getLogger(__name__)

class WhisperService:
    def __init__(self):
        self.model = whisper.load_model(settings.WHISPER_MODEL)
        self.executor = ThreadPoolExecutor(max_workers=5)  # 5개의 병렬 처리 워커
        logger.info(f"Initialized Whisper model with {self.executor._max_workers} workers")
    
    async def transcribe(self, audio_data: str) -> str:  # base64 encoded string
        try:
            logger.info("Starting transcription...")
            
            # base64 디코딩
            decoded_data = base64.b64decode(audio_data)
            logger.info("Successfully decoded base64 audio data")
            
            # 스레드 풀에서 Whisper 모델 실행
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._process_audio,
                decoded_data
            )
            
            logger.info("="*50)
            logger.info("Transcription completed successfully!")
            logger.info(f"Transcribed text: {result}")
            logger.info("="*50)
            
            return result
                
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise
    
    def _process_audio(self, audio_data: bytes) -> str:
        """스레드 풀에서 실행될 실제 Whisper 처리 로직"""
        try:
            # webm 파일로 저장
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=True) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()
                logger.info(f"Saved audio to temporary file: {temp_file.name}")
                
                # Whisper로 음성을 텍스트로 변환
                logger.info("Starting Whisper transcription in worker thread...")
                result = self.model.transcribe(temp_file.name)
                return result["text"]
                
        except Exception as e:
            logger.error(f"Error in worker thread: {str(e)}")
            raise
    
    def __del__(self):
        """서비스 종료 시 스레드 풀 정리"""
        self.executor.shutdown(wait=True)
        logger.info("Whisper service shutdown complete") 