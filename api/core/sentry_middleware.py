"""🔍 SENTRY MIDDLEWARE - Automatic Multi-Tenant Context Capture.

Middleware que captura automaticamente contexto organizacional e de usuário
para todas as requisições, seguindo os padrões multi-tenant do sistema.
"""
import logging
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from .sentry import (
    capture_performance_issue,
    get_sentry_trace_id,
    set_organization_context,
    set_request_context,
    set_user_context,
)

logger = logging.getLogger(__name__)


class SentryContextMiddleware(BaseHTTPMiddleware):
    """🏢 Middleware for automatic Sentry context capture in multi-tenant environment."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and capture Sentry context."""
        start_time = time.time()

        try:
            # Set up contexts before processing request
            self._setup_request_contexts(request)

            # Process the request
            response = await call_next(request)

            # Handle post-processing
            response = self._handle_response_processing(request, response, start_time)

            return response

        except Exception as e:
            # 🚨 Capture unhandled middleware errors
            logger.error(f"Sentry middleware error: {e}", exc_info=True)
            # Continue processing even if Sentry fails
            return await call_next(request)

    def _setup_request_contexts(self, request: Request) -> None:
        """Set up Sentry contexts from request data."""
        # 🌐 Set request context
        set_request_context(request)

        # 🏢 Extract and set organization context
        self._set_organization_context(request)

        # 👤 Extract and set user context from JWT
        self._set_user_context(request)

    def _set_organization_context(self, request: Request) -> None:
        """Extract and set organization context from headers."""
        org_id = request.headers.get("X-Org-Id")
        if org_id:
            try:
                from uuid import UUID

                org_uuid = UUID(org_id)
                set_organization_context(organization_id=org_uuid)
            except ValueError:
                logger.warning(f"Invalid organization ID format: {org_id}")

    def _set_user_context(self, request: Request) -> None:
        """Extract and set user context from JWT token."""
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                user_info = self._extract_user_from_token(token)
                if user_info:
                    set_user_context(
                        user_id=user_info.get("user_id"),
                        email=user_info.get("email"),
                        role=user_info.get("role"),
                    )
            except Exception as e:
                logger.debug(f"Could not extract user context from token: {e}")

    def _handle_response_processing(
        self, request: Request, response: Response, start_time: float
    ) -> Response:
        """Handle response post-processing including performance tracking."""
        # ⚡ Capture slow requests
        duration_ms = (time.time() - start_time) * 1000
        if duration_ms > 1000:
            org_id = request.headers.get("X-Org-Id")
            capture_performance_issue(
                operation=f"{request.method} {request.url.path}",
                duration_ms=duration_ms,
                threshold_ms=1000,
                organization_id=org_id,
                status_code=response.status_code,
                endpoint=request.url.path,
            )

        # 📊 Add Sentry trace ID to response headers
        trace_id = get_sentry_trace_id()
        if trace_id:
            response.headers["X-Sentry-Trace"] = trace_id

        return response

    def _extract_user_from_token(self, token: str) -> dict:
        """🔑 Extract user information from JWT token."""
        try:
            import jwt

            from .config import settings

            # Decode JWT token
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )

            return {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role"),
                "organization_id": payload.get("org_id"),
            }

        except Exception as e:
            logger.debug(f"Failed to decode JWT token: {e}")
            return {}
