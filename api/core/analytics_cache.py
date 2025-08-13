"""Analytics Caching System.

Redis-based caching for analytics queries with intelligent TTL,
cache invalidation strategies, and performance optimization.

Integration Points:
- Redis connection management
- Intelligent cache TTL based on data freshness
- Organization-scoped cache keys for multi-tenancy
- Cache warming and precomputation strategies
"""

import hashlib
import json
import logging
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional
from uuid import UUID

import redis

logger = logging.getLogger(__name__)


class AnalyticsCache:
    """Redis-based caching system for analytics data."""

    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        """Initialize analytics cache with Redis connection."""
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            # Test connection
            self.redis_client.ping()
            logger.info("Analytics cache connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None

    def _generate_cache_key(self, operation: str, organization_id: UUID, **params) -> str:
        """Generate organization-scoped cache key with parameter hashing."""
        # Sort parameters for consistent key generation
        param_string = json.dumps(params, sort_keys=True, default=str)
        param_hash = hashlib.md5(param_string.encode(), usedforsecurity=False).hexdigest()[:12]

        return f"analytics:{operation}:org:{organization_id}:params:{param_hash}"

    def _calculate_intelligent_ttl(self, operation: str, data_freshness_hours: int = 1) -> int:
        """Calculate intelligent TTL based on operation type and data freshness needs."""
        # Base TTL strategies by operation type
        ttl_strategies = {
            "executive_dashboard": 300,  # 5 minutes - frequent updates needed
            "summary_metrics": 120,  # 2 minutes - real-time feel
            "conversion_funnel": 600,  # 10 minutes - more stable data
            "source_performance": 900,  # 15 minutes - historical analysis
            "behavior_insights": 1800,  # 30 minutes - behavioral patterns change slowly
            "stage_timing": 1800,  # 30 minutes - timing analysis is stable
            "performance_alerts": 180,  # 3 minutes - alerts need quick updates
            "report_data": 3600,  # 1 hour - reports are point-in-time
        }

        base_ttl = ttl_strategies.get(operation, 300)  # Default 5 minutes

        # Adjust TTL based on data freshness requirements
        freshness_multiplier = min(max(data_freshness_hours / 4, 0.5), 2.0)

        return int(base_ttl * freshness_multiplier)

    async def get(
        self, operation: str, organization_id: UUID, **params
    ) -> Optional[Dict[str, Any]]:
        """Get cached analytics data with organization isolation."""
        if not self.redis_client:
            return None

        try:
            cache_key = self._generate_cache_key(operation, organization_id, **params)
            cached_data = self.redis_client.get(cache_key)

            if cached_data:
                logger.debug(
                    "Cache hit for analytics operation",
                    extra={
                        "operation": operation,
                        "organization_id": str(organization_id),
                        "cache_key": cache_key,
                    },
                )

                return json.loads(cached_data)

            logger.debug(
                "Cache miss for analytics operation",
                extra={
                    "operation": operation,
                    "organization_id": str(organization_id),
                    "cache_key": cache_key,
                },
            )

            return None

        except Exception as e:
            logger.warning(
                "Cache get operation failed",
                extra={
                    "operation": operation,
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
            )
            return None

    async def set(
        self,
        operation: str,
        organization_id: UUID,
        data: Dict[str, Any],
        ttl_override: Optional[int] = None,
        **params,
    ) -> bool:
        """Cache analytics data with intelligent TTL."""
        if not self.redis_client:
            return False

        try:
            cache_key = self._generate_cache_key(operation, organization_id, **params)
            ttl = ttl_override or self._calculate_intelligent_ttl(operation)

            # Add cache metadata to data
            cached_data = {
                **data,
                "_cache_metadata": {
                    "cached_at": datetime.now().isoformat(),
                    "operation": operation,
                    "organization_id": str(organization_id),
                    "ttl": ttl,
                },
            }

            self.redis_client.setex(cache_key, ttl, json.dumps(cached_data, default=str))

            logger.debug(
                "Data cached successfully",
                extra={
                    "operation": operation,
                    "organization_id": str(organization_id),
                    "cache_key": cache_key,
                    "ttl": ttl,
                },
            )

            return True

        except Exception as e:
            logger.warning(
                "Cache set operation failed",
                extra={
                    "operation": operation,
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
            )
            return False

    async def invalidate(self, operation: str, organization_id: UUID, **params) -> bool:
        """Invalidate specific cached data."""
        if not self.redis_client:
            return False

        try:
            cache_key = self._generate_cache_key(operation, organization_id, **params)
            result = self.redis_client.delete(cache_key)

            logger.info(
                "Cache invalidation completed",
                extra={
                    "operation": operation,
                    "organization_id": str(organization_id),
                    "cache_key": cache_key,
                    "keys_deleted": result,
                },
            )

            return result > 0

        except Exception as e:
            logger.warning(
                "Cache invalidation failed",
                extra={
                    "operation": operation,
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
            )
            return False

    async def invalidate_organization_cache(self, organization_id: UUID) -> int:
        """Invalidate all cached data for an organization."""
        if not self.redis_client:
            return 0

        try:
            # Find all keys for the organization
            pattern = f"analytics:*:org:{organization_id}:*"
            keys = self.redis_client.keys(pattern)

            if keys:
                deleted_count = self.redis_client.delete(*keys)

                logger.info(
                    "Organization cache invalidated",
                    extra={
                        "organization_id": str(organization_id),
                        "keys_deleted": deleted_count,
                        "pattern": pattern,
                    },
                )

                return deleted_count

            return 0

        except Exception as e:
            logger.warning(
                "Organization cache invalidation failed",
                extra={
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
            )
            return 0

    async def warm_cache(
        self,
        organization_id: UUID,
        operations: List[str],
        background_task_func: Optional[Callable] = None,
    ) -> Dict[str, bool]:
        """Pre-warm cache for common operations."""
        if not self.redis_client:
            return {}

        warming_results = {}

        for operation in operations:
            try:
                # Check if cache already exists
                cache_key = self._generate_cache_key(operation, organization_id)
                if self.redis_client.exists(cache_key):
                    warming_results[operation] = True
                    continue

                # Schedule background cache warming if function provided
                if background_task_func:
                    # This would trigger background computation
                    logger.info(
                        "Scheduling cache warming",
                        extra={
                            "operation": operation,
                            "organization_id": str(organization_id),
                        },
                    )
                    warming_results[operation] = True
                else:
                    warming_results[operation] = False

            except Exception as e:
                logger.warning(
                    "Cache warming failed for operation",
                    extra={
                        "operation": operation,
                        "organization_id": str(organization_id),
                        "error": str(e),
                    },
                )
                warming_results[operation] = False

        return warming_results

    async def get_cache_stats(self, organization_id: Optional[UUID] = None) -> Dict[str, Any]:
        """Get cache statistics for monitoring."""
        if not self.redis_client:
            return {"status": "unavailable", "error": "Redis client not connected"}

        try:
            # Get Redis info
            redis_info = self.redis_client.info()

            stats = {
                "redis_status": "connected",
                "memory_usage_mb": round(redis_info.get("used_memory", 0) / 1024 / 1024, 2),
                "connected_clients": redis_info.get("connected_clients", 0),
                "total_commands_processed": redis_info.get("total_commands_processed", 0),
                "keyspace_hits": redis_info.get("keyspace_hits", 0),
                "keyspace_misses": redis_info.get("keyspace_misses", 0),
            }

            # Calculate hit rate
            hits = stats["keyspace_hits"]
            misses = stats["keyspace_misses"]
            total_requests = hits + misses

            if total_requests > 0:
                stats["hit_rate_percentage"] = round((hits / total_requests) * 100, 2)
            else:
                stats["hit_rate_percentage"] = 0.0

            # Get organization-specific stats if requested
            if organization_id:
                pattern = f"analytics:*:org:{organization_id}:*"
                org_keys = self.redis_client.keys(pattern)
                stats["organization_cached_keys"] = len(org_keys)
                stats["organization_id"] = str(organization_id)

                # Get cache key distribution
                operation_counts: Dict[str, int] = {}
                for key in org_keys:
                    parts = key.split(":")
                    if len(parts) >= 2:
                        operation = parts[1]
                        operation_counts[operation] = operation_counts.get(operation, 0) + 1

                stats["operation_distribution"] = operation_counts

            stats["collected_at"] = datetime.now().isoformat()

            return stats

        except Exception as e:
            return {"status": "error", "error": str(e), "collected_at": datetime.now().isoformat()}


class CachedAnalyticsService:
    """Wrapper service that adds caching to analytics operations."""

    def __init__(self, cache: AnalyticsCache):
        """Initialize cached analytics service."""
        self.cache = cache

    def _extract_organization_id(self, args, kwargs) -> Optional[UUID]:
        """Extract organization_id from function arguments."""
        # Try to find organization_id in arguments
        for arg in args:
            if hasattr(arg, "id") and isinstance(arg.id, UUID):
                return arg.id

        # Try to find organization_id in kwargs
        return kwargs.get("organization_id")

    def _prepare_cache_params(self, kwargs) -> Dict[str, Any]:
        """Prepare cache parameters by removing organization_id."""
        return {k: v for k, v in kwargs.items() if k != "organization_id"}

    async def _get_cached_result(
        self, operation_name: str, organization_id: UUID, cache_params: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Retrieve and process cached result."""
        cached_result = await self.cache.get(operation_name, organization_id, **cache_params)

        if cached_result and "_cache_metadata" in cached_result:
            del cached_result["_cache_metadata"]

        return cached_result

    async def _cache_result(
        self,
        operation_name: str,
        organization_id: UUID,
        result: Dict[str, Any],
        cache_ttl: Optional[int],
        cache_params: Dict[str, Any],
    ) -> None:
        """Cache operation result if valid."""
        if result:
            await self.cache.set(
                operation_name,
                organization_id,
                result,
                ttl_override=cache_ttl,
                **cache_params,
            )

    def cached_operation(
        self, operation_name: str, cache_ttl: Optional[int] = None, force_refresh: bool = False
    ):
        """Decorator to add caching to analytics operations."""

        def decorator(func):
            async def wrapper(*args, **kwargs):
                organization_id = self._extract_organization_id(args, kwargs)

                if not organization_id:
                    logger.warning(
                        "Cannot cache operation without organization_id",
                        extra={"operation": operation_name},
                    )
                    return await func(*args, **kwargs)

                cache_params = self._prepare_cache_params(kwargs)

                if not force_refresh:
                    cached_result = await self._get_cached_result(
                        operation_name, organization_id, cache_params
                    )
                    if cached_result:
                        return cached_result

                # Execute operation if not cached
                result = await func(*args, **kwargs)

                # Cache the result
                await self._cache_result(
                    operation_name, organization_id, result, cache_ttl, cache_params
                )

                return result

            return wrapper

        return decorator


# Global cache instance
analytics_cache = AnalyticsCache()
cached_analytics = CachedAnalyticsService(analytics_cache)


# Cache invalidation triggers


async def invalidate_analytics_cache_on_lead_change(
    organization_id: UUID, lead_id: UUID, change_type: str
) -> None:
    """Invalidate relevant cache when leads are modified."""
    try:
        # Determine which analytics operations are affected
        operations_to_invalidate = [
            "executive_dashboard",
            "summary_metrics",
            "conversion_funnel",
            "source_performance",
        ]

        # For stage changes, also invalidate timing analysis
        if change_type in ["stage_change", "status_change"]:
            operations_to_invalidate.extend(["stage_timing", "behavior_insights"])

        # Invalidate affected caches
        for operation in operations_to_invalidate:
            await analytics_cache.invalidate(operation, organization_id)

        logger.info(
            "Analytics cache invalidated due to lead change",
            extra={
                "organization_id": str(organization_id),
                "lead_id": str(lead_id),
                "change_type": change_type,
                "operations_invalidated": len(operations_to_invalidate),
            },
        )

    except Exception as e:
        logger.warning(
            "Failed to invalidate analytics cache",
            extra={
                "organization_id": str(organization_id),
                "lead_id": str(lead_id),
                "error": str(e),
            },
        )


async def schedule_cache_warming(organization_id: UUID) -> None:
    """Schedule cache warming for common analytics operations."""
    try:
        common_operations = ["executive_dashboard", "summary_metrics", "conversion_funnel"]

        warming_results = await analytics_cache.warm_cache(organization_id, common_operations)

        logger.info(
            "Cache warming scheduled",
            extra={
                "organization_id": str(organization_id),
                "operations": common_operations,
                "results": warming_results,
            },
        )

    except Exception as e:
        logger.warning(
            "Cache warming failed", extra={"organization_id": str(organization_id), "error": str(e)}
        )
