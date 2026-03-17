from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from database.models.users import Users
from database.session import get_session
from features.auth.dependencies import get_current_user
from features.saved_articles.controllers import (
    create_controller,
    delete_controller,
    list_controller,
)
from features.saved_articles.schemas import SavedArticleCreate, SavedArticleRead

saved_articles_router = APIRouter(prefix="/saved_articles", tags=["saved_articles"])


@saved_articles_router.post(
    "",
    response_model=SavedArticleRead,
    status_code=status.HTTP_201_CREATED,
)
def create_saved_article(
    payload: SavedArticleCreate,
    session: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
) -> SavedArticleRead:
    return create_controller(session, user, payload)


@saved_articles_router.get(
    "",
    response_model=list[SavedArticleRead],
)
def list_saved_articles(
    session: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
) -> list[SavedArticleRead]:
    return list_controller(session, user)


@saved_articles_router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_saved_article(
    id: int,
    session: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
) -> None:
    delete_controller(session, user, id)
