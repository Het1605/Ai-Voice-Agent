# 02 — Backend Architecture

## Layer Overview

```
┌──────────────────────────────────────────────────────────┐
│                    API Layer (app/api/)                   │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐ │
│  │  v1/     │ │ WebSocket│ │dependencies│ │  routers  │ │
│  │  routers │ │  routers │ │   (DI)     │ │           │ │
│  └──────────┘ └──────────┘ └────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────┤
│                    Domain Layer (app/domain/)             │
│  Business logic, domain models, service interfaces        │
├──────────────────────────────────────────────────────────┤
│                    Infrastructure (app/infrastructure/)    │
│  DB session, Redis cache, external provider adapters      │
├──────────────────────────────────────────────────────────┤
│                    Runtime (app/runtime/)                  │
│  Voice pipeline engine, abstract ports, core context      │
├──────────────────────────────────────────────────────────┤
│                    Core (app/core/)                        │
│  Config, security, exceptions, response models            │
└──────────────────────────────────────────────────────────┘
```

## Core Layer (`app/core/`)

### Configuration (`config.py`)

Centralized settings using `pydantic-settings`. Loaded from environment variables / `.env`.

```python
class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Phone Agent Platform"
    API_V1_STR: str = "/api/v1"
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_DB: str = "ai_phone_agent"
    # ... computed DATABASE_URL property
    
    # Redis
    REDIS_HOST: str = "localhost"
    
    # AI models
    STT_MODEL_SIZE: str = "base"
    LLM_MODEL_NAME: str = "qwen2.5:3b"
    TTS_DEFAULT_VOICE: str = "af_heart"
```

**Critical rule:** `settings` is instantiated once as a module-level singleton. All layers import it from `core.config`. Never create a second instance.

### Security (`security.py`, `jwt.py`)

- **Password hashing:** bcrypt via `passlib`
- **JWT tokens:** Access tokens (30 min) + Refresh tokens (7 days)
- **Token verification:** `verify_token()` validates type (access vs refresh), expiry, and signature. Raises `UnauthorizedException` on failure.

### Exceptions (`exceptions.py`)

Custom exception hierarchy rooted in `BaseAppException`:

| Exception | HTTP Status | Use Case |
|---|---|---|
| `NotFoundException` | 404 | Resource not found |
| `BadRequestException` | 400 | Invalid parameters |
| `ConflictException` | 409 | Duplicate resource |
| `UnauthorizedException` | 401 | Missing/invalid credentials |
| `ForbiddenException` | 403 | Insufficient permissions |
| `InternalServerException` | 500 | Unexpected failure |

All exceptions carry `error_code`, `detail`, and optional `context` dict.

### Response Models (`response.py`)

Every API response follows a standard envelope:

```json
// Success
{ "success": true, "data": { ... }, "meta": { ... } }

// Paginated
{ "success": true, "data": [ ... ], "meta": { "page": 1, "page_size": 20, "total": 100, "count": 20 } }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Resource not found", "details": null } }
```

Helper functions: `success_response()`, `paginated_response()`, `error_response()`.

## API Layer (`app/api/`)

### Entry Point (`main.py`)

- Boots FastAPI with lifespan handlers for DB + Redis connection verification
- Registers CORS middleware (origins from config)
- Includes API v1 router and WebSocket router
- Registers three exception handlers: `BaseAppException` → structured error, `HTTPException` → structured error, `Exception` → 500 catch-all
- Exposes `/health` endpoint

### Dependencies (`dependencies.py`)

FastAPI dependency injection providers:

```python
async def get_db_session() -> AsyncGenerator[AsyncSession, None]
async def get_redis_client() -> AsyncGenerator[Redis, None]
def get_app_settings() -> Settings
```

These are used by route handlers to access infrastructure without coupling to concrete implementations.

### Router Structure

```
api/v1/
├── router.py         ← Aggregates all sub-routers
├── auth.py           ← /auth/login, /auth/register, /auth/refresh, /auth/logout
├── users.py          ← /users/me
├── organizations.py  ← /organizations CRUD
└── agents.py         ← /organizations/{id}/agents CRUD

api/websockets/
└── router.py         ← WebSocket endpoints for real-time communication
```

## Domain Layer (`app/domain/`)

The domain layer contains pure business logic. It is currently scaffolded and will be populated during Phase 1.

**Rules:**
- Domain models define entities, value objects, and aggregates
- Domain services implement business operations that don't fit on a single entity
- Domain imports ONLY from Core — never from Infrastructure, API, or Runtime
- Domain repositories are interfaces (implemented in Infrastructure)

## Infrastructure Layer (`app/infrastructure/`)

### Database

- **Engine:** SQLAlchemy 2.0 async with asyncpg driver
- **Session:** `get_db()` yields `AsyncSession` per request
- **Models:** SQLAlchemy declarative models (mirror domain entities)
- **Repositories:** Implement domain repository interfaces

### Redis

- Async Redis client for caching and pub/sub
- Used for session caching and real-time event passing

### Migration Strategy

- **Tool:** Alembic (async-compatible)
- **Process:**
  1. Developer creates/modifies SQLAlchemy model
  2. Run `alembic revision --autogenerate -m "description"`
  3. Review generated migration
  4. Apply: `alembic upgrade head`
- **Naming convention:** Snake_case with descriptive messages

## Runtime Layer (`app/runtime/`)

See [04-runtime.md](04-runtime.md) for full documentation.

## Dependency Rules

### Allowed imports

| Layer | Can Import From |
|---|---|
| **API** | Core, Domain, Infrastructure (DI only), Runtime (WebSocket only) |
| **Domain** | Core |
| **Infrastructure** | Core |
| **Runtime** | Core (ports only) |
| **Core** | Nothing application-internal |

### Prohibited dependencies

- ❌ API must NOT import from Infrastructure directly (use DI)
- ❌ Domain must NOT import from API, Infrastructure, or Runtime
- ❌ Infrastructure must NOT import from Domain or API
- ❌ Runtime must NOT import from Domain
- ❌ No circular imports between any layers
- ❌ No business logic in API routers (route handlers call domain services)
- ❌ No raw SQL outside Infrastructure/repositories

## Configuration Loading

1. Defaults defined in `Settings` class
2. Overridden by `.env` file
3. Overridden by environment variables
4. Validated by Pydantic at import time

## Error Handling Flow

```
Request → Router → Domain Service (may raise BaseAppException)
              ↓
         Exception Handler (main.py)
              ↓
         JSONResponse with error_response()
```

Unhandled exceptions → catch-all handler → sanitized 500 response (traceback logged, never exposed).

## Authentication Flow

```
Login Request → POST /auth/login
    ↓
Validate credentials → verify_password(plain, hash)
    ↓
Create JWT: create_access_token(user.id) + create_refresh_token(user.id)
    ↓
Return { user, tokens }

Subsequent Requests → Authorization: Bearer <token>
    ↓
API → verify_token(token) → extract user_id
    ↓
Inject current user into route handler via dependency
```
