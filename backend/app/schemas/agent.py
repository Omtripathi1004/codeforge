from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SolutionOptionSchema(BaseModel):
    id: str
    title: str
    subtitle: str
    type: str  # conservative | architectural | custom
    tagline: str
    description: str
    filesAffected: List[str]
    linesAdded: int
    linesRemoved: int
    complexity: str
    risk: str
    securityImpact: str
    performanceImpact: str
    dependencyImpact: str
    testImpact: str
    estimatedEffort: str
    recommended: bool
    explanation: str
    diffs: List[Dict[str, Any]] = []

class AgentPlanRequest(BaseModel):
    task: str
    project_id: Optional[str] = None
    repository: Optional[Dict[str, Any]] = None
    nebius_api_key: Optional[str] = None
    model_name: Optional[str] = None

class AgentPlanResponse(BaseModel):
    solution_a: SolutionOptionSchema
    solution_b: SolutionOptionSchema
    explanation: str

class AgentExecuteRequest(BaseModel):
    project_id: str
    solution_id: str  # solution_a | solution_b | custom
    custom_prompt: Optional[str] = None
    custom_solution: Optional[SolutionOptionSchema] = None
    github_token: Optional[str] = None
    vercel_token: Optional[str] = None
    vercel_project_id: Optional[str] = None
    approve_deploy: Optional[bool] = False
    notifications_settings: Optional[Dict[str, Any]] = None

class AgentExecuteResponse(BaseModel):
    success: bool
    mission_id: str
    files_modified: int
    repair_cycles: int
    tests_passed: int
    tests_total: int
    verification_hash: str
    pull_request: Optional[Dict[str, Any]] = None
    github_status: Optional[Dict[str, Any]] = None
    deployment: Optional[Dict[str, Any]] = None
    notifications: Optional[Dict[str, Any]] = None
    browser_verification: Optional[Dict[str, Any]] = None
