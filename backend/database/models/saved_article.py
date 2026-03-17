from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class SavedArticle(SQLModel, table=True):
    __tablename__ = "saved_articles"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(nullable=False)
    wikipedia_id: str = Field(nullable=False)
    url: str = Field(nullable=False)
    summary: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)
