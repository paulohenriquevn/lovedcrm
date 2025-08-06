"""🏢 Organization Context Middleware - Header-based Multi-tenant validation.

This middleware ensures that ALL protected endpoints validate organization access
based on JWT org_id and X-Org-Id header matching.
"""
import logging
from typing import Callable
from uuid import UUID

from fastapi import HTTPException, Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

from .security import verify_token

logger = logging.getLogger(__name__)


class OrganizationContextMiddleware(BaseHTTPMiddleware):
    """Middleware to validate organization context in multi-tenant requests."""

    def __init__(self, app):
        """Initialize organization context middleware."""
        super().__init__(app)

        # 🌐 PUBLIC ROUTES: No authentication required
        self.public_routes = [
            "/",  # Root endpoint
            "/auth/",  # All auth endpoints (register, login, etc)
            "/docs",
            "/openapi.json",
            "/redoc",
            "/health",
            "/favicon.ico",
            "/billing/available-plans",  # Public billing plans
            "/billing/stripe-webhook",  # Stripe webhook (handles auth internally)
            "/invites/",  # All invite endpoints are public (get token info, accept, reject)
        ]

        # 🔐 AUTH-ONLY ROUTES: Authentication required, no org validation
        self.auth_only_routes = [
            "/auth/me",
            "/auth/logout",
            "/auth/refresh",
            "/users/me/organizations",  # User's organizations list (cross-org)
        ]

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process HTTP requests with organization context validation."""
        path = request.url.path

        # Skip middleware for public routes
        if self._is_public_route(path):
            return await call_next(request)

        # Skip middleware for auth-only routes
        if self._is_auth_only_route(path):
            return await call_next(request)

        # 🔒 SECURE BY DEFAULT: All other routes require org validation
        try:
            await self._validate_organization_access(request)
        except HTTPException as e:
            from fastapi.responses import JSONResponse

            return JSONResponse(content={"detail": e.detail}, status_code=e.status_code)

        return await call_next(request)

    def _is_public_route(self, path: str) -> bool:
        """Check if route is public (no auth needed)."""
        # Handle exact match for root path
        if path == "/":
            return True

        # For other routes, check if they start with any of the public route prefixes
        # but exclude the root "/" to prevent all routes from being public
        return any(route != "/" and path.startswith(route) for route in self.public_routes)

    def _is_auth_only_route(self, path: str) -> bool:
        """Check if route needs auth but not org validation."""
        return any(path.startswith(route) for route in self.auth_only_routes)

    async def _validate_organization_access(self, request: Request) -> None:
        """Validate that JWT org_id matches X-Org-Id header."""
        # Extract JWT token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Missing or invalid authorization header",
            )

        # Extract X-Org-Id header
        header_org_id = request.headers.get("X-Org-Id")
        if not header_org_id:
            logger.error(f"Missing X-Org-Id header for path: {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing X-Org-Id header for organization context",
            )

        token = auth_header.split(" ")[1]

        try:
            # Verify JWT and extract org_id
            payload = verify_token(token, "access")
            jwt_org_id = payload.get("org_id")

            if not jwt_org_id:
                logger.error(f"JWT missing org_id for header org_id={header_org_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing organization context",
                )

            # Validate UUID format
            try:
                UUID(header_org_id)
                UUID(jwt_org_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid organization ID format"
                )

            # 🔴 CRITICAL: JWT org_id MUST match X-Org-Id header
            if str(jwt_org_id) != str(header_org_id):
                logger.warning(
                    f"Organization access denied: JWT org_id={jwt_org_id}, header org_id={header_org_id}",
                    extra={
                        "jwt_org_id": str(jwt_org_id),
                        "header_org_id": str(header_org_id),
                        "path": request.url.path,
                    },
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: organization mismatch",
                )

            logger.info(
                "Organization access validated successfully",
                extra={
                    "org_id": str(jwt_org_id),
                    "path": request.url.path,
                    "method": request.method,
                },
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error validating organization access: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token"
            ) from e
