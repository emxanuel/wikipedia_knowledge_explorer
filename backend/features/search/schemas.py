from pydantic import BaseModel


class SearchResult(BaseModel):
    id: str
    title: str
    snippet: str
