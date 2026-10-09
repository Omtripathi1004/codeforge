"""
Agent Planner for CodeForge.
Analyzes the user's objective, inspects repository context,
and produces structured plans with tasks, risk analysis, and validation strategies.
"""
from typing import Dict, Any, List, Optional
import json
from app.services.ai_service import ai_service
from app.services.repo_service import RepoService
from app.services.memory_service import MemoryService

class AgentPlanner:
    """Produces engineering plans for SWE agent missions."""

    def __init__(self, repo_service: RepoService, memory_service: Optional[MemoryService] = None):
        self.repo_service = repo_service
        self.memory_service = memory_service

    async def generate_plan(
        self,
        objective: str,
        project_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Gathers repo context, recent decisions, and calls Nebius Nemotron
        to generate an execution plan.
        """
        # 1. Inspect repository context
        repo_info = self.repo_service.inspect_repository()
        dependencies = self.repo_service.get_dependencies()
        file_tree = self.repo_service.get_file_tree(max_depth=3)

        # 2. Extract recent project memory if available
        recent_memory = {}
        if self.memory_service and project_id:
            recent_memory = self.memory_service.get_project_context(project_id)

        # 3. Assemble combined prompt context
        combined_context = {
            "objective": objective,
            "project_name": repo_info.get("name", "Current Workspace"),
            "framework": repo_info.get("framework", "Unknown"),
            "dependencies": dependencies,
            "file_tree": file_tree[:35],
            "coding_conventions": recent_memory.get("coding_conventions", []),
            "prior_decisions": recent_memory.get("architectural_decisions", [])
        }

        # 4. Generate structured plan via AI service
        ai_plan = await ai_service.generate_structured_plan(objective, combined_context)

        # 5. Format plan into conservative and architectural options
        conservative_plan = {
            "plan_type": "conservative",
            "title": f"Minimal Intervention: {objective[:40]}...",
            "description": "Minimal risk changes focusing directly on the reported requirements without wide refactoring.",
            "tasks": ai_plan.get("tasks", [
                {"id": 1, "description": "Inspect and update specific target files", "file": "src/app/page.tsx"}
            ]),
            "affected_files": ai_plan.get("affected_files", []),
            "risks": ai_plan.get("risks", ["Minimal regression risk"]),
            "validation_commands": ai_plan.get("validation_commands", ["npm test"])
        }

        architectural_plan = {
            "plan_type": "architectural",
            "title": f"Comprehensive Enhancement: {objective[:40]}...",
            "description": "Full end-to-end integration including dedicated service layer, comprehensive tests, and interface documentation.",
            "tasks": [
                *ai_plan.get("tasks", []),
                {"id": len(ai_plan.get("tasks", [])) + 1, "description": "Add regression tests and runtime verification", "file": "tests/verify.py"}
            ],
            "affected_files": list(set(ai_plan.get("affected_files", []) + ["backend/tests/test_flow.py"])),
            "risks": ["Requires thorough validation across multiple modules"],
            "validation_commands": ai_plan.get("validation_commands", ["npm test", "npm run build"])
        }

        return {
            "objective": objective,
            "repo_info": repo_info,
            "active_plan": conservative_plan,
            "options": {
                "conservative": conservative_plan,
                "architectural": architectural_plan
            },
            "status": "PLAN_READY"
        }
