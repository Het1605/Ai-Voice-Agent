"""
Purpose: Centralized logging configuration for the backend application.
Responsibilities:
  - Configures standard Python logging with consistent formatting.
  - Dynamically sets log levels depending on the environment (e.g. development vs production).
  - Provides a single setup entrypoint extendable to file or cloud logging.
Architecture Fit:
  - Configured globally at FastAPI application startup.
  - Controls the formatting and logging behavior across all backend packages.
"""

import logging
import sys
from app.core.config import settings

def setup_logging() -> None:
    """
    Configures the root logging settings for the application.
    Dynamically adjusts levels and formats log output to stdout.
    """
    # Determine logging level based on settings.ENVIRONMENT
    log_level = logging.DEBUG if settings.ENVIRONMENT == "development" else logging.INFO
    
    # Consistent output format across the project
    log_format = "%(asctime)s - %(levelname)s - [%(name)s] - %(message)s"
    
    # Apply configuration to root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ],
        force=True  # Resets any default/previously configured handlers
    )
    
    # Optimize third-party logs to prevent noise
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    
    logger = logging.getLogger("logging_service")
    logger.info(
        f"Logging system initialized (Mode: {settings.ENVIRONMENT}, Level: {logging.getLevelName(log_level)})"
    )
