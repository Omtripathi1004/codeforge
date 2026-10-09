"""
Tests for Health Check and Creative Studio Endpoints.
"""
import pytest

def test_health_check(client):
    res = client.get("/api/v1/health/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "database" in data
    assert "ai_provider" in data

def test_creative_studio_artifact_lifecycle(client, auth_headers):
    # 1. Create a creative shader artifact
    create_res = client.post(
        "/api/v1/studio/artifacts",
        headers=auth_headers,
        json={
            "title": "Quantum Torus Shader",
            "category": "shader",
            "prompt": "Raymarched iridescent torus with fresnel glow",
            "code": "// fragment shader\nvoid main() { gl_FragColor = vec4(0.2, 0.8, 1.0, 1.0); }"
        }
    )
    assert create_res.status_code == 201
    artifact = create_res.json()
    assert artifact["title"] == "Quantum Torus Shader"
    assert artifact["category"] == "shader"

    # 2. List artifacts
    list_res = client.get("/api/v1/studio/artifacts", headers=auth_headers)
    assert list_res.status_code == 200
    artifacts = list_res.json()
    assert len(artifacts) >= 1
    assert any(a["title"] == "Quantum Torus Shader" for a in artifacts)
