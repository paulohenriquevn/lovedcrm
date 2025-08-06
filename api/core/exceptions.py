"""Unified exception handling system - following KISS principle."""

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import HTTPException, status


class BaseApplicationError(Exception):
    """Base exception class for application errors."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Initialize base application error."""
        self.message = message
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.now(timezone.utc).isoformat()
        super().__init__(message)

    def to_http_exception(self) -> HTTPException:
        """Convert to FastAPI HTTPException."""
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": self.code,
                "message": self.message,
                "timestamp": self.timestamp,
                "details": self.details,
            },
        )


class ValidationError(BaseApplicationError):
    """Validation related errors."""

    def __init__(
        self, message: str, field: Optional[str] = None, details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Initialize validation error."""
        super().__init__(message, "VALIDATION_ERROR", details)
        self.field = field

    def to_http_exception(self) -> HTTPException:
        """Convert business logic error to HTTP exception."""
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": self.code,
                "message": self.message,
                "field": self.field,
                "timestamp": self.timestamp,
                "details": self.details,
            },
        )


class NotFoundError(BaseApplicationError):
    """Resource not found errors."""

    def __init__(
        self,
        resource: str,
        identifier: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize not found error."""
        message = f"{resource} not found"
        if identifier:
            message += f": {identifier}"
        super().__init__(message, "NOT_FOUND", details)
        self.resource = resource
        self.identifier = identifier

    def to_http_exception(self) -> HTTPException:
        """Convert business logic error to HTTP exception."""
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": self.code,
                "message": self.message,
                "resource": self.resource,
                "identifier": self.identifier,
                "timestamp": self.timestamp,
                "details": self.details,
            },
        )


class AuthenticationError(BaseApplicationError):
    """Authentication related errors."""

    def __init__(
        self,
        message: str = "Unauthorized",
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize authentication error."""
        super().__init__(message, "AUTHENTICATION_ERROR", details)

    def to_http_exception(self) -> HTTPException:
        """Convert business logic error to HTTP exception."""
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": self.code,
                "message": self.message,
                "timestamp": self.timestamp,
                "details": self.details,
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthorizationError(BaseApplicationError):
    """Authorization related errors."""

    def __init__(self, message: str = "Access denied", details: Optional[Dict[str, Any]] = None):
        """Initialize authorization error."""
        super().__init__(message, "AUTHORIZATION_ERROR", details)

    def to_http_exception(self) -> HTTPException:
        """Convert business logic error to HTTP exception."""
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": self.code,
                "message": self.message,
                "timestamp": self.timestamp,
                "details": self.details,
            },
        )


class RateLimitError(BaseApplicationError):
    """Rate limit exceeded errors."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: int = 60,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Initialize rate limit error."""
        super().__init__(message, "RATE_LIMIT_ERROR", details)
        self.retry_after = retry_after

    def to_http_exception(self) -> HTTPException:
        """Convert business logic error to HTTP exception."""
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": self.code,
                "message": self.message,
                "retry_after": self.retry_after,
                "timestamp": self.timestamp,
                "details": self.details,
            },
            headers={"Retry-After": str(self.retry_after)},
        )


class DatabaseError(BaseApplicationError):
    """Database related errors."""

    def __init__(self, operation: str, details: Optional[Dict[str, Any]] = None):
        """Initialize database error."""
        message = f"Database error during {operation}"
        super().__init__(message, "DATABASE_ERROR", details)
        self.operation = operation

    def to_http_exception(self) -> HTTPException:
        """Convert business logic error to HTTP exception."""
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": self.code,
                "message": "A database error occurred",  # Don't expose internal details
                "timestamp": self.timestamp,
            },
        )


class ExternalServiceError(BaseApplicationError):
    """External service errors (Stripe, OpenAI, etc.)."""

    def __init__(self, service: str, message: str, details: Optional[Dict[str, Any]] = None):
        """Initialize external service error."""
        super().__init__(f"{service} error: {message}", "EXTERNAL_SERVICE_ERROR", details)
        self.service = service

    def to_http_exception(self) -> HTTPException:
        """Convert business logic error to HTTP exception."""
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": self.code,
                "message": f"External service temporarily unavailable: {self.service}",
                "timestamp": self.timestamp,
            },
        )


# Convenience functions for common errors
def not_found(resource: str, identifier: Optional[str] = None) -> NotFoundError:
    """Create a not found error."""
    return NotFoundError(resource, identifier)


def validation_error(message: str, field: Optional[str] = None) -> ValidationError:
    """Create a validation error."""
    return ValidationError(message, field)


def unauthorized(message: str = "Unauthorized") -> AuthenticationError:
    """Create an authentication error."""
    return AuthenticationError(message)


def forbidden(message: str = "Access denied") -> AuthorizationError:
    """Create an authorization error."""
    return AuthorizationError(message)


def rate_limited(retry_after: int = 60) -> RateLimitError:
    """Create a rate limit error."""
    return RateLimitError(retry_after=retry_after)


def database_error(operation: str) -> DatabaseError:
    """Create a database error."""
    return DatabaseError(operation)


def external_service_error(service: str, message: str) -> ExternalServiceError:
    """Create an external service error."""
    return ExternalServiceError(service, message)
