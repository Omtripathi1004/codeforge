"""
Agent Coder for CodeForge.
Executes code modifications in response to planned tasks using
AI-driven code generation, AST patch creation, and safe filesystem operations.
"""
from typing import Dict, Any, List, Optional
import os
from app.services.ai_service import ai_service
from app.services.execution_service import ExecutionService

class AgentCoder:
    """Handles generating and applying code modifications."""

    def __init__(self, execution_service: ExecutionService):
        self.exec_service = execution_service

    async def execute_task(self, task: Dict[str, Any], project_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes a single planned task.
        Reads the target file if it exists, requests AI code generation,
        and safely writes the modification through ExecutionService.
        """
        task_id = task.get("id")
        desc = task.get("description", "")
        rel_path = task.get("file", "")

        if not rel_path:
            return {
                "task_id": task_id,
                "status": "SKIPPED",
                "message": "No target file specified for this task"
            }

        # 1. Read existing file content if available
        existing_content = self.exec_service.read_file(rel_path)
        file_existed = existing_content is not None

        # 2. Build prompt for AI code synthesis
        prompt = f"""
You are the CodeForge Autonomous Coding Agent.
Task: {desc}
Target File: {rel_path}
File Status: {'Existing' if file_existed else 'New File'}

Existing Code:
```
{(existing_content or '')[:3000]}
```

Provide the complete updated code for '{rel_path}' that fulfills this task.
Respond ONLY with the complete code content, wrapped in markdown code blocks like:
```typescript
// your code here
```
"""
        messages = [
            {"role": "system", "content": "You are an expert autonomous software engineer. Return clean, production-grade code."},
            {"role": "user", "content": prompt}
        ]

        ai_response = await ai_service.chat_completion(messages, temperature=0.2)
        raw_text = ai_response.get("content", "")

        # Extract code from response
        code_content = self._extract_code_block(raw_text)
        if not code_content and file_existed:
            code_content = existing_content  # fallback to preserve file if extraction fails

        # 3. Write file via ExecutionService
        write_success = self.exec_service.write_file(rel_path, code_content)
        if not write_success:
            return {
                "task_id": task_id,
                "file": rel_path,
                "status": "FAILED",
                "error": "Failed to write file due to sandbox permissions or path violation"
            }

        return {
            "task_id": task_id,
            "file": rel_path,
            "status": "APPLIED",
            "operation": "MODIFIED" if file_existed else "CREATED",
            "bytes_written": len(code_content.encode("utf-8")),
            "description": desc
        }

    def _extract_code_block(self, text: str) -> str:
        """Extracts code block from markdown formatting."""
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
