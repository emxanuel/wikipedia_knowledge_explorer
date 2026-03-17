import re
from typing import Literal
import unicodedata
from urllib.parse import quote

import httpx

from core.config import settings

WIKIPEDIA_API_URL = settings.WIKIPEDIA_API_URL
TIMEOUT = settings.WIKIPEDIA_TIMEOUT
USER_AGENT = settings.WIKIPEDIA_USER_AGENT
WIKIPEDIA_BASE_URL = settings.WIKIPEDIA_BASE_URL


# Unicode normalization forms and category constants for readability.
UNICODE_NORMALIZATION_CANONICAL_COMPAT: Literal["NFC", "NFD", "NFKC", "NFKD"] = "NFKC"  # Canonical + compatibility composition
UNICODE_NORMALIZATION_DECOMPOSED: Literal["NFC", "NFD", "NFKC", "NFKD"] = "NFD"         # Canonical decomposition
UNICODE_CATEGORY_NONSPACING_MARK: Literal["Mn", "Mc", "Nd", "Pc"] = "Mn"          # Non-spacing combining mark (e.g. accents)

STOP_WORDS = frozenset(
    {
        "the",
        "a",
        "an",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "of",
        "to",
        "in",
        "for",
        "on",
        "with",
        "at",
        "by",
        "from",
        "as",
        "or",
        "and",
        "but",
        "if",
        "then",
        "than",
        "so",
        "that",
        "this",
        "it",
        "its",
        "they",
        "them",
        "their",
        "he",
        "she",
        "his",
        "her",
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


def _normalize_for_analysis(text: str) -> list[str]:
    """Normalize English text and return analysis tokens."""
    # Unicode normalize to canonical + compatibility composition, then lowercase.
    normalized = unicodedata.normalize(UNICODE_NORMALIZATION_CANONICAL_COMPAT, text).lower()
    # Decompose and strip combining marks (accents), though for English this is mostly a no-op.
    normalized = "".join(
        c
        for c in unicodedata.normalize(UNICODE_NORMALIZATION_DECOMPOSED, normalized)
        if unicodedata.category(c) != UNICODE_CATEGORY_NONSPACING_MARK
    )
    # Collapse whitespace.
    normalized = re.sub(r"\s+", " ", normalized).strip()
    # Tokenize on ASCII letters only (English).
    tokens = re.findall(r"[a-z]+", normalized)
    # Remove very short tokens and stopwords.
    return [t for t in tokens if len(t) > 1 and t not in STOP_WORDS]


def analyze_text(text: str) -> tuple[int, list[str]]:
    """Return (word_count, top_words) for plain English text."""
    tokens = _normalize_for_analysis(text)
    word_count = len(tokens)
    counts: dict[str, int] = {}
    for token in tokens:
        counts[token] = counts.get(token, 0) + 1
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
