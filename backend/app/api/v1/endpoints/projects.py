"""
Projects API Endpoints.
Allows creating, listing, viewing, and managing isolated developer projects.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import os

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse
from app.api.v1.endpoints.auth import get_current_user
from app.core.config import settings

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all projects owned by the authenticated user."""
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return projects

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    req: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new isolated project and workspace directory."""
    project_id = str(uuid.uuid4())
    
    # Establish isolated filesystem workspace
    workspace_dir = os.path.join(settings.WORKSPACE_ROOT, project_id)
    os.makedirs(workspace_dir, exist_ok=True)

    project = Project(
        id=project_id,
        user_id=current_user.id,
        name=req.name,
        description=req.description,
        github_repo=req.github_repo,
        branch=req.branch or "main",
        framework=req.framework or "Next.js",
        workspace_path=workspace_dir,
        meta={
            "architectural_decisions": [],
            "coding_conventions": [
                "Use TypeScript strict mode where applicable",
                "Write modular, testable components with single responsibilities"
            ]
        }
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gets project details by ID with strict ownership verification."""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or unauthorized access"
        )
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a project and disassociates its records."""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or unauthorized access"
        )
    db.delete(project)
    db.commit()
    return None
