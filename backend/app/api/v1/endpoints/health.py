"""
Health Check API Endpoints.
Reports operational status of the API, database connectivity, and Nebius AI provider.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.services.ai_service import ai_service
from app.core.config import settings

router = APIRouter()

@router.get("/")
def check_health(db: Session = Depends(get_db)):
    """Comprehensive health check for CodeForge backend."""
    # Check DB
    db_healthy = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_healthy = False

    # Check Nebius AI provider
    ai_status = ai_service.get_provider_status()

    return {
        "status": "healthy" if db_healthy else "degraded",
        "service": "CodeForge Autonomous Backend",
        "version": "1.0.0",
        "database": {
            "status": "connected" if db_healthy else "error",
            "url_type": "postgresql" if "postgres" in settings.DATABASE_URL else "sqlite"
        },
        "ai_provider": ai_status,
        "environment": settings.ENVIRONMENT
    }
