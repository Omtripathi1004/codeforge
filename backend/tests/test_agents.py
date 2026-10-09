"""
Tests for Autonomous SWE Agent Engine (Planning, Execution, Self-Repair).
"""
import pytest
import os
import tempfile
from app.services.repo_service import RepoService
from app.services.execution_service import ExecutionService
from app.agents.planner import AgentPlanner
from app.agents.repairer import AgentRepairer
from app.agents.orchestrator import AgentOrchestrator

@pytest.fixture
def temp_workspace():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create minimal package.json
        pkg_path = os.path.join(tmpdir, "package.json")
        with open(pkg_path, "w") as f:
            f.write('{"name": "test-app", "dependencies": {"next": "15.0.0", "react": "19.0.0"}}')
        yield tmpdir

@pytest.mark.asyncio
async def test_agent_plan_generation(temp_workspace):
    """Verifies that AgentPlanner generates both conservative and architectural plans."""
    repo_service = RepoService(temp_workspace)
    planner = AgentPlanner(repo_service)

    plan_res = await planner.generate_plan("Refactor authentication flow to support JWT")
    assert plan_res["status"] == "PLAN_READY"
    assert "conservative" in plan_res["options"]
    assert "architectural" in plan_res["options"]
    assert len(plan_res["options"]["conservative"]["tasks"]) > 0

@pytest.mark.asyncio
async def test_bounded_repair_escalation(temp_workspace):
    """Verifies that repairer refuses to loop infinitely and honestly escalates after max retries."""
    exec_service = ExecutionService(temp_workspace)
    repairer = AgentRepairer(exec_service, max_retries=3)

    # Simulate already reaching max retries
    repair_res = await repairer.attempt_repair(
        failure_log="SyntaxError: Unexpected token <",
        affected_files=["src/app/page.tsx"],
        retry_count=3,
        objective="Fix syntax"
    )

    assert repair_res["status"] == "ESCALATED_UNRESOLVED"
    assert repair_res["action"] == "AWAITING_HUMAN_INTERVENTION"
    assert "3" in repair_res["message"]
