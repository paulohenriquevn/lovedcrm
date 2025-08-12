"""FastAPI application main module with middleware and route configuration."""
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from api.core.config import settings

# Import logging configuration
from api.core.logging_config import get_logger, setup_logging

# Import Sentry configuration (optional)
try:
    from api.core.sentry import setup_sentry

    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

    def setup_sentry() -> None:
        """Fallback setup_sentry function when Sentry is not available."""


# Minimal middleware
from api.core.middleware import SecurityHeadersMiddleware
from api.core.organization_middleware import OrganizationContextMiddleware
from api.core.rate_limiter import get_limiter

# Import Sentry middleware (optional)
try:
    from api.core.sentry_middleware import SentryContextMiddleware

    SENTRY_MIDDLEWARE_AVAILABLE = True
except ImportError:
    SENTRY_MIDDLEWARE_AVAILABLE = False

    # Create fallback middleware class with compatible interface
    class SentryContextMiddleware:  # type: ignore[no-redef]
        """Fallback SentryContextMiddleware when Sentry middleware is not available."""

        def __init__(self, app) -> None:
            """Initialize the fallback middleware."""
            self.app = app

        async def dispatch(self, request, call_next):
            """Process request without Sentry context (fallback implementation)."""
            return await call_next(request)


# Import essential routers only
from api.routers.auth import router as auth_router
from api.routers.billing import router as billing_router
from api.routers.crm_analytics import router as crm_analytics_router
from api.routers.crm_bulk_operations import router as crm_bulk_operations_router
from api.routers.crm_lead_trends import router as crm_lead_trends_router
from api.routers.crm_leads import router as crm_leads_router
from api.routers.invites import router as invites_router
from api.routers.organizations import router as organizations_router
from api.routers.providers import router as providers_router
from api.routers.roles import router as roles_router
from api.routers.user_preferences import router as user_preferences_router
from api.routers.users import router as users_router
from api.routers.websocket import router as websocket_router

# Setup logging and monitoring before creating the app
setup_logging()
setup_sentry()
logger = get_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    description="A complete SaaS starter with authentication, billing, and user management",
)

# 🚦 Configure rate limiting
limiter = get_limiter()
if limiter:
    app.state.limiter = limiter
    logger.info("✅ Rate limiting enabled")

    # Add rate limit exception handler
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        """Handle rate limit exceeded exceptions."""
        response = JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": f"Rate limit exceeded: {exc.detail}"},
        )
        # SlowAPI uses 'retry_after' or similar - safely get retry time
        retry_after = getattr(exc, "retry_after", None) or getattr(exc, "reset_time", "60")
        response.headers["Retry-After"] = str(retry_after)
        return response

else:
    logger.warning("⚠️  Rate limiting disabled")

# Log app startup
logger.info(
    "FastAPI application starting",
    app_name=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# Temporarily remove debug middleware to test without it


# Smart validation error handler - converts 422 to 400 for specific endpoints
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Smart error handler: 400 for specific endpoints, 422 for others."""
    # Endpoints that expect 400 for validation errors
    endpoints_expecting_400 = [
        "/auth/reset-password",  # Password reset expects 400
        "/auth/reset-password-confirm",  # Password reset confirm expects 400
        "/auth/verify-email"  # Email verification expects 400
        # Note: register removed - should return 422 for validation errors
    ]

    # Check if current endpoint should return 400
    request_path = request.url.path
    should_return_400 = any(
        request_path.endswith(endpoint.split("/")[-1]) or request_path == endpoint
        for endpoint in endpoints_expecting_400
    )

    status_code = (
        status.HTTP_400_BAD_REQUEST if should_return_400 else status.HTTP_422_UNPROCESSABLE_ENTITY
    )

    # Convert errors to JSON-serializable format - simplified to avoid hangs
    try:
        errors = exc.errors()
        # Simple serialization without deep processing to avoid hangs
        serializable_errors = []
        for error in errors:
            simple_error = {
                "type": error.get("type", "validation_error"),
                "msg": str(error.get("msg", "Invalid input")),
                "input": str(error.get("input", ""))[:100]
                if error.get("input")
                else None,  # Limit input length
            }
            if error.get("loc"):
                simple_error["loc"] = list(error["loc"])
            serializable_errors.append(simple_error)
    except Exception:
        # Fallback if error processing fails
        serializable_errors = [{"type": "validation_error", "msg": "Validation failed"}]

    return JSONResponse(
        status_code=status_code,
        content={"detail": serializable_errors},
    )


# 🔒 SECURE CORS CONFIGURATION - Specific headers only
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        # Authentication & Authorization
        "Authorization",
        "X-Org-Id",  # Multi-tenant organization context
        # Content & API
        "Content-Type",
        "Accept",
        "Accept-Language",
        # Request tracking & debugging
        "X-Correlation-ID",
        "X-Requested-With",
        # Cache control
        "Cache-Control",
        "Pragma",
        # CSRF protection (if using)
        "X-CSRF-Token",
    ],
    expose_headers=[
        # Allow frontend to read these response headers
        "X-Correlation-ID",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Retry-After",
    ],
)


# Health check endpoint
def _check_database_health() -> Dict[str, Any]:
    """Check database health and return status dict."""
    try:
        import time

        from api.core.database import check_database_health

        db_start = time.time()
        db_healthy = check_database_health()
        db_response_time = round((time.time() - db_start) * 1000, 2)  # ms

        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "response_time_ms": db_response_time,
            "type": "postgresql",
            "healthy": db_healthy,
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "error": str(e), "type": "postgresql", "healthy": False}


def _check_redis_health() -> Dict[str, Any]:
    """Check Redis health and return status dict."""
    try:
        if hasattr(settings, "REDIS_URL") and settings.REDIS_URL:
            import time

            import redis

            redis_start = time.time()
            r = redis.from_url(settings.REDIS_URL)
            r.ping()
            redis_response_time = round((time.time() - redis_start) * 1000, 2)

            return {"status": "healthy", "response_time_ms": redis_response_time, "type": "redis"}
        else:
            return {"status": "not_configured", "type": "redis"}
    except Exception as e:
        logger.warning(f"Redis health check failed: {e}")
        return {"status": "unhealthy", "error": str(e), "type": "redis"}


def _check_external_services() -> Dict[str, Any]:
    """Check external services configuration."""
    external_services = {}

    # Check Stripe if configured
    if hasattr(settings, "STRIPE_SECRET_KEY") and settings.STRIPE_SECRET_KEY:
        try:
            # Simple connectivity check - don't make actual API calls in health check
            external_services["stripe"] = {"status": "configured", "type": "payment"}
        except Exception:
            external_services["stripe"] = {"status": "configured_but_untested", "type": "payment"}
    else:
        external_services["stripe"] = {"status": "not_configured", "type": "payment"}

    # Check SMTP if configured
    if hasattr(settings, "SMTP_HOST") and settings.SMTP_HOST:
        external_services["email"] = {"status": "configured", "type": "smtp"}
    else:
        external_services["email"] = {"status": "not_configured", "type": "smtp"}

    return external_services


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """🚂 Railway-optimized health check with dependency status monitoring."""
    import time

    start_time = time.time()

    # Initialize health status
    health_status: Dict[str, Any] = {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": int(time.time()),
        "uptime": int(time.time() - start_time),
        "dependencies": {},
    }

    # Check database health
    db_status = _check_database_health()
    health_status["dependencies"]["database"] = {
        k: v for k, v in db_status.items() if k != "healthy"
    }
    overall_healthy = db_status.get("healthy", False)

    # Check Redis health
    redis_status = _check_redis_health()
    health_status["dependencies"]["redis"] = redis_status

    # Check external services
    external_services = _check_external_services()
    if external_services:
        health_status["dependencies"]["external_services"] = external_services

    # Set overall status
    health_status["status"] = "healthy" if overall_healthy else "degraded"

    # Performance info
    total_response_time = round((time.time() - start_time) * 1000, 2)
    health_status["response_time_ms"] = total_response_time

    return health_status


# Database information endpoint
@app.get("/database/info")
async def database_info() -> Dict[str, Any]:
    """Get detailed database information for monitoring."""
    try:
        from sqlalchemy import text

        from api.core.database import SessionLocal, get_database_info

        # Get pool information
        pool_info = get_database_info()

        # Get database version and basic info
        db = SessionLocal()
        try:
            # Test connection and get version
            version_result = db.execute(text("SELECT version()")).fetchone()
            db_version = version_result[0] if version_result else "Unknown"

            # Check if schema_versions table exists
            schema_check = db.execute(
                text(
                    """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'schema_versions'
                );
            """
                )
            ).fetchone()
            has_migrations_table = schema_check[0] if schema_check else False

            migration_info = {}
            if has_migrations_table:
                try:
                    latest_migration = db.execute(
                        text(
                            """
                        SELECT version, description, applied_at 
                        FROM schema_versions 
                        ORDER BY version DESC 
                        LIMIT 1
                    """
                        )
                    ).fetchone()
                    if latest_migration:
                        migration_info = {
                            "latest_version": latest_migration[0],
                            "description": latest_migration[1],
                            "applied_at": str(latest_migration[2]),
                        }
                except Exception as e:
                    migration_info = {"error": f"Could not read migrations: {str(e)}"}
            else:
                migration_info = {"status": "No migration table found"}

        finally:
            db.close()

        return {
            "database_version": db_version,
            "connection_pool": pool_info,
            "migrations": migration_info,
            "status": "connected",
        }

    except Exception as e:
        logger.error(f"Database info check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "connection_pool": {},
            "migrations": {"status": "unavailable"},
        }


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint returning API information."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "database": "/database/info",
    }


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize services on startup with FAIL-FAST validation."""
    logger.info("Starting up application services")

    # FAIL-FAST: Validate critical dependencies
    try:
        from api.core.config import settings
        from api.core.database import check_database_health

        # Validate database connection
        if not check_database_health():
            logger.critical("❌ FAIL-FAST: Database connection failed")
            raise RuntimeError("Database connection failed - cannot start application")

        # Validate SECRET_KEY is properly configured
        if len(settings.SECRET_KEY) < 32:
            logger.critical("❌ FAIL-FAST: SECRET_KEY too short")
            raise RuntimeError("SECRET_KEY must be at least 32 characters")

        # Validate essential configuration
        if not settings.DATABASE_URL:
            logger.critical("❌ FAIL-FAST: DATABASE_URL not configured")
            raise RuntimeError("DATABASE_URL must be configured")

        logger.info("✅ FAIL-FAST: All critical dependencies validated")

    except Exception as e:
        logger.critical(f"❌ FAIL-FAST: Startup validation failed: {e}")
        raise RuntimeError(f"Application startup failed: {e}") from e

    # Note: Database migrations are handled via ./migrate script
    # Run './migrate check' to see pending migrations

    logger.info("Application startup complete")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Cleanup services on shutdown."""
    logger.info("Shutting down application services")

    pass  # Services initialization placeholder

    logger.info("Application shutdown complete")


# Essential security middleware only
app.add_middleware(SecurityHeadersMiddleware)

# 🔍 Sentry context middleware for error tracking (BEFORE organization middleware)
if SENTRY_MIDDLEWARE_AVAILABLE:
    app.add_middleware(SentryContextMiddleware)

# 🔴 CRITICAL: Organization context middleware for multi-tenancy (BEFORE routers)
app.add_middleware(OrganizationContextMiddleware)

# Middleware removido para investigação - servidor travado pode não estar recarregando

# Include essential routers - SIMPLIFIED (no versioning)
app.include_router(auth_router)
app.include_router(billing_router)  # Billing and subscription management
app.include_router(users_router)
app.include_router(user_preferences_router)  # User preferences management
app.include_router(organizations_router)
app.include_router(providers_router)  # Multi-provider management (Story 2.0)
app.include_router(roles_router)  # Advanced role management
app.include_router(invites_router)  # Public invite endpoints
app.include_router(crm_leads_router)  # CRM Leads management
app.include_router(crm_analytics_router)  # CRM Analytics & Advanced Insights (Story 3.2)
app.include_router(crm_bulk_operations_router)  # CRM Bulk Operations (Story 3.3)
app.include_router(crm_lead_trends_router)  # CRM Lead Trends (Story 3.3)
app.include_router(websocket_router)  # Real-time collaboration

# Note: Removed app mounting to avoid route conflicts
