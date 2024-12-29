from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    KAFKA_BROKERS: str = "localhost:9092"
    WHISPER_MODEL: str = "base.en"
    
    class Config:
        env_file = ".env"

settings = Settings() 