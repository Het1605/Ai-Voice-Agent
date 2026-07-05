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
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.core.logging_service import setup_logging
from backend.app.core.exceptions import BaseAppException

# Initialize logging system immediately on launch
setup_logging()

logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify Database & Redis connections at startup
    logger.info("Initializing database and Redis connection handshakes...")
    
    try:
        from sqlalchemy import text
        from backend.app.core.database import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection handshake successful.")
    except Exception as e:
        logger.error(f"Database connection handshake failed: {e}")
        
    try:
        from backend.app.core.redis_service import ping_redis
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
        from backend.app.core.database import engine
        await engine.dispose()
        logger.info("Database connection engine pools disposed.")
    except Exception as e:
        logger.error(f"Failed to dispose database connection engine: {e}")
        
    try:
        from backend.app.core.redis_service import redis_client
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

from backend.app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.exception_handler(BaseAppException)
async def application_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    """
    Translates custom BaseAppExceptions into formatted JSON error payloads.
    """
    response_content = {
        "error": exc.error_code,
        "detail": exc.detail
    }
    if exc.context:
        response_content["context"] = exc.context
        
    return JSONResponse(
        status_code=exc.status_code,
        content=response_content
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
        from backend.app.core.database import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_healthy = True
    except Exception as e:
        logger.error(f"Healthcheck Database connection check failed: {e}")
        
    # Assert Redis connectivity
    try:
        from backend.app.core.redis_service import ping_redis
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



