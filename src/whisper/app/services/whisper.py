import whisper
import logging
from app.core.config import settings
import tempfile
import base64
from concurrent.futures import ThreadPoolExecutor
import asyncio
from typing import Dict, List
from app.services.kafka import KafkaClient
from app.core.kafka_topics import KAFKA_TOPICS

logger = logging.getLogger(__name__)

class WhisperService:
    def __init__(self):
        self.model = whisper.load_model("base.en")
        self.executor = ThreadPoolExecutor(max_workers=5)
        self.pending_meetings: Dict[int, Dict[str, any]] = {}
        self.kafka_client = KafkaClient()
        
        # Whisper 모델 설정 최적화 (영어 모델용)
        self.model_options = {
            "beam_size": 1,     # 빔 서치 크기 감소
            "best_of": 1,       # 후보 수 감소
            "fp16": False,      # GPU 사용 시 True로 변경
            "language": "en",   # 영어 설정
            "task": "transcribe"
        }
        
        logger.info(f"Initialized Whisper model (base.en) with {self.executor._max_workers} workers")

    async def process_audio(self, meeting_id: int, audio_chunk: bytes) -> str:
        """실시간 오디오 처리 및 텍스트 변환"""
        try:
            if meeting_id not in self.pending_meetings:
                self.pending_meetings[meeting_id] = {
                    "chunks": [],
                    "end_signal": False
                }
            
            # 오디오 처리
            text = await self._transcribe_chunk(audio_chunk)
            self.pending_meetings[meeting_id]["chunks"].append(text)
            return text
            
        except Exception as e:
            logger.error(f"Error processing audio for meeting {meeting_id}: {str(e)}")
            raise

    async def handle_disconnect(self, meeting_id: int):
        """WebSocket 연결 종료 시 처리"""
        try:
            if meeting_id in self.pending_meetings:
                meeting_data = self.pending_meetings[meeting_id]
                complete_text = " ".join(meeting_data["chunks"])
                
                # Kafka로 완료된 텍스트 전송
                await self.kafka_client.send_message(
                    KAFKA_TOPICS.TRANSCRIPTION.COMPLETED,
                    {
                        "meetingId": meeting_id,
                        "transcript": complete_text,
                        "status": "completed"
                    }
                )
                del self.pending_meetings[meeting_id]
                logger.info(f"Meeting {meeting_id} completed and sent to Kafka")
                
        except Exception as e:
            logger.error(f"Error handling disconnect for meeting {meeting_id}: {str(e)}")
            raise

    async def _transcribe_chunk(self, audio_chunk: bytes) -> str:
        """오디오 청크를 텍스트로 변환"""
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._process_audio_chunk,
                audio_chunk
            )
            return result
            
        except Exception as e:
            logger.error(f"Transcription chunk failed: {str(e)}")
            raise

    def _process_audio_chunk(self, audio_chunk: bytes) -> str:
        """스레드 풀에서 실행될 Whisper 처리 로직"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=True) as temp_file:
                temp_file.write(audio_chunk)
                temp_file.flush()
                
                # Whisper로 음성을 텍스트로 변환
                result = self.model.transcribe(
                    temp_file.name,
                    **self.model_options
                )
                return result["text"].strip()
                
        except Exception as e:
            logger.error(f"Error in worker thread: {str(e)}")
            raise

    def __del__(self):
        """서비스 종료 시 정리"""
        self.executor.shutdown(wait=True)
        logger.info("Whisper service shutdown complete") 