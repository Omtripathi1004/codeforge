from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class MessageCreate(BaseModel):
    content: str
    role: Optional[str] = "user"
    agent_role: Optional[str] = None
    stream: Optional[bool] = False

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    agent_role: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationCreate(BaseModel):
    project_id: Optional[str] = None
    title: str

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str] = None
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)
