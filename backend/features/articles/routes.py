from fastapi import APIRouter

from features.articles.controllers import get_article_controller
from features.articles.schemas import ArticleDetail

articles_router = APIRouter(tags=["articles"])


@articles_router.get(
    "/articles/{id}",
    response_model=ArticleDetail,
)
async def get_article(id: str) -> ArticleDetail:
    return await get_article_controller(id)
