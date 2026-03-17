from fastapi import HTTPException, status

from features.search.schemas import SearchResult
from features.search.services import search_wikipedia


async def search_controller(q: str) -> list[SearchResult]:
    q_stripped = (q or "").strip()
    if not q_stripped:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter 'q' is required and cannot be empty.",
        )
    return await search_wikipedia(q_stripped)
