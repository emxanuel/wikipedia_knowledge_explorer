from fastapi import HTTPException, status

from features.articles.schemas import ArticleDetail
from features.articles.services import (
    ArticleNotFoundError,
    analyze_text,
    get_article_from_wikipedia,
)


async def get_article_controller(article_id: str) -> ArticleDetail:
    article_id = (article_id or "").strip()
    if not article_id or not article_id.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article id must be a non-empty numeric string.",
        )
    try:
        title, extract, wikipedia_url = await get_article_from_wikipedia(article_id)
    except ArticleNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found.",
        ) from None

    if len(extract) > 500:
        summary = extract[:500].rsplit(" ", 1)[0] + "…"
    else:
        summary = extract

    word_count, top_words = analyze_text(extract)
    return ArticleDetail(
        title=title,
        summary=summary,
        word_count=word_count,
        top_words=top_words,
        wikipedia_url=wikipedia_url,
    )
