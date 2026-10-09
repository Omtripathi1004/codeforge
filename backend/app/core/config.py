import os
from typing import List, Union
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeForge Autonomous SWE Engine"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    SECRET_KEY: str = "codeforge_development_secret_key_change_in_production_jwt_signature"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    DATABASE_URL: str = "sqlite:///./data/codeforge_backend.db"
    
    # OpenRouter & Qwen3-Coder Configuration (Primary AI Provider)
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "qwen/qwen3-coder"
    OPENROUTER_MAX_TOKENS: int = 4096
    OPENROUTER_TEMPERATURE: float = 0.2
    
    # GitHub Integration
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_DEFAULT_TOKEN: str = ""
    GITHUB_TOKEN: str = ""
    
    # Sandbox Execution
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
    WORKSPACE_BASE_DIR: str = "./data/workspaces"
    WORKSPACE_ROOT: str = "./data/workspaces"
    EXECUTION_TIMEOUT_SECONDS: int = 30
    SANDBOX_CPU_LIMIT: str = "2.0 vCPU"
    SANDBOX_MEMORY_LIMIT: str = "4096 MB"
    
    # Notification Adapters
    N8N_WEBHOOK_URL: str = "https://n8n.internal.workflow/webhook/codeforge-mission-events"
    N8N_ENABLED: bool = True
    RESEND_API_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
