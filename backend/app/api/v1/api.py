"""
API v1 Router Aggregator.
Consolidates endpoints for Auth, Projects, Conversations, Autonomous Agents,
Repositories, Terminal, GitHub, Creative Studio, and Health.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    projects,
    conversations,
    agents,
    repos,
    terminal,
    github,
    studio,
    health
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
api_router.include_router(agents.router, prefix="/agents", tags=["Autonomous Agents"])
api_router.include_router(repos.router, prefix="/repos", tags=["Repository Intelligence"])
api_router.include_router(terminal.router, prefix="/terminal", tags=["Sandboxed Execution"])
api_router.include_router(github.router, prefix="/github", tags=["GitHub Workflows"])
api_router.include_router(studio.router, prefix="/studio", tags=["Creative Studio"])
