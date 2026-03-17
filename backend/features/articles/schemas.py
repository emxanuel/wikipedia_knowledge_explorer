from pydantic import BaseModel


class ArticleDetail(BaseModel):
    title: str
    summary: str
    word_count: int
    top_words: list[str]
    wikipedia_url: str
