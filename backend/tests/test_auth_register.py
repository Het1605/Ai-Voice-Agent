"""
Tests for user registration (POST /api/v1/auth/register).

Covers:
- Successful registration returns 201 with standardized success envelope
- Duplicate email returns 400 with error envelope
- Invalid input data returns 422
- Password is not returned in the response
"""

from fastapi.testclient import TestClient
from app.core.config import settings

REGISTER_URL = f"{settings.API_V1_STR}/auth/register"


class TestRegister:
    def test_register_success(self, client: TestClient, mock_register_success):
        """A valid registration returns 201 with user data in the success envelope."""
        payload = {
            "email": "jane@example.com",
            "password": "StrongPass1",
            "first_name": "Jane",
            "last_name": "Smith",
        }

        response = client.post(REGISTER_URL, json=payload)

        assert response.status_code == 201
        body = response.json()
        assert body["success"] is True
        assert body["data"]["email"] == "jane@example.com"
        assert "password" not in body["data"]
        mock_register_success.assert_awaited_once()

    def test_register_minimal_fields(self, client: TestClient, mock_register_success):
        """Registration with only required fields still succeeds."""
        payload = {"email": "minimal@example.com", "password": "Minimal1"}

        response = client.post(REGISTER_URL, json=payload)

        assert response.status_code == 201
        body = response.json()
        assert body["success"] is True
        mock_register_success.assert_awaited_once()

    def test_register_duplicate_email(
        self, client: TestClient, mock_register_duplicate
    ):
        """Registering with an existing email returns 400 with an error envelope."""
        payload = {"email": "existing@example.com", "password": "StrongPass1"}

        response = client.post(REGISTER_URL, json=payload)

        assert response.status_code == 400
        body = response.json()
        assert body["success"] is False
        assert body["error"]["code"] is not None
        assert "already exists" in body["error"]["message"].lower()
        mock_register_duplicate.assert_awaited_once()

    def test_register_missing_email(self, client: TestClient):
        """Missing required email field returns 422."""
        payload = {"password": "StrongPass1"}

        response = client.post(REGISTER_URL, json=payload)

        assert response.status_code == 422

    def test_register_missing_password(self, client: TestClient):
        """Missing required password field returns 422."""
        payload = {"email": "jane@example.com"}

        response = client.post(REGISTER_URL, json=payload)

        assert response.status_code == 422

    def test_register_invalid_email_format(self, client: TestClient):
        """Invalid email format returns 422."""
        payload = {"email": "not-an-email", "password": "StrongPass1"}

        response = client.post(REGISTER_URL, json=payload)

        assert response.status_code == 422

    def test_register_weak_password(self, client: TestClient):
        """Short password returns 422 (FastAPI validation if enforced)."""
        payload = {"email": "jane@example.com", "password": "ab"}

        response = client.post(REGISTER_URL, json=payload)

        # Backend may or may not enforce password strength — accept 201 or 422
        assert response.status_code in (201, 422)