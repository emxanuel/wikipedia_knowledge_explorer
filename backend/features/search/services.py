import re

import httpx

from features.search.schemas import SearchResult
from core.config import settings

WIKIPEDIA_API_URL = settings.WIKIPEDIA_API_URL
TIMEOUT = settings.WIKIPEDIA_TIMEOUT
USER_AGENT = settings.WIKIPEDIA_USER_AGENT


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()


async def search_wikipedia(q: str) -> list[SearchResult]:
    params = {
        "action": "query",
        "list": "search",
        "srsearch": q,
        "format": "json",
    }
    async with httpx.AsyncClient(
        timeout=TIMEOUT,
        headers={"User-Agent": USER_AGENT},
    ) as client:
        response = await client.get(WIKIPEDIA_API_URL, params=params)
        response.raise_for_status()
    data = response.json()
    search_list = data.get("query", {}).get("search") or []
    return [
        SearchResult(
            id=str(item["pageid"]),
            title=item["title"],
            snippet=_strip_html(item.get("snippet", "")),
        )
        for item in search_list
    ]
