"""🔍 SENTRY MONITORING - Multi-Tenant Error Tracking.

Sistema de monitoramento de erros otimizado para SaaS multi-tenant:
- Contexto organizacional automático
- Filtragem de dados sensíveis
- Configuração baseada em ambiente
- Integração com FastAPI
"""
import logging
from typing import Any, Optional
from uuid import UUID

import sentry_sdk
from fastapi import Request
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from .config import settings

logger = logging.getLogger(__name__)


def _filter_websocket_loop_errors(event) -> Optional[dict]:
    """Filter WebSocket loop errors that can cause Sentry recursion."""
    if not event.get("exception"):
        return event

    websocket_loop_patterns = [
        "websocket is not connected",
        "need to call accept first",
        "keyerror: 'transaction'",
        "internal error in sentry_sdk",
    ]

    for exc_info in event["exception"].get("values", []):
        exc_type = exc_info.get("type", "").lower()
        exc_value = exc_info.get("value", "").lower()

        if any(pattern in exc_value for pattern in websocket_loop_patterns):
            logger.debug(f"Filtering WebSocket loop error from Sentry: {exc_type}")
            return None  # Don't send to Sentry to prevent loops

    return event


def _remove_sensitive_headers(event) -> dict:
    """Remove sensitive headers from Sentry event."""
    if "request" not in event:
        return event

    headers = event["request"].get("headers", {})
    sensitive_headers = ["authorization", "cookie", "x-api-key", "x-auth-token"]

    for header in sensitive_headers:
        headers.pop(header, None)
        headers.pop(header.upper(), None)
        headers.pop(header.title(), None)

    return event


def _remove_sensitive_extra_data(event) -> dict:
    """Remove sensitive data from extra context."""
    if "extra" not in event:
        return event

    sensitive_keys = ["password", "token", "secret", "key", "auth", "credential"]

    for key in list(event["extra"].keys()):
        if any(sensitive in key.lower() for sensitive in sensitive_keys):
            event["extra"].pop(key, None)

    return event


def _create_before_send_filter():
    """Create before_send filter function for Sentry."""

    def before_send(event, hint):
        """Filter sensitive data and prevent loops before sending to Sentry."""
        # Filter WebSocket loop errors
        event = _filter_websocket_loop_errors(event)
        if event is None:
            return None

        # Remove sensitive data
        event = _remove_sensitive_headers(event)
        event = _remove_sensitive_extra_data(event)

        return event

    return before_send


def _get_sentry_integrations():
    """Get Sentry integrations configuration."""
    return [
        FastApiIntegration(transaction_style="url"),
        SqlalchemyIntegration(),
        LoggingIntegration(
            level=logging.INFO,
            event_level=logging.ERROR,
        ),
    ]


def setup_sentry() -> None:
    """🔧 Configure Sentry for multi-tenant SaaS monitoring."""
    if not settings.SENTRY_DSN:
        logger.info("Sentry DSN not configured - error tracking disabled")
        return

    try:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.SENTRY_ENVIRONMENT,
            traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
            profiles_sample_rate=settings.SENTRY_PROFILES_SAMPLE_RATE,
            before_send=_create_before_send_filter(),
            integrations=_get_sentry_integrations(),
            release=f"{settings.APP_NAME}@{settings.APP_VERSION}",
            default_integrations=True,
            send_default_pii=False,
            attach_stacktrace=True,
            max_breadcrumbs=50,
            debug=settings.is_development,
        )

        logger.info(
            f"Sentry initialized successfully - environment: {settings.SENTRY_ENVIRONMENT}, "
            f"traces_sample_rate: {settings.SENTRY_TRACES_SAMPLE_RATE}"
        )

    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}")


def set_organization_context(
    organization_id: Optional[UUID] = None, organization_name: Optional[str] = None
) -> None:
    """🏢 Set organization context for multi-tenant error tracking."""
    if not settings.SENTRY_DSN:
        return

    try:
        sentry_sdk.set_tag("organization_id", str(organization_id) if organization_id else None)

        if organization_name:
            sentry_sdk.set_tag("organization_name", organization_name)

        # Set user context if organization is provided
        if organization_id:
            sentry_sdk.set_context(
                "organization",
                {
                    "id": str(organization_id),
                    "name": organization_name or "Unknown",
                },
            )

    except Exception as e:
        logger.warning(f"Failed to set organization context in Sentry: {e}")


def set_user_context(
    user_id: Optional[UUID] = None,
    email: Optional[str] = None,
    role: Optional[str] = None,
) -> None:
    """👤 Set user context for error tracking."""
    if not settings.SENTRY_DSN:
        return

    try:
        # Remove email if in production to avoid PII
        user_data = {
            "id": str(user_id) if user_id else None,
        }

        # Only include email in development
        if settings.is_development and email:
            user_data["email"] = email

        if role:
            user_data["role"] = role

        sentry_sdk.set_user(user_data)

        # Set additional tags
        if user_id:
            sentry_sdk.set_tag("user_id", str(user_id))
        if role:
            sentry_sdk.set_tag("user_role", role)

    except Exception as e:
        logger.warning(f"Failed to set user context in Sentry: {e}")


def set_request_context(request: Request) -> None:
    """🌐 Set request context for error tracking."""
    if not settings.SENTRY_DSN:
        return

    try:
        # Get organization from header
        org_id = request.headers.get("X-Org-Id")
        if org_id:
            sentry_sdk.set_tag("organization_id", org_id)

        # Set request metadata
        sentry_sdk.set_context(
            "request_info",
            {
                "method": request.method,
                "url": str(request.url),
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "user_agent": request.headers.get("user-agent", "Unknown"),
            },
        )

        # Set route context if available
        if hasattr(request, "scope") and "route" in request.scope:
            route = request.scope["route"]
            sentry_sdk.set_tag("endpoint", getattr(route, "name", "unknown"))

    except Exception as e:
        logger.warning(f"Failed to set request context in Sentry: {e}")


def capture_business_event(
    event_name: str,
    organization_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    **extra_data: Any,
) -> None:
    """📊 Capture business events for monitoring."""
    if not settings.SENTRY_DSN:
        return

    try:
        # Set context for the event
        if organization_id:
            set_organization_context(organization_id)
        if user_id:
            set_user_context(user_id)

        # Capture custom event
        sentry_sdk.capture_message(
            message=f"Business Event: {event_name}",
            level="info",
            extras=extra_data,
        )

    except Exception as e:
        logger.warning(f"Failed to capture business event '{event_name}': {e}")


def capture_performance_issue(
    operation: str,
    duration_ms: float,
    threshold_ms: float = 1000,
    **context: Any,
) -> None:
    """⚡ Capture slow operations for performance monitoring."""
    if not settings.SENTRY_DSN or duration_ms < threshold_ms:
        return

    try:
        sentry_sdk.capture_message(
            message=f"Slow Operation: {operation} took {duration_ms:.2f}ms",
            level="warning",
            extras={
                "operation": operation,
                "duration_ms": duration_ms,
                "threshold_ms": threshold_ms,
                **context,
            },
        )

    except Exception as e:
        logger.warning(f"Failed to capture performance issue for '{operation}': {e}")


def get_sentry_trace_id() -> Optional[str]:
    """🔍 Get current Sentry trace ID for logging correlation."""
    if not settings.SENTRY_DSN:
        return None

    try:
        return sentry_sdk.get_current_span().trace_id if sentry_sdk.get_current_span() else None
    except Exception:
        return None
