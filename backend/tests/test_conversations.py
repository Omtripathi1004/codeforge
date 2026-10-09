"""
Tests for Conversations, Message History, and Project Context.
"""
import pytest

def test_create_conversation_and_post_message(client, auth_headers):
    # 1. Create conversation
    conv_res = client.post(
        "/api/v1/conversations/?title=Refactoring Checkout",
        headers=auth_headers
    )
    assert conv_res.status_code == 201
    conv = conv_res.json()
    conv_id = conv["id"]
    assert conv["title"] == "Refactoring Checkout"

    # 2. Post a user message and get assistant response
    msg_res = client.post(
        f"/api/v1/conversations/{conv_id}/messages",
        headers=auth_headers,
        json={"content": "Please explain the architecture of this project."}
    )
    assert msg_res.status_code == 200
    msg = msg_res.json()
    assert msg["role"] == "assistant"
    assert len(msg["content"]) > 10

    # 3. Retrieve conversation message history
    history_res = client.get(
        f"/api/v1/conversations/{conv_id}/messages",
        headers=auth_headers
    )
    assert history_res.status_code == 200
    messages = history_res.json()
    # Expect 2 messages: user query + assistant answer
    assert len(messages) >= 2
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"
