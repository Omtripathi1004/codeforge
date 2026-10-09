"""
Agent Verifier for CodeForge.
Computes cryptographic SHA-256 evidence hashes for all modified files,
inspects code for credential leaks, verifies changes with test commands,
and provides transparent audit receipts.
"""
from typing import Dict, Any, List, Optional
import hashlib
import re
from app.services.execution_service import ExecutionService

class AgentVerifier:
    """Verifies changes, checks security policies, and produces audit receipts."""

    def __init__(self, execution_service: ExecutionService):
        self.exec_service = execution_service

    def audit_security(self, files: List[str]) -> Dict[str, Any]:
        """
        Audits modified files for suspicious patterns, such as hardcoded API keys,
        tokens, or unsafe eval operations.
        """
        violations = []
        secret_patterns = [
            (r"(?i)api[_-]?key\s*=\s*['\"][a-zA-Z0-9_\-]{20,}['\"]", "Possible hardcoded API key"),
            (r"(?i)bearer\s+[a-zA-Z0-9_\-\.]{20,}", "Hardcoded Bearer token"),
            (r"(?i)github_pat_[a-zA-Z0-9_]{20,}", "Hardcoded GitHub Personal Access Token"),
            (r"eval\(", "Unsafe eval usage")
        ]

        for f in files:
            content = self.exec_service.read_file(f)
            if not content:
                continue

            for pattern, reason in secret_patterns:
                if re.search(pattern, content):
                    violations.append({
                        "file": f,
                        "reason": reason,
                        "severity": "HIGH"
                    })

        return {
            "passed": len(violations) == 0,
            "violations": violations
        }

    def generate_evidence_hashes(self, files: List[str]) -> Dict[str, str]:
        """
        Calculates cryptographic SHA-256 hashes for all modified files
        to provide tamper-proof evidence for verification.
        """
        hashes = {}
        for f in files:
            content = self.exec_service.read_file(f)
            if content is not None:
                h = hashlib.sha256(content.encode("utf-8")).hexdigest()
                hashes[f] = h
            else:
                hashes[f] = "DELETED_OR_UNAVAILABLE"
        return hashes

    async def run_verification_suite(
        self,
        validation_commands: List[str],
        affected_files: List[str]
    ) -> Dict[str, Any]:
        """
        Runs the specified validation commands in the sandbox workspace,
        calculates SHA-256 evidence hashes, and performs security audits.
        """
        test_results = []
        all_passed = True

        for cmd in validation_commands:
            result = await self.exec_service.run_command(cmd)
            test_results.append({
                "command": cmd,
                "exit_code": result.get("exit_code"),
                "output": result.get("output", "")[:1000],
                "duration_seconds": result.get("duration_seconds", 0)
            })
            if result.get("exit_code") != 0:
                all_passed = False

        security_audit = self.audit_security(affected_files)
        evidence_hashes = self.generate_evidence_hashes(affected_files)

        return {
            "verified": all_passed and security_audit.get("passed", True),
            "all_tests_passed": all_passed,
            "security_audit": security_audit,
            "evidence_hashes": evidence_hashes,
            "test_results": test_results
        }
