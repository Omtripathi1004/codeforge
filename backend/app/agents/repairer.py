"""
Agent Repairer for CodeForge.
Implements bounded self-repair loops for build, test, and type-check failures.
Analyzes logs and stack traces, generates targeted fixes, and enforces a strict
maximum retry limit (default: 3) to prevent infinite loops.
"""
from typing import Dict, Any, List, Optional
from app.services.ai_service import ai_service
from app.services.execution_service import ExecutionService

class AgentRepairer:
    """Diagnoses and repairs code errors in a bounded loop."""

    def __init__(self, execution_service: ExecutionService, max_retries: int = 3):
        self.exec_service = execution_service
        self.max_retries = max_retries

    async def attempt_repair(
        self,
        failure_log: str,
        affected_files: List[str],
        retry_count: int,
        objective: str
    ) -> Dict[str, Any]:
        """
        Analyzes the failure log, determines the root cause, and applies a patch
        if under the retry limit.
        """
        if retry_count >= self.max_retries:
            return {
                "status": "ESCALATED_UNRESOLVED",
                "retry_count": retry_count,
                "message": f"Maximum repair attempts ({self.max_retries}) reached without full resolution.",
                "action": "AWAITING_HUMAN_INTERVENTION",
                "failure_summary": failure_log[:500]
            }

        # Pick primary affected file to inspect
        target_file = affected_files[0] if affected_files else "src/index.ts"
        current_content = self.exec_service.read_file(target_file) or ""

        # Formulate repair prompt for Nebius Nemotron
        prompt = f"""
You are the CodeForge Self-Repair Agent.
Objective: {objective}
Failure Log / Error Trace:
```
{failure_log[:2000]}
```

File under repair: {target_file}
Current Code:
```
{current_content[:3000]}
```

Analyze the failure. Return the corrected code for {target_file} wrapped in markdown:
```
// corrected code
```
"""
        messages = [
            {"role": "system", "content": "You are a meticulous debugging engineer. Fix the syntax, type, or test error."},
            {"role": "user", "content": prompt}
        ]

        ai_response = await ai_service.chat_completion(messages, temperature=0.1)
        raw_code = ai_response.get("content", "")
        repaired_code = self._extract_code(raw_code)

        if repaired_code:
            write_ok = self.exec_service.write_file(target_file, repaired_code)
            if write_ok:
                return {
                    "status": "REPAIR_APPLIED",
                    "retry_count": retry_count + 1,
                    "target_file": target_file,
                    "diagnosis": f"Corrected error identified in {target_file}",
                    "bytes_modified": len(repaired_code.encode("utf-8"))
                }

        return {
            "status": "REPAIR_FAILED",
            "retry_count": retry_count + 1,
            "error": "Could not synthesize a valid patch for the reported error."
        }

    def _extract_code(self, text: str) -> str:
        if "```" not in text:
            return text.strip()
        lines = text.splitlines()
        code_lines = []
        inside = False
        for line in lines:
            if line.startswith("```"):
                if inside:
                    break
                else:
                    inside = True
                    continue
            if inside:
                code_lines.append(line)
        return "\n".join(code_lines) if code_lines else text.strip()
