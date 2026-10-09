"""
Terminal & Execution API Endpoints.
Provides sandboxed command execution with strict timeouts, blacklists, and log capture.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.api.v1.endpoints.auth import get_current_user
from app.services.execution_service import ExecutionService
from app.core.config import settings

router = APIRouter()

class TerminalExecRequest(BaseModel):
    command: str
    project_id: Optional[str] = None

class TerminalExecResponse(BaseModel):
    command: str
    exit_code: int
    output: str
    duration_seconds: float
    status: str

@router.post("/exec", response_model=TerminalExecResponse)
async def execute_command(
    req: TerminalExecRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes a command inside the project's sandboxed workspace.
    Enforces timeout and security blacklists.
    """
    workspace_dir = settings.BASE_DIR
    if req.project_id:
        proj = db.query(Project).filter(Project.id == req.project_id, Project.user_id == current_user.id).first()
        if proj and proj.workspace_path:
            workspace_dir = proj.workspace_path

    exec_service = ExecutionService(workspace_dir)
    res = await exec_service.run_command(req.command)

    return {
        "command": req.command,
        "exit_code": res.get("exit_code", -1),
        "output": res.get("output", ""),
        "duration_seconds": res.get("duration_seconds", 0.0),
        "status": "SUCCESS" if res.get("exit_code") == 0 else "ERROR"
    }
