import whisper
import logging
from app.core.config import settings
import tempfile

logger = logging.getLogger(__name__)

class WhisperService:
    def __init__(self):
        self.model = whisper.load_model(settings.WHISPER_MODEL)
    
    async def transcribe(self, audio_data: bytes) -> str:
        try:
            # 바이트 데이터를 임시 파일로 저장
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=True) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()
                
                # Whisper로 음성을 텍스트로 변환
                result = self.model.transcribe(temp_file.name)
                return result["text"]
                
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise 