"""
CodeForge Autonomous Backend - Master FastAPI Application.
Built for the Nebius × NVIDIA Global AI Hackathon (Coding & Agentic Engineering).
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.db.base import init_db
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("codeforge-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle startup and shutdown handler."""
    logger.info("Initializing CodeForge SQLite/PostgreSQL Database...")
    init_db()
    logger.info("CodeForge Autonomous Backend initialized successfully.")
    yield
    logger.info("Shutting down CodeForge Backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for CodeForge Autonomous SWE Platform powered by Nebius and NVIDIA Nemotron.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
for origin in settings.CORS_ORIGINS:
    if origin not in origins:
        origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred processing your request."
        }
    )

# Mount Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "CodeForge Autonomous Backend",
        "hackathon": "Nebius x NVIDIA Global AI Hackathon",
        "track": "Coding & Agentic Engineering",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
