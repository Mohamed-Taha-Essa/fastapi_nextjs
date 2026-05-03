from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.ingestion_routes import router as ingestion_router
from app.api.auth_routes import router as auth_router

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.SERVICE_NAME,
        version=settings.VERSION
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(
        auth_router,
        prefix=settings.API_V1_PREFIX
    )

    app.include_router(
        ingestion_router,
        prefix=settings.API_V1_PREFIX
    )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app

app = create_app()