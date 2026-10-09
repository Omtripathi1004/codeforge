"""
Creative Studio API Endpoints.
Manages creative sessions, 3D scene presets, generative shader artifacts,
and creative prompts independently from the Coding workspace.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.studio import StudioArtifact
from app.schemas.studio import StudioArtifactCreate, StudioArtifactResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter()

@router.get("/artifacts", response_model=List[StudioArtifactResponse])
def list_artifacts(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves creative artifacts created by the user."""
    q = db.query(StudioArtifact).filter(StudioArtifact.user_id == current_user.id)
    if category:
        q = q.filter(StudioArtifact.category == category)
    return q.order_by(StudioArtifact.created_at.desc()).all()

@router.post("/artifacts", response_model=StudioArtifactResponse, status_code=status.HTTP_201_CREATED)
def create_artifact(
    req: StudioArtifactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new creative studio artifact."""
    artifact_id = str(uuid.uuid4())
    artifact_content = req.content or req.code or "// Generative visual artifact"

    artifact = StudioArtifact(
        id=artifact_id,
        user_id=current_user.id,
        title=req.title,
        category=req.category,
        prompt=req.prompt,
        content=artifact_content,
        tags=req.tags or []
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    return artifact

@router.post("/generate", response_model=StudioArtifactResponse)
async def generate_creative_code(
    title: str,
    prompt: str,
    category: str = "shader",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a creative shader, Three.js component, or canvas visual using Nebius AI.
    """
    sys_prompt = (
        "You are an expert Creative Technologist and WebGL/Three.js shader engineer. "
        "Generate stunning, production-ready creative code matching the user's prompt. "
        "Output ONLY the code or GLSL/TypeScript component wrapped in markdown."
    )
    messages = [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": f"Create {category}: {prompt}"}
    ]

    ai_res = await ai_service.chat_completion(messages, temperature=0.7)
    code = ai_res.get("content", "// Generative output")

    artifact_id = str(uuid.uuid4())
    artifact = StudioArtifact(
        id=artifact_id,
        user_id=current_user.id,
        title=title,
        category=category,
        prompt=prompt,
        content=code,
        tags=["generative", category]
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    return artifact
