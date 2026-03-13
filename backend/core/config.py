from enum import Enum
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Wikipedia Knowledge Explorer API"
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    LOG_LEVEL: str = "info"
    RELOAD: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/wikipedia_knowledge_explorer"


@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
