from fastapi import HTTPException, status
from sqlmodel import Session

from database.models.users import Users
from features.saved_articles.schemas import SavedArticleCreate, SavedArticleRead
from features.saved_articles.services import (
    create_saved_article,
    delete_saved_article,
    list_saved_articles,
)


def create_controller(
    session: Session,
    user: Users,
    payload: SavedArticleCreate,
) -> SavedArticleRead:
    article = create_saved_article(session, user.id, payload)  # type: ignore[arg-type]
    return SavedArticleRead.model_validate(article, from_attributes=True)


def list_controller(session: Session, user: Users) -> list[SavedArticleRead]:
    articles = list_saved_articles(session, user.id)  # type: ignore[arg-type]
    return [SavedArticleRead.model_validate(a, from_attributes=True) for a in articles]


def delete_controller(
    session: Session,
    user: Users,
    article_id: int,
) -> None:
    try:
        delete_saved_article(session, article_id, user.id)  # type: ignore[arg-type]
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved article not found",
        ) from None
