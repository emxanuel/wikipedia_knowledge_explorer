from pydantic import BaseModel


class SavedArticleCreate(BaseModel):
    title: str
    wikipedia_id: str
    url: str
    summary: str


class SavedArticleRead(BaseModel):
    id: int
    title: str
    wikipedia_id: str
    url: str
    summary: str
