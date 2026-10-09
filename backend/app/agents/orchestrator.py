"""
Autonomous SWE Agent Orchestrator for CodeForge.
Coordinates the end-to-end engineering mission:
1. Understands request & context
2. Plans tasks (A/B options)
3. Executes code modifications via sandboxed workspace
4. Runs tests & validation checks
5. Bounded self-repair loop (up to 3 retries)
6. Verifies SHA-256 evidence hashes and security audit
7. Requires user approval before Git/GitHub operations
"""
from typing import Dict, Any, List, Optional, Callable, AsyncGenerator
import json
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session

from app.services.repo_service import RepoService
from app.services.execution_service import ExecutionService
from app.services.memory_service import MemoryService
from app.services.github_service import GitHubService
from app.agents.planner import AgentPlanner
from app.agents.coder import AgentCoder
from app.agents.repairer import AgentRepairer
from app.agents.verifier import AgentVerifier
from app.models.mission import Mission, MissionStatus

class AgentOrchestrator:
    """Master controller for autonomous software engineering tasks."""

    def __init__(
        self,
        repo_service: RepoService,
        execution_service: ExecutionService,
        db: Optional[Session] = None,
        memory_service: Optional[MemoryService] = None,
        github_service: Optional[GitHubService] = None
    ):
        self.repo_service = repo_service
        self.exec_service = execution_service
        self.db = db
        self.memory_service = memory_service or (MemoryService(db) if db else None)
        self.github_service = github_service or GitHubService()

        self.planner = AgentPlanner(self.repo_service, self.memory_service)
        self.coder = AgentCoder(self.exec_service)
        self.repairer = AgentRepairer(self.exec_service, max_retries=3)
        self.verifier = AgentVerifier(self.exec_service)

    async def execute_mission(
        self,
        mission_id: str,
        objective: str,
        project_id: Optional[str] = None,
        user_id: Optional[str] = None,
        chosen_plan_type: str = "conservative",
        on_event: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        """
        Runs the complete autonomous engineering lifecycle.
        Emits real structured events at each stage.
        """
        async def emit(event_type: str, message: str, payload: Optional[Dict[str, Any]] = None):
            evt = {
                "timestamp": datetime.utcnow().isoformat(),
                "mission_id": mission_id,
                "event": event_type,
                "message": message,
                "data": payload or {}
            }
            if on_event:
                if asyncio.iscoroutinefunction(on_event):
                    await on_event(evt)
                else:
                    on_event(evt)
            return evt

        # 1. Start mission: Planning phase
        await emit("MISSION_STARTED", f"Initializing SWE mission: {objective}")
        self._update_mission_status(mission_id, MissionStatus.PLANNING, objective)

        await emit("PLANNING", "Scanning codebase AST and retrieving project memory...")
        plan_result = await self.planner.generate_plan(objective, project_id=project_id)
        selected_plan = plan_result["options"].get(chosen_plan_type, plan_result["active_plan"])

        await emit("PLAN_GENERATED", f"Generated execution plan ({chosen_plan_type}) with {len(selected_plan.get('tasks', []))} tasks", {
            "plan": selected_plan
        })

        # 2. Execution phase
        self._update_mission_status(mission_id, MissionStatus.RUNNING, plan=selected_plan)
        tasks = selected_plan.get("tasks", [])
        executed_tasks = []
        affected_files = set(selected_plan.get("affected_files", []))

        for task in tasks:
            await emit("TASK_RUNNING", f"Executing task #{task.get('id')}: {task.get('description')}")
            task_result = await self.coder.execute_task(task)
            executed_tasks.append(task_result)
            if task.get("file"):
                affected_files.add(task.get("file"))
            await emit("TASK_COMPLETED", f"Completed task #{task.get('id')} ({task_result.get('status')})", task_result)

        # 3. Validation / Testing phase
        self._update_mission_status(mission_id, MissionStatus.TESTING)
        await emit("TESTING", "Executing verification checks in sandboxed workspace...")
        validation_commands = selected_plan.get("validation_commands", ["npm test"])
        
        verification = await self.verifier.run_verification_suite(
            validation_commands=validation_commands,
            affected_files=list(affected_files)
        )

        # 4. Self-Repair loop if tests fail
        retry_count = 0
        while not verification.get("all_tests_passed") and retry_count < 3:
            retry_count += 1
            await emit("REPAIR_INITIATED", f"Test failures detected. Triggering bounded self-repair (attempt {retry_count}/3)...", {
                "test_results": verification.get("test_results")
            })

            # Grab failure log from first failed command
            failed_cmd = next((t for t in verification.get("test_results", []) if t.get("exit_code") != 0), {})
            failure_log = failed_cmd.get("output", "Unknown test assertion failure")

            repair_res = await self.repairer.attempt_repair(
                failure_log=failure_log,
                affected_files=list(affected_files),
                retry_count=retry_count,
                objective=objective
            )

            await emit("REPAIR_RESULT", f"Repair attempt {retry_count}: {repair_res.get('status')}", repair_res)

            if repair_res.get("status") == "REPAIR_APPLIED":
                # Re-run validation
                verification = await self.verifier.run_verification_suite(
                    validation_commands=validation_commands,
                    affected_files=list(affected_files)
                )
            else:
                break

        # 5. Check if repair resolved or escalated
        if not verification.get("all_tests_passed"):
            self._update_mission_status(
                mission_id,
                MissionStatus.FAILED,
                error="Tests failed after bounded repair attempts. Human intervention required."
            )
            await emit("MISSION_ESCALATED", "Self-repair limit reached. Escalated to developer review.", {
                "verification": verification,
                "retries": retry_count
            })
            return {
                "mission_id": mission_id,
                "status": "ESCALATED_UNRESOLVED",
                "verification": verification,
                "plan": selected_plan,
                "executed_tasks": executed_tasks
            }

        # 6. Check security audit
        if not verification.get("security_audit", {}).get("passed", True):
            self._update_mission_status(
                mission_id,
                MissionStatus.FAILED,
                error="Security audit failed: Potential secret leaks or unsafe operations."
            )
            await emit("SECURITY_REJECTED", "Security policy violation detected in modified code.", verification.get("security_audit"))
            return {
                "mission_id": mission_id,
                "status": "SECURITY_VIOLATION",
                "verification": verification
            }

        # 7. Record architectural decision in persistent memory
        if self.memory_service and project_id:
            self.memory_service.record_architectural_decision(
                project_id=project_id,
                decision_summary=f"Completed {objective[:50]}",
                rationale=selected_plan.get("description", ""),
                files_affected=list(affected_files)
            )

        # 8. Mission complete locally, awaiting approval for remote GitHub PR
        self._update_mission_status(
            mission_id,
            MissionStatus.AWAITING_APPROVAL,
            diff="Changes verified in sandbox with cryptographic evidence hashes."
        )

        await emit("MISSION_VERIFIED", "All changes applied and verified with SHA-256 evidence hashes. Ready for review and PR.", {
            "evidence_hashes": verification.get("evidence_hashes"),
            "affected_files": list(affected_files)
        })

        return {
            "mission_id": mission_id,
            "status": "AWAITING_APPROVAL",
            "plan": selected_plan,
            "executed_tasks": executed_tasks,
            "verification": verification,
            "affected_files": list(affected_files)
        }

    def _update_mission_status(
        self,
        mission_id: str,
        status: MissionStatus,
        objective: Optional[str] = None,
        plan: Optional[Dict[str, Any]] = None,
        diff: Optional[str] = None,
        error: Optional[str] = None
    ):
        """Updates the mission entity in database if active session exists."""
        if not self.db:
            return
        m = self.db.query(Mission).filter(Mission.id == mission_id).first()
        if m:
            m.status = status
            if plan:
                m.plan = plan
            if diff:
                m.diff = diff
            if error:
                m.error = error
            self.db.commit()
