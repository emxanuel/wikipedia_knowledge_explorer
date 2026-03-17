import re
from urllib.parse import quote

import httpx

from core.config import settings

WIKIPEDIA_API_URL = settings.WIKIPEDIA_API_URL
TIMEOUT = settings.WIKIPEDIA_TIMEOUT
USER_AGENT = settings.WIKIPEDIA_USER_AGENT
WIKIPEDIA_BASE_URL = "https://en.wikipedia.org/wiki/"

STOP_WORDS = frozenset(
    {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "of", "to", "in", "for", "on", "with", "at", "by", "from", "as",
        "or", "and", "but", "if", "then", "than", "so", "that", "this",
        "it", "its", "they", "them", "their", "he", "she", "his", "her",
    }
)
SUMMARY_MAX_CHARS = 500
TOP_WORDS_LIMIT = 10


class ArticleNotFoundError(Exception):
    """Raised when the Wikipedia page is missing or has no extract."""

    pass


def _build_wikipedia_url(title: str) -> str:
    path = title.replace(" ", "_")
    return WIKIPEDIA_BASE_URL + quote(path, safe="/")


def analyze_text(text: str) -> tuple[int, list[str]]:
    """Return (word_count, top_words) for plain text."""
    words = re.findall(r"[a-zA-Z]+", text.lower())
    word_count = len(words)
    counts: dict[str, int] = {}
    for w in words:
        if len(w) > 1 and w not in STOP_WORDS:
            counts[w] = counts.get(w, 0) + 1
    sorted_words = sorted(counts.items(), key=lambda x: -x[1])
    top_words = [w for w, _ in sorted_words[:TOP_WORDS_LIMIT]]
    return word_count, top_words


async def get_article_from_wikipedia(article_id: str) -> tuple[str, str, str]:
    """
    Fetch article by page id. Returns (title, extract_plain_text, wikipedia_url).
    Raises ArticleNotFoundError if page is missing or has no extract.
    """
    params = {
        "action": "query",
        "pageids": article_id,
        "prop": "extracts",
        "format": "json",
        "explaintext": "1",
    }
    async with httpx.AsyncClient(
        timeout=TIMEOUT,
        headers={"User-Agent": USER_AGENT},
    ) as client:
        response = await client.get(WIKIPEDIA_API_URL, params=params)
        response.raise_for_status()
    data = response.json()
    pages = data.get("query", {}).get("pages") or {}
    page = pages.get(article_id)
    if not page or page.get("missing"):
        raise ArticleNotFoundError(f"Page {article_id} not found")
    title = page.get("title", "")
    extract = (page.get("extract") or "").strip()
    if not extract:
        raise ArticleNotFoundError(f"Page {article_id} has no extract")
    wikipedia_url = _build_wikipedia_url(title)
    return title, extract, wikipedia_url
