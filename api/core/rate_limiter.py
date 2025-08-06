"""Universal rate limiting - KISS principle."""
import logging
from typing import Optional

from slowapi import Limiter
from slowapi.util import get_remote_address

from .config import settings

logger = logging.getLogger(__name__)

# Universal limiter - works everywhere
limiter: Optional[Limiter] = None

try:
    limiter = Limiter(
        key_func=get_remote_address,
        storage_uri=settings.REDIS_URL
        if hasattr(settings, "REDIS_URL") and settings.REDIS_URL
        else None,
        default_limits=["100/minute"],
    )
    logger.info("✅ Rate limiter initialized")
except Exception as e:
    logger.warning(f"⚠️  Rate limiter disabled: {e}")
    limiter = None


def get_limiter() -> Optional[Limiter]:
    """Get the configured rate limiter instance."""
    return limiter
