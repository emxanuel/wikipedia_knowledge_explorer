from datetime import datetime

from sqlmodel import Session, select

from database.models.saved_article import SavedArticle
from features.saved_articles.schemas import SavedArticleCreate


def create_saved_article(
    session: Session,
    user_id: int,
    payload: SavedArticleCreate,
) -> SavedArticle:
    article = SavedArticle(
        user_id=user_id,
        title=payload.title,
        wikipedia_id=payload.wikipedia_id,
        url=payload.url,
        summary=payload.summary,
    )
    session.add(article)
    session.commit()
    session.refresh(article)
    return article


def list_saved_articles(session: Session, user_id: int) -> list[SavedArticle]:
    statement = select(SavedArticle).where(
        SavedArticle.user_id == user_id,
        SavedArticle.deleted_at.is_(None),
    )
    return list(session.exec(statement).all())


def delete_saved_article(
    session: Session,
    article_id: int,
    user_id: int,
) -> None:
    statement = select(SavedArticle).where(
        SavedArticle.id == article_id,
        SavedArticle.user_id == user_id,
        SavedArticle.deleted_at.is_(None),
    )
    article = session.exec(statement).first()
    if article is None:
        raise LookupError("Saved article not found")
    article.deleted_at = datetime.utcnow()
    session.add(article)
    session.commit()
