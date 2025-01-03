from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Kafka 설정
    KAFKA_BROKERS: str = "localhost:9092"
    KAFKA_GROUP_ID: str = "whisper_service"
    
    # Whisper 설정
    WHISPER_MODEL: str = "base.en"
    
    # Kafka 토픽 설정
    KAFKA_TOPIC_AUDIO_RAW: str = "audio.raw"
    KAFKA_TOPIC_TRANSCRIPTION: str = "transcription.completed"
    
    # 로깅 레벨
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings() 