"""
Conversations API Endpoints.
Provides chat sessions, message history, project-aware context retrieval,
and real-time streaming AI responses via Server-Sent Events (SSE).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
import json
import asyncio

from app.db.session import get_db
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.models.project import Project
from app.schemas.conversation import MessageCreate, MessageResponse, ConversationResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.memory_service import MemoryService

router = APIRouter()

@router.get("/", response_model=List[ConversationResponse])
def list_conversations(
    project_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists conversations for the user, optionally filtered by project."""
    q = db.query(Conversation).filter(Conversation.user_id == current_user.id)
    if project_id:
        q = q.filter(Conversation.project_id == project_id)
    return q.order_by(Conversation.updated_at.desc()).all()

@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    title: str = "New Conversation",
    project_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new conversation session."""
    conv_id = str(uuid.uuid4())
    conv = Conversation(
        id=conv_id,
        user_id=current_user.id,
        project_id=project_id,
        title=title
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all messages for a specific conversation."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages

@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def post_message(
    conversation_id: str,
    req: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Saves a user message and generates a synchronous AI reply."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # 1. Store user message
    user_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=req.content
    )
    db.add(user_msg)
    db.commit()

    # 2. Gather conversation history and project memory
    memory_service = MemoryService(db)
    project_ctx = {}
    if conv.project_id:
        project_ctx = memory_service.get_project_context(conv.project_id)

    history = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(10)
        .all()
    )

    messages_payload = [
        {"role": "system", "content": f"You are CodeForge AI assistant powered by Qwen3-Coder on OpenRouter. Project Context: {json.dumps(project_ctx)}"}
    ]
    for h in history:
        messages_payload.append({"role": h.role, "content": h.content})

    # 3. Call AI service
    ai_res = await ai_service.chat_completion(messages_payload)
    reply_content = ai_res.get("content", "I encountered an issue processing your request.")

    # 4. Store assistant message
    asst_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="assistant",
        content=reply_content
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return asst_msg

@router.get("/{conversation_id}/stream")
async def stream_conversation_response(
    conversation_id: str,
    prompt: str,
    token: str = None,
    db: Session = Depends(get_db)
):
    """
    Server-Sent Events (SSE) streaming endpoint for live AI responses.
    """
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Store user message
    user_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=prompt
    )
    db.add(user_msg)
    db.commit()

    async def event_generator():
        asst_id = str(uuid.uuid4())
        full_chunks = []
        messages_payload = [
            {"role": "system", "content": "You are CodeForge AI assistant. Answer with high technical precision."},
            {"role": "user", "content": prompt}
        ]

        async for chunk in ai_service.chat_stream(messages_payload):
            full_chunks.append(chunk)
            yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"

        complete_text = "".join(full_chunks)
        # Store final assistant message in DB
        asst_msg = Message(
            id=asst_id,
            conversation_id=conversation_id,
            role="assistant",
            content=complete_text
        )
        db.add(asst_msg)
        db.commit()

        yield f"data: {json.dumps({'content': '', 'done': True, 'id': asst_id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
