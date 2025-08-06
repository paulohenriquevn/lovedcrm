"""Database configuration and session management for the FastAPI application."""
import logging
from typing import Any, Dict

from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

logger = logging.getLogger(__name__)

# Connection pool configuration - optimized for test environment
if settings.ENVIRONMENT == "test":
    DB_POOL_CONFIG = {
        "pool_size": 5,  # Fewer connections for tests
        "max_overflow": 5,  # Fewer overflow connections
        "pool_pre_ping": True,  # Validate connections before use
        "pool_recycle": 300,  # Recycle connections after 5 minutes
        "pool_timeout": 5,  # Much shorter timeout for tests
    }
else:
    DB_POOL_CONFIG = {
        "pool_size": 20,  # Number of connections to keep open
        "max_overflow": 30,  # Additional connections when pool is full
        "pool_pre_ping": True,  # Validate connections before use
        "pool_recycle": 3600,  # Recycle connections after 1 hour
        "pool_timeout": 30,  # Timeout to get connection from pool
    }

# Sync database setup with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    **DB_POOL_CONFIG,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async database setup with connection pooling
try:
    if settings.DATABASE_URL.startswith("sqlite"):
        # Para SQLite, usar versão síncrona
        async_engine = None
        AsyncSessionLocal = None
        logger.info("Using synchronous SQLite database (async engine disabled)")
    else:
        async_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
        async_engine = create_async_engine(
            async_url,
            **DB_POOL_CONFIG,
            echo=settings.DEBUG,  # Log SQL queries in debug mode
        )
        AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)  # type: ignore[call-overload]
        logger.info("Async database engine initialized successfully")
except Exception as e:
    logger.critical(
        "Failed to initialize async database engine",
        extra={
            "error": str(e),
            "error_type": type(e).__name__,
            "database_url_type": "sqlite"
            if settings.DATABASE_URL.startswith("sqlite")
            else "postgresql",
        },
    )
    # Re-raise for critical database errors in production
    if not getattr(settings, "TESTING", False) and not settings.DEBUG:
        logger.critical("Async database initialization failed in production - terminating")
        raise
    # In testing/debug, continue with None values
    async_engine = None
    AsyncSessionLocal = None


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""


# Dependency to get database session
def get_db() -> Any:
    """Get database session dependency for FastAPI."""
    db = SessionLocal()
    try:
        yield db
        # If no exception occurred, commit the transaction
        db.commit()
        logger.debug("✅ Database transaction committed successfully")
    except Exception as e:
        # If exception occurred, rollback the transaction
        db.rollback()
        logger.error(f"🚨 Database transaction rolled back due to error: {e}")
        raise
    finally:
        db.close()


# Async dependency to get database session
async def get_async_db() -> Any:
    """Get async database session dependency for FastAPI."""
    if AsyncSessionLocal is None:
        raise RuntimeError("Async database session not available")
    async with AsyncSessionLocal() as session:
        yield session


# Health check function for database
def check_database_health() -> bool:
    """Check if database is healthy."""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as db_error:
        logger.error(
            "Database health check failed",
            extra={
                "error": str(db_error),
                "error_type": type(db_error).__name__,
                "operation": "health_check",
            },
        )
        return False


# Get database info for monitoring
def get_database_info() -> Dict[str, int]:
    """Get database connection pool information."""
    try:
        pool = engine.pool
        return {
            "pool_size": getattr(pool, "size", lambda: 0)() if hasattr(pool, "size") else 0,
            "checked_in": getattr(pool, "checkedin", lambda: 0)()
            if hasattr(pool, "checkedin")
            else 0,
            "checked_out": getattr(pool, "checkedout", lambda: 0)()
            if hasattr(pool, "checkedout")
            else 0,
            "overflow": getattr(pool, "overflow", lambda: 0)() if hasattr(pool, "overflow") else 0,
            "invalid": getattr(pool, "invalid", lambda: 0)() if hasattr(pool, "invalid") else 0,
        }
    except Exception:
        return {
            "pool_size": 0,
            "checked_in": 0,
            "checked_out": 0,
            "overflow": 0,
            "invalid": 0,
        }
