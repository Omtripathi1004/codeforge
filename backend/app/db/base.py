from app.db.session import Base, engine
from app.models.user import User
from app.models.project import Project
from app.models.conversation import Conversation, Message
from app.models.mission import Mission
from app.models.studio import StudioArtifact

def init_db():
    Base.metadata.create_all(bind=engine)
