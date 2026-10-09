"""
Memory Service for CodeForge.
Maintains persistent project-scoped memory, architectural decisions,
coding conventions, and cross-session context retrieval.
"""
from typing import List, Dict, Any, Optional
import json
import os
from sqlalchemy.orm import Session
from app.models.conversation import Conversation, Message
from app.models.project import Project

class MemoryService:
    """Manages project memory, decisions log, and context retrieval."""

    def __init__(self, db: Session):
        self.db = db

    def get_project_context(self, project_id: str, limit_messages: int = 20) -> Dict[str, Any]:
        """
        Retrieves project-scoped context including description, repository metadata,
        recent architectural decisions, and most recent messages across active conversations.
        """
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"error": "Project not found"}

        # Extract stored project memories from metadata if available
        meta = project.meta or {}
        decisions = meta.get("architectural_decisions", [])
        conventions = meta.get("coding_conventions", [
            "Use TypeScript strict mode where applicable",
            "Write modular, testable components with single responsibilities",
            "Follow RESTful conventions with structured error payloads",
            "Handle loading and edge states gracefully"
        ])

        # Retrieve recent messages from the project's conversations
        recent_messages = []
        conversations = (
            self.db.query(Conversation)
            .filter(Conversation.project_id == project_id)
            .order_by(Conversation.updated_at.desc())
            .limit(5)
            .all()
        )

        for conv in conversations:
            msgs = (
                self.db.query(Message)
                .filter(Message.conversation_id == conv.id)
                .order_by(Message.created_at.asc())
                .limit(limit_messages)
                .all()
            )
            for m in msgs:
                recent_messages.append({
                    "conversation_id": conv.id,
                    "role": m.role,
                    "content": m.content[:500] if m.content else "",
                    "created_at": m.created_at.isoformat() if m.created_at else None
                })

        return {
            "project_id": project.id,
            "project_name": project.name,
            "description": project.description,
            "repository": project.github_repo,
            "branch": project.branch,
            "framework": project.framework,
            "coding_conventions": conventions,
            "architectural_decisions": decisions[-10:],  # last 10 decisions
            "recent_context": recent_messages[-limit_messages:]
        }

    def record_architectural_decision(
        self,
        project_id: str,
        decision_summary: str,
        rationale: str,
        files_affected: List[str]
    ) -> bool:
        """Stores a new architectural decision into the project's persistent memory."""
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return False

        meta = dict(project.meta or {})
        decisions = meta.get("architectural_decisions", [])
        decisions.append({
            "summary": decision_summary,
            "rationale": rationale,
            "files_affected": files_affected
        })
        meta["architectural_decisions"] = decisions
        project.meta = meta
        self.db.commit()
        return True

    def clear_project_memory(self, project_id: str) -> bool:
        """Clears stored architectural memory while preserving basic project metadata."""
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return False

        meta = dict(project.meta or {})
        meta["architectural_decisions"] = []
        project.meta = meta
        self.db.commit()
        return True
