import whisper
import logging
from app.core.config import settings
import tempfile
import time
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
        self.save_buffer: Dict[int, List[str]] = {}  # 텍스트 버퍼
        self.last_save_time: Dict[int, float] = {}   # 마지막 저장 시간
        self.kafka_client = KafkaClient()
        self.SAVE_INTERVAL = 30.0  # 30초마다 저장
        
        self.model_options = {
            "beam_size": 1,
            "best_of": 1,
            "fp16": False,
            "language": "en",
            "task": "transcribe"
        }
        
        logger.info(f"Initialized Whisper model (base.en) with {self.executor._max_workers} workers")

    async def process_audio(self, meeting_id: int, audio_chunk: bytes) -> str:
        """실시간 오디오 처리 및 주기적 저장"""
        try:
            # 텍스트 변환
            text = await self._transcribe_chunk(audio_chunk)
            logger.info(f"Transcribed text: {text[:50]}...")
            
            # 버퍼에 텍스트 추가
            if meeting_id not in self.save_buffer:
                self.save_buffer[meeting_id] = []
                self.last_save_time[meeting_id] = time.time()
            self.save_buffer[meeting_id].append(text)
            
            # 30초 주기로 저장
            current_time = time.time()
            if (current_time - self.last_save_time[meeting_id]) >= self.SAVE_INTERVAL:
                await self._save_buffer(meeting_id)
            
            # 클라이언트에 실시간 응답용
            return text
            
        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
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

    async def _save_buffer(self, meeting_id: int):
        """버퍼에 있는 텍스트 저장"""
        try:
            if meeting_id in self.save_buffer and self.save_buffer[meeting_id]:
                buffer_text = " ".join(self.save_buffer[meeting_id])
                logger.info(f"Saving buffer for meeting {meeting_id}, size: {len(buffer_text)} chars")
                
                await self.kafka_client.send_message(
                    KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
                    {
                        "meetingId": meeting_id,
                        "transcript": buffer_text,
                        "isPartial": True
                    }
                )
                
                self.save_buffer[meeting_id] = []  # 버퍼 초기화
                self.last_save_time[meeting_id] = time.time()
                
        except Exception as e:
            logger.error(f"Error saving buffer: {str(e)}")
            raise

    async def handle_disconnect(self, meeting_id: int):
        """연결 종료 시 남은 버퍼 처리"""
        try:
            logger.info(f"Handling disconnect for meeting {meeting_id}")
            
            # 1. 남은 버퍼 저장
            if meeting_id in self.save_buffer and self.save_buffer[meeting_id]:
                await self._save_buffer(meeting_id)
            
            # 2. 최종 완료 상태 전송
            await self.kafka_client.send_message(
                KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
                {
                    "meetingId": meeting_id,
                    "transcript": "",  # 마지막은 빈 텍스트 (완료 표시용)
                    "isPartial": False
                }
            )
            
            # 3. 정리
            if meeting_id in self.save_buffer:
                del self.save_buffer[meeting_id]
            if meeting_id in self.last_save_time:
                del self.last_save_time[meeting_id]
            
            logger.info(f"Disconnect handling completed for meeting {meeting_id}")
                
        except Exception as e:
            logger.error(f"Error handling disconnect: {str(e)}")
            raise

    def __del__(self):
        """서비스 종료 시 정리"""
        self.executor.shutdown(wait=True)
        logger.info("Whisper service shutdown complete") 