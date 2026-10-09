"""
Unit and integration tests for CodeForge Authentication & User Isolation.
"""
import pytest

def test_user_registration(client):
    """Verifies that new users can register and receive valid JWT."""
    response = client.post("/api/v1/auth/register", json={
        "email": "coder@example.com",
        "password": "Password987!",
        "name": "Jane Coder"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "coder@example.com"
    assert data["user"]["name"] == "Jane Coder"

def test_duplicate_registration_fails(client):
    """Verifies duplicate registration attempt is rejected."""
    client.post("/api/v1/auth/register", json={
        "email": "duplicate@example.com",
        "password": "Password987!",
        "name": "Jane Coder"
    })
    response = client.post("/api/v1/auth/register", json={
        "email": "duplicate@example.com",
        "password": "Password987!",
        "name": "Jane Coder"
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_user_login(client):
    """Verifies user login with correct credentials."""
    client.post("/api/v1/auth/register", json={
        "email": "login_test@example.com",
        "password": "ValidPassword123!",
        "name": "Login User"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "login_test@example.com",
        "password": "ValidPassword123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login_test@example.com"

def test_login_invalid_password(client):
    """Verifies login rejection on wrong password."""
    client.post("/api/v1/auth/register", json={
        "email": "wrong_pw@example.com",
        "password": "ValidPassword123!",
        "name": "Test User"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "wrong_pw@example.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_get_current_user_profile(client, auth_headers):
    """Verifies /me endpoint returns authenticated user profile."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@codeforge.ai"
    assert data["name"] == "Test Engineer"
