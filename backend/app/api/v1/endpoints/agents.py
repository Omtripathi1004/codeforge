"""
Agents API Endpoints.
Provides autonomous SWE agent workflows: planning, execution, bounded self-repair,
and live streaming mission event telemetry via Server-Sent Events (SSE).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid
import json
import asyncio

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.mission import Mission, MissionStatus
from app.schemas.agent import AgentPlanRequest, AgentPlanResponse, AgentExecuteRequest, AgentExecuteResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.repo_service import RepoService
from app.services.execution_service import ExecutionService
from app.services.memory_service import MemoryService
from app.agents.orchestrator import AgentOrchestrator
from app.core.config import settings

router = APIRouter()

# In-memory mission event queues for live SSE subscriptions
active_mission_queues: Dict[str, asyncio.Queue] = {}

@router.post("/plan", response_model=AgentPlanResponse)
async def create_plan(
    req: AgentPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes project context and repository AST to generate
    conservative and architectural execution plans.
    """
    workspace_dir = settings.BASE_DIR
    if req.project_id:
        proj = db.query(Project).filter(Project.id == req.project_id, Project.user_id == current_user.id).first()
        if proj and proj.workspace_path:
            workspace_dir = proj.workspace_path

    repo_service = RepoService(workspace_dir)
    exec_service = ExecutionService(workspace_dir)
    mem_service = MemoryService(db)

    orchestrator = AgentOrchestrator(
        repo_service=repo_service,
        execution_service=exec_service,
        db=db,
        memory_service=mem_service
    )

    plan_result = await orchestrator.planner.generate_plan(
        objective=req.objective,
        project_id=req.project_id
    )

    return {
        "objective": req.objective,
        "repo_info": plan_result.get("repo_info", {}),
        "options": plan_result.get("options", {}),
        "status": "PLAN_READY"
    }

@router.post("/execute", response_model=AgentExecuteResponse)
async def execute_mission(
    req: AgentExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Launches an autonomous SWE mission executing tasks, bounded self-repair,
    and SHA-256 evidence hashing in the sandboxed workspace.
    """
    workspace_dir = settings.BASE_DIR
    if req.project_id:
        proj = db.query(Project).filter(Project.id == req.project_id, Project.user_id == current_user.id).first()
        if proj and proj.workspace_path:
            workspace_dir = proj.workspace_path

    mission_id = str(uuid.uuid4())
    mission = Mission(
        id=mission_id,
        user_id=current_user.id,
        project_id=req.project_id,
        status=MissionStatus.QUEUED,
        objective=req.objective,
        plan_type=req.plan_type
    )
    db.add(mission)
    db.commit()

    repo_service = RepoService(workspace_dir)
    exec_service = ExecutionService(workspace_dir)
    mem_service = MemoryService(db)

    orchestrator = AgentOrchestrator(
        repo_service=repo_service,
        execution_service=exec_service,
        db=db,
        memory_service=mem_service
    )

    # Event queue for live SSE subscribers
    queue = asyncio.Queue()
    active_mission_queues[mission_id] = queue

    async def event_callback(evt: Dict[str, Any]):
        await queue.put(evt)

    # Run the mission
    mission_result = await orchestrator.execute_mission(
        mission_id=mission_id,
        objective=req.objective,
        project_id=req.project_id,
        user_id=current_user.id,
        chosen_plan_type=req.plan_type,
        on_event=event_callback
    )

    # Signal completion in the queue
    await queue.put({"event": "DONE", "mission_id": mission_id})

    return {
        "mission_id": mission_id,
        "status": mission_result.get("status", "COMPLETED"),
        "executed_tasks": mission_result.get("executed_tasks", []),
        "verification": mission_result.get("verification", {}),
        "diff": mission_result.get("diff", "")
    }

@router.get("/missions/{mission_id}")
def get_mission(
    mission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves status and details of a specific SWE mission."""
    mission = (
        db.query(Mission)
        .filter(Mission.id == mission_id, Mission.user_id == current_user.id)
        .first()
    )
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission

@router.get("/missions/{mission_id}/events")
async def stream_mission_events(mission_id: str):
    """
    Streams live telemetry events for an active SWE mission via Server-Sent Events.
    """
    queue = active_mission_queues.get(mission_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Active mission event stream not found or completed")

    async def event_stream():
        while True:
            evt = await queue.get()
            yield f"data: {json.dumps(evt)}\n\n"
            if evt.get("event") == "DONE":
                break

    return StreamingResponse(event_stream(), media_type="text/event-stream")
