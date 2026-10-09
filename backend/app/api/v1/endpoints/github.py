"""
GitHub API Endpoints.
Provides status verification, repository listings, and pull request generation.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from app.services.github_service import GitHubService

router = APIRouter()

class CreatePRRequest(BaseModel):
    repo: str
    title: str
    body: str
    head_branch: str
    base_branch: str = "main"

@router.get("/status")
async def get_github_status(current_user: User = Depends(get_current_user)):
    """Verifies GitHub authorization state."""
    service = GitHubService()
    return await service.verify_auth()

@router.get("/repos")
async def list_github_repos(current_user: User = Depends(get_current_user)):
    """Lists repositories accessible to the configured GitHub credentials."""
    service = GitHubService()
    return await service.list_repositories()

@router.post("/pr")
async def create_pull_request(
    req: CreatePRRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Submits an approved change as a real GitHub Pull Request.
    Reports honest status if credentials or permissions are missing.
    """
    service = GitHubService()
    res = await service.create_pull_request(
        repo=req.repo,
        title=req.title,
        body=req.body,
        head_branch=req.head_branch,
        base_branch=req.base_branch
    )
    return res
