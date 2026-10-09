"""
Repository Inspection API Endpoints.
Provides AST file tree browsing, framework detection, and safe source file retrieval.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.api.v1.endpoints.auth import get_current_user
from app.services.repo_service import RepoService
from app.services.execution_service import ExecutionService
from app.core.config import settings

router = APIRouter()

def _get_workspace_for_project(project_id: Optional[str], user_id: str, db: Session) -> str:
    """Helper to resolve workspace root for a given project or fallback to main."""
    if project_id:
        proj = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        if proj and proj.workspace_path:
            return proj.workspace_path
    return settings.BASE_DIR

@router.get("/inspect")
def inspect_repo(
    project_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Inspects framework, dependencies, and git branch of the project."""
    workspace_dir = _get_workspace_for_project(project_id, current_user.id, db)
    repo_service = RepoService(workspace_dir)
    return repo_service.inspect_repository()

@router.get("/files")
def get_file_tree(
    project_id: Optional[str] = None,
    max_depth: int = Query(default=3, ge=1, le=8),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns safe file tree excluding ignored directories (.git, node_modules, etc)."""
    workspace_dir = _get_workspace_for_project(project_id, current_user.id, db)
    repo_service = RepoService(workspace_dir)
    return repo_service.get_file_tree(max_depth=max_depth)

@router.get("/file")
def get_file_content(
    file_path: str,
    project_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Safely retrieves file content with strict path traversal checking."""
    workspace_dir = _get_workspace_for_project(project_id, current_user.id, db)
    exec_service = ExecutionService(workspace_dir)
    content = exec_service.read_file(file_path)
    if content is None:
        raise HTTPException(status_code=404, detail="File not found or permission denied")
    return {
        "path": file_path,
        "content": content,
        "size_bytes": len(content.encode("utf-8"))
    }
