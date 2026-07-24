"""
Test configuration and fixtures for the authentication module.

Uses FastAPI TestClient with dependency overrides to test the HTTP layer
without requiring a live database. AuthService methods are mocked via
unittest.mock to isolate each test scenario.
"""

from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID, uuid4
from datetime import datetime, timezone

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.main import app as _app
from app.api.dependencies import get_db_session

# ─── Test Helpers ─────────────────────────────────────────────────────

TEST_USER_PASSWORD = "TestPass123"
TEST_USER_EMAIL = "jane@example.com"


def make_test_user(overrides: dict | None = None) -> MagicMock:
    """Create a mock User object with sensible defaults."""
    user = MagicMock()
    user.id = uuid4()
    user.email = TEST_USER_EMAIL
    user.hashed_password = "$2b$12$test_hashed_password_for_testing"
    user.first_name = "Jane"
    user.last_name = "Smith"
    user.is_active = True
    user.is_superuser = False
    user.is_verified = False
    user.role = "user"
    user.last_login_at = None
    user.failed_login_attempts = 0
    user.account_locked_until = None
    user.created_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)

    if overrides:
        for k, v in overrides.items():
            setattr(user, k, v)
    return user


# ─── App Fixtures ─────────────────────────────────────────────────────

@pytest.fixture
def app() -> FastAPI:
    """Return the FastAPI application instance."""
    return _app


@pytest.fixture
def client(app: FastAPI) -> Generator[TestClient, None, None]:
    """Return a TestClient for the FastAPI app."""
    with TestClient(app) as c:
        yield c


# ─── Mock DB Session ──────────────────────────────────────────────────

@pytest.fixture
def mock_db_session() -> MagicMock:
    """Create a mock AsyncSession for dependency injection."""
    session = MagicMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    session.close = AsyncMock()
    return session


# ─── Auth Service Mock Fixtures ───────────────────────────────────────

@pytest.fixture
def mock_register_success(mock_db_session: MagicMock) -> MagicMock:
    """Fixture that patches AuthService.register_user to return a test user."""
    patcher = patch(
        "app.domain.identity.services.service.AuthService.register_user",
        new_callable=AsyncMock,
    )
    mock = patcher.start()
    mock.return_value = make_test_user({
        "is_verified": False,
        "created_at": datetime.now(timezone.utc),
    })
    yield mock
    patcher.stop()


@pytest.fixture
def mock_register_duplicate(mock_db_session: MagicMock) -> MagicMock:
    """Fixture that patches AuthService.register_user to raise duplicate error."""
    from app.core.exceptions import BadRequestException

    patcher = patch(
        "app.domain.identity.services.service.AuthService.register_user",
        new_callable=AsyncMock,
    )
    mock = patcher.start()
    mock.side_effect = BadRequestException(
        detail="A user with this email already exists"
    )
    yield mock
    patcher.stop()


@pytest.fixture
def mock_login_success(mock_db_session: MagicMock) -> MagicMock:
    """Fixture that patches AuthService to return a logged-in user with tokens."""
    user = make_test_user({
        "last_login_at": datetime.now(timezone.utc),
    })

    patcher_auth = patch(
        "app.domain.identity.services.service.AuthService.authenticate_user",
        new_callable=AsyncMock,
    )
    mock_auth = patcher_auth.start()
    mock_auth.return_value = user

    patcher_tokens = patch(
        "app.domain.identity.services.service.AuthService.generate_tokens",
        new_callable=MagicMock,
    )
    mock_tokens = patcher_tokens.start()
    mock_tokens.return_value = {
        "access_token": "mock_access_token",
        "refresh_token": "mock_refresh_token",
        "token_type": "bearer",
    }

    yield mock_auth
    patcher_auth.stop()
    patcher_tokens.stop()


@pytest.fixture
def mock_login_wrong_password(mock_db_session: MagicMock) -> MagicMock:
    """Fixture that patches AuthService.authenticate_user to raise 401."""
    from app.core.exceptions import UnauthorizedException

    patcher = patch(
        "app.domain.identity.services.service.AuthService.authenticate_user",
        new_callable=AsyncMock,
    )
    mock = patcher.start()
    mock.side_effect = UnauthorizedException(
        detail="Incorrect email or password"
    )
    yield mock
    patcher.stop()


@pytest.fixture
def mock_login_locked(mock_db_session: MagicMock) -> MagicMock:
    """Fixture that patches AuthService.authenticate_user to raise lockout error."""
    from app.core.exceptions import UnauthorizedException

    patcher = patch(
        "app.domain.identity.services.service.AuthService.authenticate_user",
        new_callable=AsyncMock,
    )
    mock = patcher.start()
    mock.side_effect = UnauthorizedException(
        detail="Account is temporarily locked. Try again in 15 minute(s)."
    )
    yield mock
    patcher.stop()


@pytest.fixture
def mock_refresh_success() -> MagicMock:
    """Fixture that patches AuthService.refresh_access_token."""
    patcher = patch(
        "app.domain.identity.services.service.AuthService.refresh_access_token",
        new_callable=AsyncMock,
    )
    mock = patcher.start()
    mock.return_value = {
        "access_token": "new_mock_access_token",
        "refresh_token": "new_mock_refresh_token",
        "token_type": "bearer",
    }
    yield mock
    patcher.stop()


@pytest.fixture
def mock_refresh_expired() -> MagicMock:
    """Fixture that patches AuthService.refresh_access_token to raise expired error."""
    from app.core.exceptions import UnauthorizedException

    patcher = patch(
        "app.domain.identity.services.service.AuthService.refresh_access_token",
        new_callable=AsyncMock,
    )
    mock = patcher.start()
    mock.side_effect = UnauthorizedException(
        detail="Token has expired"
    )
    yield mock
    patcher.stop()


@pytest.fixture
def mock_logout_success() -> MagicMock:
    """Fixture that patches AuthService.logout_user (no-op succeeds)."""
    patcher = patch(
        "app.domain.identity.services.service.AuthService.logout_user",
        new_callable=AsyncMock,
    )
    mock = patcher.start()
    mock.return_value = None
    yield mock
    patcher.stop()