from fastapi import APIRouter

from features.search.controllers import search_controller
from features.search.schemas import SearchResult

search_router = APIRouter(tags=["search"])


@search_router.get(
    "/search",
    response_model=list[SearchResult],
)
async def search(q: str = "") -> list[SearchResult]:
    return await search_controller(q)
