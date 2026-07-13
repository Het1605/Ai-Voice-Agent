"""
Purpose: Centralized configuration management for the backend platform.
Responsibilities:
  - Loads and validates environment variables from .env files.
  - Exposes type-safe settings for App configuration, Database connections,
    Redis, Security parameters, and CORS rules.
  - Ensures a single validation checkpoint at startup.
Architecture Fit:
  - Core component loaded at application boot.
  - Referenced by the main FastAPI app, databases, and core server configurations.
"""

from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "AI Phone Agent Platform"
    ENVIRONMENT: str = "development"  # Options: development, production
    API_V1_STR: str = "/api/v1"

    # Security Settings
    JWT_SECRET_KEY: str = "dev_secret_key_change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v

    # Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "ai_phone_agent"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def DATABASE_URL_SYNC(self) -> str:
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # VAD Settings
    VAD_THRESHOLD: float = 0.5
    VAD_SAMPLE_RATE: int = 16000
    VAD_FRAME_SIZE: int = 512

    # STT Settings
    STT_MODEL_SIZE: str = "base"
    STT_COMPUTE_TYPE: str = "default"

    # LLM Settings
    LLM_MODEL_NAME: str = "qwen2.5:3b"
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # TTS Settings
    TTS_MODEL: str = "kokoro-v1.0.onnx"
    TTS_VOICES_FILE: str = "voices-v1.0.bin"
    TTS_DEFAULT_VOICE: str = "af_heart"
    TTS_SAMPLE_RATE: int = 24000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
