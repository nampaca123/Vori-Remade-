import whisper
import logging
from app.core.config import settings
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
import asyncio
from typing import Dict, List, Optional
from app.services.kafka import KafkaClient
from app.core.kafka_topics import KAFKA_TOPICS

logger = logging.getLogger(__name__)

class WhisperService:
    def __init__(self, kafka_client: KafkaClient):
        self.model = whisper.load_model("base.en")
        self.executor = ThreadPoolExecutor(max_workers=5)
        self.meeting_metadata: Dict[int, Dict] = {}
        self.audio_buffers: Dict[int, List[bytes]] = {}  # 오디오 버퍼
        self.save_buffer: Dict[int, List[str]] = {}
        self.last_save_time: Dict[int, float] = {}
        self.kafka_client = kafka_client
        
        self.model_options = {
            "beam_size": 1,
            "best_of": 1,
            "fp16": False,
            "language": "en",
            "task": "transcribe"
        }
        
        # 버퍼 설정
        self.BUFFER_SIZE = 5  # 5개의 청크를 모아서 처리
        self.CHUNK_SIZE = 32768  # 32KB 청크
        
        logger.info(f"Initialized Whisper model with {self.executor._max_workers} workers")

    async def process_audio(self, meeting_id: int, audio_chunk: bytes) -> Optional[str]:
        try:
            if meeting_id not in self.audio_buffers:
                self.audio_buffers[meeting_id] = []
                logger.info(f"Meeting {meeting_id}: Created new audio buffer")

            self.audio_buffers[meeting_id].append(audio_chunk)
            current_buffer_size = len(self.audio_buffers[meeting_id])
            logger.info(
                f"Meeting {meeting_id}: Buffer status "
                f"[{current_buffer_size}/{self.BUFFER_SIZE}] "
                f"(Chunk size: {len(audio_chunk)/1024:.1f}KB)"
            )
            
            # Process when buffer is full or small audio file
            if len(self.audio_buffers[meeting_id]) >= self.BUFFER_SIZE or len(audio_chunk) < self.CHUNK_SIZE:
                logger.info(f"Meeting {meeting_id}: Starting audio processing (Accumulated chunks: {current_buffer_size})")
                
                with tempfile.NamedTemporaryFile(suffix='.webm', delete=True) as temp_file:
                    combined_chunks = b''.join(self.audio_buffers[meeting_id])
                    temp_file.write(combined_chunks)
                    temp_file.flush()
                    
                    start_time = time.time()
                    text = await self._transcribe_chunk(temp_file.name)
                    processing_time = time.time() - start_time
                    
                    if text:
                        logger.info(
                            f"Meeting {meeting_id}: Text conversion completed "
                            f"(Processing time: {processing_time:.2f}s)\n"
                            f"Text: {text[:100]}..."
                        )
                        
                        if meeting_id not in self.save_buffer:
                            self.save_buffer[meeting_id] = []
                        self.save_buffer[meeting_id].append(text)
                        
                        await self._check_save_buffer(meeting_id)
                        self.audio_buffers[meeting_id] = []  # Reset buffer
                        return text
                    else:
                        logger.warning(f"Meeting {meeting_id}: Text conversion failed")
            else:
                logger.info(f"Meeting {meeting_id}: Accumulating buffer... ({current_buffer_size}/{self.BUFFER_SIZE})")

            return None
                
        except Exception as e:
            logger.error(f"Meeting {meeting_id}: Error processing audio - {str(e)}")
            raise

    async def _transcribe_chunk(self, audio_path: str) -> str:
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._process_audio_file,
                audio_path
            )
            return result
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise

    def _process_audio_file(self, audio_path: str) -> str:
        try:
            result = self.model.transcribe(
                audio_path,
                **self.model_options
            )
            return result["text"].strip()
        except Exception as e:
            logger.error(f"Error in worker thread: {str(e)}")
            raise

    async def _check_save_buffer(self, meeting_id: int):
        """버퍼에 있는 텍스트 저장"""
        try:
            if meeting_id in self.save_buffer and self.save_buffer[meeting_id]:
                buffer_text = " ".join(self.save_buffer[meeting_id])
                metadata = self.meeting_metadata.get(meeting_id, {})
                
                await self.kafka_client.send_message(
                    KAFKA_TOPICS["TRANSCRIPTION"]["COMPLETED"],
                    {
                        "meetingId": meeting_id,
                        "audioId": metadata.get('audioId'),
                        "groupId": metadata.get('groupId'),
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