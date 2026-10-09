"""
GitHub Service for CodeForge.
Integrates with GitHub REST API using user or server personal access tokens / OAuth tokens.
Provides verified operations: repo listing, branch creation, pull request generation,
and honest status reporting when tokens or permissions are missing.
"""
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings

class GitHubService:
    """Manages verified GitHub repository interactions."""

    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN
        self.base_url = "https://api.github.com"

    def _headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CodeForge-Engine/1.0"
        }
        if self.token:
            headers["Authorization"] = f"token {self.token}"
        return headers

    async def verify_auth(self) -> Dict[str, Any]:
        """Checks if current token is valid and returns user profile."""
        if not self.token:
            return {"configured": False, "status": "NO_TOKEN", "message": "GitHub token not provided."}

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(f"{self.base_url}/user", headers=self._headers())
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "configured": True,
                        "status": "AUTHENTICATED",
                        "username": data.get("login"),
                        "avatar_url": data.get("avatar_url")
                    }
                return {
                    "configured": False,
                    "status": "UNAUTHORIZED",
                    "error": f"GitHub returned HTTP {res.status_code}: {res.text}"
                }
            except Exception as e:
                return {"configured": False, "status": "ERROR", "error": str(e)}

    async def list_repositories(self, per_page: int = 30) -> List[Dict[str, Any]]:
        """Lists repositories accessible to the authenticated user."""
        if not self.token:
            return []

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(
                    f"{self.base_url}/user/repos?per_page={per_page}&sort=updated",
                    headers=self._headers()
                )
                if res.status_code == 200:
                    repos = res.json()
                    return [
                        {
                            "id": r.get("id"),
                            "name": r.get("name"),
                            "full_name": r.get("full_name"),
                            "private": r.get("private"),
                            "default_branch": r.get("default_branch", "main"),
                            "html_url": r.get("html_url"),
                            "description": r.get("description")
                        }
                        for r in repos
                    ]
                return []
            except Exception:
                return []

    async def create_branch(self, repo: str, new_branch: str, from_branch: str = "main") -> Dict[str, Any]:
        """Creates a new branch on GitHub repository using the ref SHA of from_branch."""
        if not self.token:
            return {
                "success": False,
                "error": "GitHub token missing. Cannot create remote branch."
            }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                # 1. Get SHA of base branch
                ref_res = await client.get(
                    f"{self.base_url}/repos/{repo}/git/ref/heads/{from_branch}",
                    headers=self._headers()
                )
                if ref_res.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Base branch '{from_branch}' not found: {ref_res.text}"
                    }

                base_sha = ref_res.json().get("object", {}).get("sha")

                # 2. Create new reference
                create_res = await client.post(
                    f"{self.base_url}/repos/{repo}/git/refs",
                    headers=self._headers(),
                    json={
                        "ref": f"refs/heads/{new_branch}",
                        "sha": base_sha
                    }
                )

                if create_res.status_code == 201:
                    return {
                        "success": True,
                        "branch": new_branch,
                        "sha": base_sha,
                        "repo": repo
                    }
                return {
                    "success": False,
                    "error": f"Failed to create branch: {create_res.text}"
                }
            except Exception as e:
                return {"success": False, "error": str(e)}

    async def create_pull_request(
        self,
        repo: str,
        title: str,
        body: str,
        head_branch: str,
        base_branch: str = "main"
    ) -> Dict[str, Any]:
        """Opens a Pull Request with title, description, and test verification summary."""
        if not self.token:
            return {
                "success": False,
                "status": "NOT_CONFIGURED",
                "message": "GitHub token not configured. PR creation simulated or unavailable."
            }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                res = await client.post(
                    f"{self.base_url}/repos/{repo}/pulls",
                    headers=self._headers(),
                    json={
                        "title": title,
                        "body": body,
                        "head": head_branch,
                        "base": base_branch
                    }
                )

                if res.status_code == 201:
                    data = res.json()
                    return {
                        "success": True,
                        "status": "OPEN",
                        "pr_number": data.get("number"),
                        "html_url": data.get("html_url"),
                        "title": data.get("title")
                    }
                return {
                    "success": False,
                    "status": "REJECTED",
                    "error": f"GitHub PR creation failed (HTTP {res.status_code}): {res.text}"
                }
            except Exception as e:
                return {"success": False, "status": "ERROR", "error": str(e)}
