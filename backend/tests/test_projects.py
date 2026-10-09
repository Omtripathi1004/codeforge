"""
Tests for Project Management and Multi-Tenant User Isolation.
"""
import pytest

def test_create_and_get_project(client, auth_headers):
    """Verifies that authenticated users can create and retrieve projects."""
    create_res = client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={
            "name": "E-Commerce Microservice",
            "description": "High performance checkout API",
            "framework": "FastAPI",
            "github_repo": "codeforge/checkout-service",
            "branch": "main"
        }
    )
    assert create_res.status_code == 201
    project = create_res.json()
    assert project["name"] == "E-Commerce Microservice"
    project_id = project["id"]

    # Retrieve project
    get_res = client.get(f"/api/v1/projects/{project_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == project_id

def test_user_project_isolation(client, auth_headers):
    """Verifies that User B cannot access User A's private projects."""
    # User A creates a project
    create_res = client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={"name": "Confidential Algorithm", "description": "Top secret"}
    )
    project_id = create_res.json()["id"]

    # Register User B
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "user_b@codeforge.ai",
        "password": "Password123!",
        "name": "User B"
    })
    token_b = reg_res.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B attempts to access User A's project
    unauth_res = client.get(f"/api/v1/projects/{project_id}", headers=headers_b)
    assert unauth_res.status_code == 404
    assert "not found or unauthorized" in unauth_res.json()["detail"].lower()
