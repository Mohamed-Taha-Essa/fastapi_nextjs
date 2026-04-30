from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.router import api_router
from db.database  

def create_app() -> FastAPI:
    app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.VERSION
)
    return app

app = create_app()

# include routers


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
    

