from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI

from core.logging import setup_logging
from core.config import settings
from features.auth.routes import auth_router
from middlewares.exception_handler import exception_handler_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    yield
    logging.info("Shutting down...")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        lifespan=lifespan,
    )
    app.middleware("http")(exception_handler_middleware)
    app.include_router(auth_router, prefix="/auth")
    return app