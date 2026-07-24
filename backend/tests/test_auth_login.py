"""
Tests for user login (POST /api/v1/auth/login).

Covers:
- Successful login returns 200 with tokens + user in standardized envelope
- Wrong password returns 401
- Locked account returns 401 with lockout message
- Missing credentials return 422
"""

from fastapi.testclient import TestClient
from app.core.config import settings

LOGIN_URL = f"{settings.API_V1_STR}/auth/login"


class TestLogin:
    def test_login_success(self, client: TestClient, mock_login_success):
        """Valid credentials return 200 with user data and token pair."""
        payload = {"email": "jane@example.com", "password": "TestPass123"}

        response = client.post(LOGIN_URL, json=payload)

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["user"]["email"] == "jane@example.com"
        assert body["data"]["tokens"]["access_token"] == "mock_access_token"
        assert body["data"]["tokens"]["refresh_token"] == "mock_refresh_token"
        assert body["data"]["tokens"]["token_type"] == "bearer"

    def test_login_wrong_password(
        self, client: TestClient, mock_login_wrong_password
    ):
        """Wrong password returns 401 with error envelope."""
        payload = {"email": "jane@example.com", "password": "WrongPass1"}

        response = client.post(LOGIN_URL, json=payload)

        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert "incorrect" in body["error"]["message"].lower()

    def test_login_locked_account(self, client: TestClient, mock_login_locked):
        """Locked account returns 401 with lockout message."""
        payload = {"email": "jane@example.com", "password": "TestPass123"}

        response = client.post(LOGIN_URL, json=payload)

        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert "locked" in body["error"]["message"].lower()
        assert "minute" in body["error"]["message"].lower()

    def test_login_missing_email(self, client: TestClient):
        """Missing email returns 422."""
        payload = {"password": "TestPass123"}

        response = client.post(LOGIN_URL, json=payload)

        assert response.status_code == 422

    def test_login_missing_password(self, client: TestClient):
        """Missing password returns 422."""
        payload = {"email": "jane@example.com"}

        response = client.post(LOGIN_URL, json=payload)

        assert response.status_code == 422

    def test_login_empty_request(self, client: TestClient):
        """Completely empty body returns 422."""
        response = client.post(LOGIN_URL, json={})

        assert response.status_code == 422