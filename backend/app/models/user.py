from datetime import datetime
import enum
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserRole(str, enum.Enum):
    USER = "USER"
    DEVELOPER = "DEVELOPER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    salt = Column(String(64), nullable=True)
    name = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    avatar = Column(String(500), nullable=True)
    role = Column(String(50), default="DEVELOPER")  # USER | DEVELOPER
    provider = Column(String(50), default="email")  # email | github | google
    github_username = Column(String(100), nullable=True)
    github_token = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    artifacts = relationship("StudioArtifact", back_populates="user", cascade="all, delete-orphan")
