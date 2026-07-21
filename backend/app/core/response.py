"""
Purpose: Standardized API response envelope for all HTTP endpoints.
Responsibilities:
  - Defines a consistent JSON envelope for every API response.
  - Provides generic response models for single items, paginated lists, and errors.
  - Ensures the frontend can rely on a predictable response shape.
Architecture Fit:
  - Every endpoint returns data wrapped in one of these models.
  - Aligns with the BaseAppException error format so success and error responses
    share the same top-level structure.
  - response_model in routers should use APIResponse[MySchema] for type-safe OpenAPI docs.
"""

from typing import Generic, List, Optional, TypeVar, Any, Dict
from pydantic import BaseModel, ConfigDict

DataT = TypeVar("DataT")


# ─── Error Models ───────────────────────────────────────────────────────────

class APIError(BaseModel):
    """Structured error payload returned on failure."""

    code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred."
    details: Optional[Dict[str, Any]] = None


# ─── Success Envelope ────────────────────────────────────────────────────────

class APIResponse(BaseModel, Generic[DataT]):
    """
    Standard success envelope.

    Type-hint with the response schema for accurate OpenAPI generation:
        → APIResponse[UserResponse]

    For paginated endpoints use PaginatedResponse instead.
    """

    success: bool = True
    data: Optional[DataT] = None
    meta: Optional[Dict[str, Any]] = None


class PaginatedResponse(BaseModel, Generic[DataT]):
    """
    Envelope for paginated list endpoints.

    Type-hint with the item schema:
        → PaginatedResponse[UserResponse]
    """

    success: bool = True
    data: List[DataT]
    meta: Dict[str, Any]  # contains page, page_size, total, count


# ─── Error Envelope ──────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Standard error envelope returned by exception handlers."""

    success: bool = False
    error: APIError


# ─── Helper Functions ────────────────────────────────────────────────────────

def success_response(
    data: Optional[Any] = None,
    meta: Optional[Dict[str, Any]] = None,
) -> APIResponse[Any]:
    """
    Build a standard success response.

    Usage:
        return success_response(user)
        return success_response(users, meta={"page": 1, "per_page": 20, "total": 42})
    """
    return APIResponse(success=True, data=data, meta=meta)


def paginated_response(
    items: List[Any],
    total: int,
    page: int,
    page_size: int,
) -> PaginatedResponse[Any]:
    """
    Build a paginated list response with count metadata.

    Usage:
        users, total = await service.list_users(db, page=1, page_size=20)
        return paginated_response(users, total=total, page=1, page_size=20)
    """
    return PaginatedResponse(
        success=True,
        data=items,
        meta={
            "page": page,
            "page_size": page_size,
            "total": total,
            "count": len(items),
        },
    )


def error_response(
    code: str = "INTERNAL_ERROR",
    message: str = "An unexpected error occurred.",
    details: Optional[Dict[str, Any]] = None,
) -> ErrorResponse:
    """
    Build a standard error response.

    Typically used by exception handlers rather than endpoint code.
    """
    return ErrorResponse(
        success=False,
        error=APIError(code=code, message=message, details=details),
    )
