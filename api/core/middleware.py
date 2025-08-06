"""Middleware components for request processing, timing, and CORS handling."""
import time
import uuid
from typing import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# from .config import settings  # Removed unused import
from .logging_config import get_logger, set_correlation_id

# Rate limiting removed for simplicity


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Middleware to generate and track correlation IDs for request tracing."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Process request with correlation ID tracking."""
        # Get or generate correlation ID
        correlation_id = request.headers.get("X-Correlation-ID")
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        # Set correlation ID in context for logging
        set_correlation_id(correlation_id)

        # Store in request state for access in endpoints
        request.state.correlation_id = correlation_id

        # Get logger for middleware
        logger = get_logger(__name__)

        # Log request start
        logger.info(
            "Request started",
            method=request.method,
            path=request.url.path,
            query_params=str(request.query_params),
            client_ip=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
        )

        start_time = time.perf_counter()

        try:
            # Process request
            response = await call_next(request)

            # Calculate duration
            duration_ms = (time.perf_counter() - start_time) * 1000

            # Log successful request
            logger.info(
                "Request completed",
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
                response_size=response.headers.get("content-length", "unknown"),
            )

            # Add correlation ID to response headers
            response.headers["X-Correlation-ID"] = correlation_id

            return response

        except Exception as e:
            # Calculate duration for failed request
            duration_ms = (time.perf_counter() - start_time) * 1000

            # Log failed request
            logger.error(
                "Request failed",
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=round(duration_ms, 2),
            )

            raise


# TenantMiddleware moved to api/middleware/tenant_middleware.py to avoid duplication


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Add security headers to all responses."""
        response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        return response
