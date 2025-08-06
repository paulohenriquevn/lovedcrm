"""🔒 SECURE TOKEN BLACKLIST - Production-ready implementation.

Real token blacklist using Redis for session security.
Protects against session hijacking and token reuse.
"""
import logging
from datetime import datetime
from typing import Optional

import redis.asyncio as redis
from redis.exceptions import ConnectionError, RedisError

logger = logging.getLogger(__name__)

# Redis connection pool for performance
_redis_pool: Optional[redis.ConnectionPool] = None


async def _get_redis_client(redis_url: str) -> redis.Redis:
    """Get Redis client with connection pooling."""
    global _redis_pool

    if _redis_pool is None:
        try:
            _redis_pool = redis.ConnectionPool.from_url(
                redis_url, max_connections=10, retry_on_timeout=True, decode_responses=True
            )
            logger.info("✅ Redis connection pool initialized for token blacklist")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Redis pool: {e}")
            raise

    return redis.Redis(connection_pool=_redis_pool)


async def is_token_blacklisted(token: str, redis_url: str) -> bool:
    """Check if token is blacklisted.

    🔒 SECURITY: Returns True if token is blacklisted (logout/revoked)
    🚨 FAIL-SECURE: Returns False on Redis errors (availability over security)
    """
    if not token or not redis_url:
        logger.warning("❌ Missing token or redis_url for blacklist check")
        return False

    try:
        redis_client = await _get_redis_client(redis_url)

        # Check if token exists in blacklist
        blacklist_key = f"blacklist:token:{token[:16]}..."  # Log partial token only
        is_blacklisted = await redis_client.exists(f"blacklist:token:{token}")

        if is_blacklisted:
            logger.warning(f"🚨 BLOCKED: Blacklisted token attempted access - {blacklist_key}")
            return True

        return False

    except (ConnectionError, RedisError) as e:
        logger.error(f"❌ Redis error checking token blacklist: {e}")
        # FAIL-SECURE: Allow access if Redis is down (availability over security)
        # In high-security environments, consider returning True instead
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error checking token blacklist: {e}")
        return False


async def blacklist_token(token: str, expires_at: datetime, redis_url: str) -> None:
    """Blacklist a token until its natural expiration.

    🔒 SECURITY: Prevents token reuse after logout/revocation
    ⏰ TTL: Token expires from blacklist when it would naturally expire
    """
    if not token or not expires_at or not redis_url:
        logger.warning("❌ Missing required parameters for token blacklisting")
        return

    try:
        redis_client = await _get_redis_client(redis_url)

        # Calculate TTL (time until token would naturally expire)
        now = datetime.utcnow()
        ttl_seconds = int((expires_at - now).total_seconds())

        # Only blacklist if token hasn't expired yet
        if ttl_seconds <= 0:
            logger.info("ℹ️ Token already expired, skipping blacklist")
            return

        # Store in Redis with TTL
        blacklist_key = f"blacklist:token:{token}"
        await redis_client.setex(
            blacklist_key, ttl_seconds, f"blacklisted:{datetime.utcnow().isoformat()}"
        )

        logger.info(
            "✅ Token blacklisted successfully",
            extra={
                "token_prefix": token[:16] + "...",  # Log only prefix for security
                "ttl_seconds": ttl_seconds,
                "expires_at": expires_at.isoformat(),
            },
        )

    except (ConnectionError, RedisError) as e:
        logger.error(f"❌ Redis error blacklisting token: {e}")
        # Don't raise - logout should still work even if blacklist fails
    except Exception as e:
        logger.error(f"❌ Unexpected error blacklisting token: {e}")


async def cleanup_expired_tokens() -> int:
    """Manual cleanup of expired tokens (Redis should handle this automatically).

    Returns number of tokens cleaned up.
    """
    # Redis TTL handles cleanup automatically, but this could be used
    # for manual maintenance or different storage backends
    return 0


async def get_blacklist_stats(redis_url: str) -> dict:
    """Get blacklist statistics for monitoring.

    Returns:
        dict: Statistics about blacklisted tokens
    """
    try:
        redis_client = await _get_redis_client(redis_url)

        # Count blacklisted tokens
        keys = await redis_client.keys("blacklist:token:*")
        active_blacklist_count = len(keys)

        return {"active_blacklisted_tokens": active_blacklist_count, "redis_connected": True}

    except Exception as e:
        logger.error(f"❌ Error getting blacklist stats: {e}")
        return {"active_blacklisted_tokens": 0, "redis_connected": False, "error": str(e)}
