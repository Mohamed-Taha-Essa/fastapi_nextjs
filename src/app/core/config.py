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

    # database settings
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