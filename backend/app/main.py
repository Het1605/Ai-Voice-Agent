"""
Purpose: Main application entry point for the backend platform.
Responsibilities:
  - Boots the FastAPI application.
  - Sets up global middlewares (e.g. CORS).
  - Triggers the initialization of the logging system.
Architecture Fit:
  - Read by uvicorn to start the ASGI backend server.
  - Acts as the root hub for all routers, endpoints, and startup hooks.
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging_service import setup_logging
from app.core.exceptions import BaseAppException
from app.core.response import error_response

# Initialize logging system immediately on launch
setup_logging()

logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify Database & Redis connections at startup
    logger.info("Initializing database and Redis connection handshakes...")
    
    try:
        from sqlalchemy import text
        from app.infrastructure.database.session import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection handshake successful.")
    except Exception as e:
        logger.error(f"Database connection handshake failed: {e}")
        
    try:
        from app.infrastructure.cache.redis import ping_redis
        if await ping_redis():
            logger.info("Redis connection handshake successful.")
        else:
            logger.error("Redis connection handshake failed.")
    except Exception as e:
        logger.error(f"Redis connection handshake failed with exception: {e}")
        
    yield
    
    # Clean up connection resources on application shutdown
    logger.info("Cleaning up database and Redis connection pools...")
    
    try:
        from app.infrastructure.database.session import engine
        await engine.dispose()
        logger.info("Database connection engine pools disposed.")
    except Exception as e:
        logger.error(f"Failed to dispose database connection engine: {e}")
        
    try:
        from app.infrastructure.cache.redis import redis_client
        await redis_client.close()
        logger.info("Redis client connections closed.")
    except Exception as e:
        logger.error(f"Failed to close Redis connection client: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Apply CORS middleware using centralized configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.router import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

from app.api.websockets.router import router as websocket_router
app.include_router(websocket_router)

@app.exception_handler(BaseAppException)
async def application_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    """
    Translates custom BaseAppExceptions into the standardized error envelope.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(
            code=exc.error_code,
            message=exc.detail,
            details=exc.context or None,
        ).model_dump()
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Translates FastAPI/Starlette HTTPExceptions into the standardized error envelope.
    Catches 401 from OAuth2PasswordBearer, 404s, 405s, etc.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_ERROR",
                "message": exc.detail,
                "details": None,
            },
        },
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all for any unhandled Python exception.
    Logs the full traceback and returns a sanitized 500 in the standard error format.
    """
    logger.exception("Unhandled exception at %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response(
            code="INTERNAL_ERROR",
            message="An unexpected server error occurred.",
        ).model_dump()
    )

@app.get("/health")
async def health_check() -> JSONResponse:
    """
    Structured dynamic health check endpoint.
    Tests Postgres and Redis connections and returns a detailed status dictionary.
    """
    db_healthy = False
    redis_healthy = False
    
    # Assert database connectivity
    try:
        from sqlalchemy import text
        from app.infrastructure.database.session import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_healthy = True
    except Exception as e:
        logger.error(f"Healthcheck Database connection check failed: {e}")
        
    # Assert Redis connectivity
    try:
        from app.infrastructure.cache.redis import ping_redis
        if await ping_redis():
            redis_healthy = True
    except Exception as e:
        logger.error(f"Healthcheck Redis connection check failed: {e}")
        
    # Set status code (503 if any dependency is down)
    status_code = (
        status.HTTP_200_OK 
        if (db_healthy and redis_healthy) 
        else status.HTTP_503_SERVICE_UNAVAILABLE
    )
    
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if status_code == status.HTTP_200_OK else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "redis": "connected" if redis_healthy else "disconnected"
        }
    )



