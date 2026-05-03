import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    API_V1_PREFIX: str = '/api/v1'
    SERVICE_NAME: str = 'Chat Service'
    VERSION: str = '1.0.0'

    # server settings
    HOST: str = '0.0.0.0'
    PORT: int = 8001
    DEBUG: bool = True

    # auth settings
    JWT_SECRET_KEY: str = 'change-me-in-production-secret-key'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    #ai settings names of models and vector db 
    embeding_model_name: str = ''
    vector_db_name: str = ''    
    chunk_size: int = 1000
    chunk_overlap: int = 200    
    llm_model_name: str = ''
    
    #celery settings
    CELERY_BROKER_URL: str = 'redis://localhost:6379/0' #for message queue
    CELERY_RESULT_BACKEND: str = 'redis://localhost:6379/0' #for storing results
    

    #database settings
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'my_database.db')}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()