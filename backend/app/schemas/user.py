from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    first_name: Optional[str] = None
    role: Optional[str] = "DEVELOPER"

class UserLogin(BaseModel):
    email: str
    password: str

class GitHubAuthRequest(BaseModel):
    github_token: Optional[str] = None
    github_username: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    first_name: Optional[str] = None
    avatar: Optional[str] = None
    role: str
    provider: str
    github_username: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
