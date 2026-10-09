import os
import subprocess
import time
import asyncio
from typing import Dict, Any, List, Optional
from app.core.config import settings

class ExecutionService:
    def __init__(self, workspace_dir: Optional[str] = None):
        self.workspace_dir = os.path.abspath(workspace_dir or settings.BASE_DIR)
        os.makedirs(self.workspace_dir, exist_ok=True)

    def _resolve_relative(self, relative_path: str) -> str:
        norm_rel = os.path.normpath(relative_path).lstrip("\\/").replace("..", "")
        target = os.path.abspath(os.path.join(self.workspace_dir, norm_rel))
        if not target.startswith(self.workspace_dir):
            raise PermissionError("Path traversal access denied outside workspace sandbox.")
        return target

    def read_file(self, relative_path: str) -> Optional[str]:
        try:
            target = self._resolve_relative(relative_path)
            if not os.path.exists(target) or os.path.isdir(target):
                return None
            with open(target, "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            return None

    def write_file(self, relative_path: str, content: str) -> bool:
        try:
            target = self._resolve_relative(relative_path)
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "w", encoding="utf-8") as f:
                f.write(content)
            return True
        except Exception:
            return False

    async def run_command(self, command: str, timeout: int = 30) -> Dict[str, Any]:
        """Runs command asynchronously inside the workspace directory."""
        start_time = time.time()
        cmd_lower = command.lower()
        if any(term in cmd_lower for term in ["format ", "rmdir /s /q c:", "rm -rf /", "shutdown", "mkfs"]):
            return {
                "command": command,
                "exit_code": 1,
                "output": "Command blocked: Violates CodeForge safety policies.",
                "duration_seconds": 0.01,
            }

        safe_env = {
            "PATH": os.environ.get("PATH", ""),
            "SYSTEMROOT": os.environ.get("SYSTEMROOT", ""),
            "TEMP": os.environ.get("TEMP", ""),
            "TMP": os.environ.get("TMP", ""),
            "NODE_ENV": "development",
        }

        try:
            loop = asyncio.get_event_loop()
            proc = await loop.run_in_executor(
                None,
                lambda: subprocess.run(
                    command,
                    cwd=self.workspace_dir,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    env=safe_env
                )
            )
            duration = round(time.time() - start_time, 2)
            out = proc.stdout + (("\n" + proc.stderr) if proc.stderr else "")
            return {
                "command": command,
                "exit_code": proc.returncode,
                "output": out,
                "duration_seconds": duration,
            }
        except subprocess.TimeoutExpired:
            return {
                "command": command,
                "exit_code": 124,
                "output": f"Command timed out after {timeout} seconds.",
                "duration_seconds": float(timeout),
            }
        except Exception as e:
            return {
                "command": command,
                "exit_code": 1,
                "output": str(e),
                "duration_seconds": round(time.time() - start_time, 2),
            }

    # Classmethod variants for project_id based workflows
    @classmethod
    def get_workspace_dir(cls, project_id: str) -> str:
        safe_id = "".join([c for c in project_id if c.isalnum() or c in "_-"])
        ws_dir = os.path.abspath(os.path.join(settings.WORKSPACE_BASE_DIR, safe_id))
        os.makedirs(ws_dir, exist_ok=True)
        return ws_dir

    @classmethod
    def resolve_safe_path(cls, project_id: str, relative_path: str) -> str:
        ws_dir = cls.get_workspace_dir(project_id)
        norm_rel = os.path.normpath(relative_path).lstrip("\\/").replace("..", "")
        target = os.path.abspath(os.path.join(ws_dir, norm_rel))
        if not target.startswith(ws_dir):
            raise PermissionError("Path traversal access denied outside workspace sandbox.")
        return target

    @classmethod
    def ensure_initial_workspace(cls, project_id: str, repo_data: Dict[str, Any] = None) -> str:
        ws_dir = cls.get_workspace_dir(project_id)
        return ws_dir

    @classmethod
    def apply_diffs(cls, project_id: str, diffs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for diff in diffs:
            file_path = diff["filePath"]
            new_code = diff["newCode"]
            try:
                target = cls.resolve_safe_path(project_id, file_path)
                os.makedirs(os.path.dirname(target), exist_ok=True)
                with open(target, "w", encoding="utf-8") as f:
                    f.write(new_code)
                results.append({"filePath": file_path, "applied": True, "bytes": len(new_code.encode("utf-8"))})
            except Exception as e:
                results.append({"filePath": file_path, "applied": False, "error": str(e)})
        return results

    @classmethod
    def run_sandbox_command(
        cls,
        project_id: str,
        command: str,
        timeout: int = 30
    ) -> Dict[str, Any]:
        ws_dir = cls.get_workspace_dir(project_id)
        exec_inst = cls(ws_dir)
        # Run synchronously for backward compatibility
        start_time = time.time()
        try:
            safe_env = {
                "PATH": os.environ.get("PATH", ""),
                "SYSTEMROOT": os.environ.get("SYSTEMROOT", ""),
                "TEMP": os.environ.get("TEMP", ""),
                "TMP": os.environ.get("TMP", ""),
                "NODE_ENV": "development",
            }
            proc = subprocess.run(
                command,
                cwd=ws_dir,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                env=safe_env
            )
            duration_ms = int((time.time() - start_time) * 1000)
            return {
                "command": command,
                "exitCode": proc.returncode,
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "durationMs": duration_ms,
                "timedOut": False,
            }
        except subprocess.TimeoutExpired:
            return {
                "command": command,
                "exitCode": 124,
                "stdout": "",
                "stderr": f"Command timed out after {timeout} seconds.",
                "durationMs": timeout * 1000,
                "timedOut": True,
            }
        except Exception as e:
            return {
                "command": command,
                "exitCode": 1,
                "stdout": "",
                "stderr": str(e),
                "durationMs": int((time.time() - start_time) * 1000),
                "timedOut": False,
            }
