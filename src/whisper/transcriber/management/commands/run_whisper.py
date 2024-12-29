from django.core.management.base import BaseCommand
from transcriber.kafka_client import consumer, producer
from transcriber.whisper_service import WhisperTranscriber
import json
import tempfile
import base64

class Command(BaseCommand):
    help = 'Starts the Whisper transcription service'

    def handle(self, *args, **options):
        transcriber = WhisperTranscriber()
        self.stdout.write('Starting Whisper service...')
        
        try:
            for message in consumer:
                try:
                    # 메시지에서 오디오 데이터 추출
                    audio_data = message.value.get('audioData')
                    meeting_id = message.value.get('meetingId')
                    
                    # base64 디코딩 및 임시 파일 저장
                    with tempfile.NamedTemporaryFile(suffix='.webm', delete=True) as temp_file:
                        temp_file.write(base64.b64decode(audio_data))
                        temp_file.flush()
                        
                        # Whisper로 텍스트 변환
                        text = transcriber.transcribe(temp_file.name)
                        
                        if text:
                            # 결과 전송
                            producer.send('transcription.completed', {
                                'meetingId': meeting_id,
                                'text': text,
                                'timestamp': message.value.get('timestamp')
                            })
                            
                            self.stdout.write(f'Transcribed text: {text[:100]}...')
                        
                except Exception as e:
                    self.stderr.write(f'Error processing message: {e}')
                    
        except KeyboardInterrupt:
            self.stdout.write('Stopping Whisper service...') 