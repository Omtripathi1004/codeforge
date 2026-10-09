from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    github_repo = Column(String(255), nullable=True)
    branch = Column(String(100), default="main")
    framework = Column(String(100), default="Next.js")
    repository_data = Column(JSON, nullable=True)
    meta = Column(JSON, default=dict)
    workspace_path = Column(String(500), nullable=False)
    tags = Column(JSON, default=list)
    is_archived = Column(Boolean, default=False)
    version = Column(String(20), default="1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    conversations = relationship("Conversation", back_populates="project", cascade="all, delete-orphan")
    missions = relationship("Mission", back_populates="project", cascade="all, delete-orphan")
