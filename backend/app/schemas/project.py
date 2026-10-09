from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    github_repo: Optional[str] = None
    branch: Optional[str] = "main"
    framework: Optional[str] = "Next.js"
    repository_data: Optional[Dict[str, Any]] = None
    initial_task: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    github_repo: Optional[str] = None
    branch: Optional[str] = None
    framework: Optional[str] = None
    tags: Optional[List[str]] = None
    is_archived: Optional[bool] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    github_repo: Optional[str] = None
    branch: Optional[str] = "main"
    framework: Optional[str] = "Next.js"
    repository_data: Optional[Dict[str, Any]] = None
    workspace_path: str
    tags: List[str] = []
    is_archived: bool = False
    version: str
    created_at: datetime
    updated_at: datetime
