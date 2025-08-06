"""Advanced logging configuration with structured logging and correlation IDs."""

import asyncio
import functools
import logging
import logging.config
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, MutableMapping, Optional

try:
    import psutil

    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
import structlog
from pythonjsonlogger import jsonlogger

from .config import settings


class CorrelationIdProcessor:
    """Structlog processor to add correlation IDs to log entries."""

    def __call__(
        self, logger: Any, method_name: str, event_dict: MutableMapping[str, Any]
    ) -> MutableMapping[str, Any]:
        """Add correlation ID to log events."""
        # Get correlation ID from context or generate new one
        correlation_id = getattr(logging.getLogger(), "correlation_id", None)
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        event_dict["correlation_id"] = correlation_id
        return event_dict


class TimestampProcessor:
    """Structlog processor to add consistent timestamps."""

    def __call__(
        self, logger: Any, method_name: str, event_dict: MutableMapping[str, Any]
    ) -> MutableMapping[str, Any]:
        """Add timestamp to log events."""
        event_dict["timestamp"] = datetime.now(timezone.utc).isoformat()
        return event_dict


class SensitiveDataFilter:
    """Filter to remove sensitive data from logs."""

    SENSITIVE_FIELDS = {
        "password",
        "secret",
        "token",
        "key",
        "authorization",
        "cookie",
        "session",
        "credentials",
        "ssn",
        "credit_card",
    }

    def __call__(
        self, logger: Any, method_name: str, event_dict: MutableMapping[str, Any]
    ) -> MutableMapping[str, Any]:
        """Remove sensitive data from log events."""
        return self._sanitize_dict(dict(event_dict))

    def _sanitize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively sanitize dictionary removing sensitive data."""
        sanitized = {}

        for key, value in data.items():
            if isinstance(key, str) and any(
                sensitive in key.lower() for sensitive in self.SENSITIVE_FIELDS
            ):
                sanitized[key] = "[REDACTED]"
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_dict(value)  # type: ignore[assignment]
            elif isinstance(value, list):
                sanitized[key] = [  # type: ignore[assignment]
                    self._sanitize_dict(item) if isinstance(item, dict) else item for item in value
                ]
            else:
                sanitized[key] = value

        return sanitized


class AppNameFilter(logging.Filter):
    """Filter to replace uvicorn logger names with app name."""

    def __init__(self, app_name: Optional[str] = None):
        """Initialize app name filter with application name."""
        super().__init__()
        self.app_name = app_name or settings.APP_NAME

    def filter(self, record: logging.LogRecord) -> bool:
        """Filter and modify log record names."""
        # Replace uvicorn logger names with app name
        if record.name.startswith("uvicorn"):
            record.name = self.app_name
        return True


class PerformanceProcessor:
    """Processor to add performance metrics to logs."""

    def __call__(self, logger: Any, method_name: str, event_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Add performance metrics to log events."""
        # Add memory usage and other performance metrics
        if HAS_PSUTIL:
            process = psutil.Process()
            event_dict["performance"] = {
                "memory_mb": round(process.memory_info().rss / 1024 / 1024, 2),
                "cpu_percent": process.cpu_percent(),
            }
        else:
            event_dict["performance"] = {
                "memory_mb": 0.0,
                "cpu_percent": 0.0,
            }

        return event_dict


class NoOpProcessor:
    """No-op processor for conditional use."""

    def __call__(
        self, logger: Any, method_name: str, event_dict: MutableMapping[str, Any]
    ) -> MutableMapping[str, Any]:
        """No-op processor that returns event dict unchanged."""
        return event_dict


def setup_logging() -> None:
    """Setup structured logging configuration."""
    # Build processors list
    processors_list: List[Any] = [
        structlog.contextvars.merge_contextvars,
        CorrelationIdProcessor(),
        TimestampProcessor(),
        SensitiveDataFilter(),
    ]

    # Add performance processor conditionally
    if settings.DEBUG:
        processors_list.append(PerformanceProcessor())
    else:
        processors_list.append(NoOpProcessor())

    # Add remaining processors
    processors_list.extend(
        [
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.JSONRenderer(),
        ]
    )

    # Configure structlog
    structlog.configure(
        processors=processors_list,
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.INFO if not settings.DEBUG else logging.DEBUG
        ),
        logger_factory=structlog.WriteLoggerFactory(),
        context_class=dict,
        cache_logger_on_first_use=True,
    )

    # Configure standard logging
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": jsonlogger.JsonFormatter,
                "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
                "datefmt": "%Y-%m-%dT%H:%M:%S%z",
            },
            "app_json": {
                "()": jsonlogger.JsonFormatter,
                "format": "%(asctime)s %(levelname)s %(message)s",
                "datefmt": "%Y-%m-%dT%H:%M:%S%z",
            },
            "detailed": {
                "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "filters": {"app_name_filter": {"()": AppNameFilter, "app_name": settings.APP_NAME}},
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "DEBUG" if settings.DEBUG else "INFO",
                "formatter": "detailed" if settings.DEBUG else "json",
                "stream": sys.stdout,
                "filters": ["app_name_filter"],
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "json",
                "filename": "logs/app.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf-8",
                "filters": ["app_name_filter"],
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "json",
                "filename": "logs/error.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf-8",
                "filters": ["app_name_filter"],
            },
        },
        "loggers": {
            "": {  # Root logger
                "level": "DEBUG" if settings.DEBUG else "INFO",
                "handlers": ["console", "file", "error_file"],
                "propagate": False,
            },
            "uvicorn": {"level": "INFO", "handlers": ["console"], "propagate": False},
            "uvicorn.error": {
                "level": "INFO",
                "handlers": ["console", "error_file"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            "sqlalchemy.engine": {
                "level": "INFO" if settings.DEBUG else "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }

    # Create logs directory if it doesn't exist

    os.makedirs("logs", exist_ok=True)

    logging.config.dictConfig(log_config)


def get_logger(name: str) -> structlog.BoundLogger:
    """Get a configured logger instance."""
    return structlog.get_logger(name)  # type: ignore[no-any-return]


def set_correlation_id(correlation_id: str) -> None:
    """Set correlation ID for current context."""
    structlog.contextvars.bind_contextvars(correlation_id=correlation_id)


def get_correlation_id() -> str:
    """Get current correlation ID or generate new one."""
    try:
        return structlog.contextvars.get_contextvars().get("correlation_id", str(uuid.uuid4()))  # type: ignore[no-any-return]
    except Exception:
        return str(uuid.uuid4())


class LoggerMixin:
    """Mixin class to add logging capabilities to other classes."""

    @property
    def logger(self) -> structlog.BoundLogger:
        """Get logger instance for this class."""
        if not hasattr(self, "_logger"):
            self._logger = get_logger(self.__class__.__module__ + "." + self.__class__.__name__)
        return self._logger

    def log_method_call(self, method_name: str, **kwargs: Any) -> None:
        """Log method call with parameters."""
        self.logger.debug(f"Method called: {method_name}", method=method_name, parameters=kwargs)

    def log_performance(self, operation: str, duration_ms: float, **context: Any) -> None:
        """Log performance metrics."""
        self.logger.info(
            f"Performance: {operation}",
            operation=operation,
            duration_ms=duration_ms,
            **context,
        )

    def log_error(self, error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
        """Log error with context."""
        self.logger.error(
            f"Error occurred: {error}",
            error_type=type(error).__name__,
            error_message=str(error),
            context=context or {},
        )


# Performance monitoring decorator
def log_performance(operation_name: str) -> Any:
    """Decorator to log performance metrics for functions."""

    def decorator(func: Any) -> Any:
        if asyncio.iscoroutinefunction(func):
            return _create_async_wrapper(func, operation_name)
        return _create_sync_wrapper(func, operation_name)

    return decorator


def _create_async_wrapper(func: Any, operation_name: str) -> Any:
    """Create async performance wrapper."""

    @functools.wraps(func)
    async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
        start_time = time.perf_counter()
        logger = get_logger(func.__module__)

        try:
            result = await func(*args, **kwargs)
            _log_performance_success(logger, operation_name, start_time, func.__name__)
            return result
        except Exception as e:
            _log_performance_error(logger, operation_name, start_time, func.__name__, e)
            raise

    return async_wrapper


def _create_sync_wrapper(func: Any, operation_name: str) -> Any:
    """Create sync performance wrapper."""

    @functools.wraps(func)
    def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
        start_time = time.perf_counter()
        logger = get_logger(func.__module__)

        try:
            result = func(*args, **kwargs)
            _log_performance_success(logger, operation_name, start_time, func.__name__)
            return result
        except Exception as e:
            _log_performance_error(logger, operation_name, start_time, func.__name__, e)
            raise

    return sync_wrapper


def _log_performance_success(
    logger: Any, operation_name: str, start_time: float, func_name: str
) -> None:
    """Log successful performance metrics."""
    duration_ms = (time.perf_counter() - start_time) * 1000
    logger.info(
        f"Performance: {operation_name}",
        operation=operation_name,
        duration_ms=round(duration_ms, 2),
        function=func_name,
        success=True,
    )


def _log_performance_error(
    logger: Any, operation_name: str, start_time: float, func_name: str, error: Exception
) -> None:
    """Log failed performance metrics."""
    duration_ms = (time.perf_counter() - start_time) * 1000
    logger.error(
        f"Performance: {operation_name} failed",
        operation=operation_name,
        duration_ms=round(duration_ms, 2),
        function=func_name,
        success=False,
        error=str(error),
    )
