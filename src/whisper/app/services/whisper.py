import whisper
import logging
from app.core.config import settings
import tempfile
import base64

logger = logging.getLogger(__name__)

class WhisperService:
    def __init__(self):
        self.model = whisper.load_model(settings.WHISPER_MODEL)
    
    async def transcribe(self, audio_data: str) -> str:  # base64 encoded string
        try:
            # base64 디코딩
            decoded_data = base64.b64decode(audio_data)
            
            # webm 파일로 저장
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=True) as temp_file:
                temp_file.write(decoded_data)
                temp_file.flush()
                
                # Whisper로 음성을 텍스트로 변환
                result = self.model.transcribe(temp_file.name)
                return result["text"]
                
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise 