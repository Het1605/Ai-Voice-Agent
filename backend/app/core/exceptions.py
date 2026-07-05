"""
Purpose: Centralized application exception definitions for error handling.
Responsibilities:
  - Declares the BaseAppException class as the root of all custom errors.
  - Defines HTTP-friendly subclasses (e.g. NotFoundException, BadRequestException).
  - Holds clean detail strings and HTTP status mappings.
Architecture Fit:
  - Thrown inside business logic and providers when exceptions occur.
  - Intercepted by global middleware in main.py to send standardized JSON errors.
"""

from typing import Any, Dict, Optional
from fastapi import status

class BaseAppException(Exception):
    """
    Root custom exception for the application.
    Enables structured HTTP error translations.
    """
    def __init__(
        self, 
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str = "An unexpected server error occurred.",
        error_code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or self.__class__.__name__
        self.context = context or {}

class NotFoundException(BaseAppException):
    """
    Error thrown when an expected database model or resource is missing.
    """
    def __init__(self, detail: str = "Resource not found.", context: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            context=context
        )

class BadRequestException(BaseAppException):
    """
    Error thrown when request parameters fail basic validation or are malformed.
    """
    def __init__(self, detail: str = "Bad request parameters.", context: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            context=context
        )

class ConflictException(BaseAppException):
    """
    Error thrown when an operation conflicts with existing system states (e.g. duplicate key).
    """
    def __init__(self, detail: str = "Resource conflict occurred.", context: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            context=context
        )

class UnauthorizedException(BaseAppException):
    """
    Error thrown when a request lacks authentication credentials.
    """
    def __init__(self, detail: str = "Authentication credentials missing or invalid.", context: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            context=context
        )

class ForbiddenException(BaseAppException):
    """
    Error thrown when a user has authentication but lacks permission to execute.
    """
    def __init__(self, detail: str = "Permission denied.", context: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            context=context
        )

class InternalServerException(BaseAppException):
    """
    Error thrown when database or service issues break backend execution.
    """
    def __init__(self, detail: str = "Internal server processing failure.", context: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            context=context
        )
