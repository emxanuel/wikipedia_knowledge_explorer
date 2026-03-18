from enum import Enum
from functools import lru_cache

from pydantic import AnyHttpUrl, PositiveFloat, conint, field_validator
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
    PORT: conint(ge=1, le=65535) = 8000
    DEBUG: bool = False
    WIKIPEDIA_API_URL: str = "https://en.wikipedia.org/w/api.php"
    WIKIPEDIA_BASE_URL: str = "https://en.wikipedia.org/wiki/"
    WIKIPEDIA_TIMEOUT: PositiveFloat = 10.0
    WIKIPEDIA_USER_AGENT: str = "WikipediaKnowledgeExplorer/1.0 (https://github.com; technical assessment)"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/wikipedia_knowledge_explorer"

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"debug", "info", "warning", "error", "critical"}
        if v.lower() not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of {sorted(allowed)}")
        return v.lower()

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith("postgresql+psycopg://"):
            raise ValueError("DATABASE_URL must use 'postgresql+psycopg://' scheme")
        return v

    @field_validator("WIKIPEDIA_USER_AGENT")
    @classmethod
    def validate_user_agent(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("WIKIPEDIA_USER_AGENT must not be empty")
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
