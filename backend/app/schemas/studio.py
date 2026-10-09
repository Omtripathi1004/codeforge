from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class StudioArtifactCreate(BaseModel):
    title: str
    category: str
    prompt: str
    content: Optional[str] = None
    code: Optional[str] = None
    project_id: Optional[str] = None
    tags: Optional[List[str]] = []
    meta_data: Optional[Dict[str, Any]] = None

class StudioArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    project_id: Optional[str] = None
    title: str
    category: str
    prompt: str
    content: str
    preview_url: Optional[str] = None
    tags: List[str] = []
    version: int
    created_at: datetime
    updated_at: datetime
