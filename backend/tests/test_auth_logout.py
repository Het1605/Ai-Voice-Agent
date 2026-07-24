"""
Tests for user logout (POST /api/v1/auth/logout).

Covers:
- Authenticated logout returns 200
- Missing token returns 401 (OAuth2PasswordBearer auto_error)
"""

from fastapi.testclient import TestClient
from app.core.config import settings

LOGOUT_URL = f"{settings.API_V1_STR}/auth/logout"


class TestLogout:
    def test_logout_with_token(self, client: TestClient, mock_logout_success):
        """Valid Bearer token returns 200 with success message."""
        response = client.post(
            LOGOUT_URL,
            headers={"Authorization": "Bearer mock_valid_token"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert "logged out" in body["data"]["message"].lower()

    def test_logout_no_token(self, client: TestClient):
        """Missing Authorization header returns 401."""
        response = client.post(LOGOUT_URL)

        assert response.status_code == 401