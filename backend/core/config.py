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
    WIKIPEDIA_API_URL: str = "https://en.wikipedia.org/w/api.php"
    WIKIPEDIA_BASE_URL: str = "https://en.wikipedia.org/wiki/"
    WIKIPEDIA_TIMEOUT: float = 10.0
    WIKIPEDIA_USER_AGENT: str = "WikipediaKnowledgeExplorer/1.0 (https://github.com; technical assessment)"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/wikipedia_knowledge_explorer"


@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
