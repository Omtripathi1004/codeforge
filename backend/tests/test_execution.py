"""
Tests for Sandboxed Execution, Path Containment, and Security Auditing.
"""
import pytest
import os
import tempfile
from app.services.execution_service import ExecutionService
from app.agents.verifier import AgentVerifier

@pytest.fixture
def temp_workspace():
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir

def test_safe_file_write_and_read(temp_workspace):
    """Verifies reading and writing within sandboxed boundaries."""
    exec_service = ExecutionService(temp_workspace)
    
    write_ok = exec_service.write_file("src/utils/math.ts", "export const add = (a: number, b: number) => a + b;")
    assert write_ok is True

    content = exec_service.read_file("src/utils/math.ts")
    assert content == "export const add = (a: number, b: number) => a + b;"

def test_path_traversal_blocked(temp_workspace):
    """Verifies that malicious directory traversal escapes are strictly blocked."""
    exec_service = ExecutionService(temp_workspace)

    # Attempt to write outside sandbox root
    write_ok = exec_service.write_file("../../etc/passwd", "malicious_content")
    assert write_ok is False

    read_content = exec_service.read_file("../../windows/system32/cmd.exe")
    assert read_content is None

def test_security_audit_detects_credentials(temp_workspace):
    """Verifies that hardcoded secrets and tokens are flagged by the AgentVerifier."""
    exec_service = ExecutionService(temp_workspace)
    verifier = AgentVerifier(exec_service)

    # Write file containing leaked secret
    exec_service.write_file("config.py", "GITHUB_PAT_SECRET = 'github_pat_11AAAAAA22BBBBBB33CCCCCC'")
    
    audit = verifier.audit_security(["config.py"])
    assert audit["passed"] is False
    assert len(audit["violations"]) >= 1
    assert "github" in audit["violations"][0]["reason"].lower()

def test_evidence_hash_generation(temp_workspace):
    """Verifies tamper-proof SHA-256 evidence hashing."""
    exec_service = ExecutionService(temp_workspace)
    verifier = AgentVerifier(exec_service)

    exec_service.write_file("evidence.txt", "Verified CodeForge Build")
    hashes = verifier.generate_evidence_hashes(["evidence.txt"])
    
    assert "evidence.txt" in hashes
    assert len(hashes["evidence.txt"]) == 64  # SHA-256 hex string length
