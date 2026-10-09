from datetime import datetime
import enum
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class MissionStatus(str, enum.Enum):
    IDLE = "IDLE"
    QUEUED = "QUEUED"
    PLANNING = "PLANNING"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    RUNNING = "RUNNING"
    TESTING = "TESTING"
    REPAIRING = "REPAIRING"
    VERIFIED = "VERIFIED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class Mission(Base):
    __tablename__ = "missions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    project_id = Column(String(64), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    issue_number = Column(Integer, default=142)
    issue_title = Column(String(255), nullable=True)
    issue_description = Column(Text, nullable=True)
    objective = Column(Text, nullable=True)
    plan_type = Column(String(50), default="conservative")
    plan = Column(JSON, nullable=True)
    diff = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    status = Column(String(50), default=MissionStatus.IDLE.value)
    current_step_index = Column(Integer, default=0)
    selected_solution_id = Column(String(50), nullable=True)
    custom_instructions = Column(Text, nullable=True)
    solutions_data = Column(JSON, nullable=True)
    events_data = Column(JSON, default=list)
    initial_tests = Column(JSON, nullable=True)
    repaired_tests = Column(JSON, nullable=True)
    repair_cycles = Column(Integer, default=0)
    repair_loop = Column(JSON, nullable=True)
    security_findings = Column(JSON, default=list)
    browser_verification = Column(JSON, nullable=True)
    verification_report = Column(JSON, nullable=True)
    pull_request = Column(JSON, nullable=True)
    github_status = Column(JSON, nullable=True)
    deployment = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="missions")
