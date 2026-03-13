from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session

from database.session import get_session
from features.auth.controllers import login_controller, register_controller
from features.auth.schemas import LoginRequest, LoginResponse, RegisterRequest, UserRead


auth_router = APIRouter(tags=["auth"])


@auth_router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    session: Session = Depends(get_session),
) -> UserRead:
    return register_controller(payload, session)


@auth_router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    payload: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
) -> LoginResponse:
    login_response, session_id = login_controller(payload, session)
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return login_response

