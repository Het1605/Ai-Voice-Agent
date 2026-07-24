"""
Tests for token refresh (POST /api/v1/auth/refresh).

Covers:
- Valid refresh token returns 200 with new token pair
- Expired refresh token returns 401
- Missing refresh token returns 422
"""

from fastapi.testclient import TestClient
from app.core.config import settings

REFRESH_URL = f"{settings.API_V1_STR}/auth/refresh"


class TestRefresh:
    def test_refresh_success(self, client: TestClient, mock_refresh_success):
        """Valid refresh token returns new token pair in standardized envelope."""
        payload = {"refresh_token": "valid_refresh_token"}

        response = client.post(REFRESH_URL, json=payload)

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["access_token"] == "new_mock_access_token"
        assert body["data"]["refresh_token"] == "new_mock_refresh_token"
        assert body["data"]["token_type"] == "bearer"

    def test_refresh_expired_token(
        self, client: TestClient, mock_refresh_expired
    ):
        """Expired refresh token returns 401 with error envelope."""
        payload = {"refresh_token": "expired_refresh_token"}

        response = client.post(REFRESH_URL, json=payload)

        assert response.status_code == 401
        body = response.json()
        assert body["success"] is False
        assert "expired" in body["error"]["message"].lower() or "invalid" in body["error"]["message"].lower()

    def test_refresh_missing_token(self, client: TestClient):
        """Missing refresh_token field returns 422."""
        payload = {}

        response = client.post(REFRESH_URL, json=payload)

        assert response.status_code == 422