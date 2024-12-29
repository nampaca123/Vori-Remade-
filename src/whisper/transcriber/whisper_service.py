import whisper
import os

class WhisperTranscriber:
    def __init__(self):
        self.model = whisper.load_model("base")
    
    def transcribe(self, audio_path):
        try:
            result = self.model.transcribe(audio_path)
            return result["text"]
        except Exception as e:
            print(f"Transcription error: {e}")
            return None 