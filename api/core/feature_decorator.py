"""Feature blocking decorator for endpoints.

Simple decorator that blocks access based on organization's plan features.
"""
import logging
from functools import wraps
from typing import Callable

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..services.feature_service import get_feature_service
from .database import get_db
from .deps import get_current_organization

logger = logging.getLogger(__name__)


def _extract_dependencies_from_kwargs(kwargs, func_name):
    """Extract db and organization from function kwargs."""
    db = None
    organization = None

    for key, value in kwargs.items():
        if key == "db" and hasattr(value, "query"):
            db = value
        elif key == "organization" and hasattr(value, "id"):
            organization = value

    if not db or not organization:
        logger.error(
            f"Feature decorator on {func_name} requires 'db: Session = Depends(get_db)' and 'organization: Organization = Depends(get_current_organization)' parameters"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error: feature validation misconfigured",
        )

    return db, organization


def _check_feature_access(feature_service, organization, feature_name, func_name):
    """Check if organization has access to the required feature."""
    if not feature_service.check_organization_has_feature(organization.id, feature_name):
        logger.warning(
            f"Feature access denied: org={organization.id} ({organization.name}), feature={feature_name}, endpoint={func_name}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This feature '{feature_name}' is not available in your current plan. Please upgrade to access this functionality.",
        )

    logger.debug(
        f"Feature access granted: org={organization.id}, feature={feature_name}, endpoint={func_name}"
    )


def requires_feature(feature_name: str):
    """Decorator that blocks endpoint access if organization doesn't have the required feature.

    Usage:
        @requires_feature("advanced_reports")
        async def generate_advanced_report(
            organization: Organization = Depends(get_current_organization),
            db: Session = Depends(get_db)
        ):
            return {"report": "data"}

    Args:
        feature_name: Name of the required feature

    Raises:
        HTTPException: 403 Forbidden if organization doesn't have the feature
    """

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                # Extract dependencies
                db, organization = _extract_dependencies_from_kwargs(kwargs, func.__name__)

                # Check feature access
                feature_service = get_feature_service(db)
                _check_feature_access(feature_service, organization, feature_name, func.__name__)

                # Execute original function
                return await func(*args, **kwargs)

            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Unexpected error in feature check for {func.__name__}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error during feature validation",
                )

        return wrapper

    return decorator


# Alternative dependency-based approach (more FastAPI-friendly)
def requires_feature_dependency(feature_name: str):
    """Dependency that validates feature access.

    Usage:
        async def endpoint(
            _: None = Depends(RequiresFeature("advanced_reports")),
            organization: Organization = Depends(get_current_organization),
            db: Session = Depends(get_db)
        ):
            return {"report": "data"}

    This approach is more explicit and follows FastAPI dependency patterns better.
    """

    def check_feature(
        organization=Depends(get_current_organization), db: Session = Depends(get_db)
    ):
        feature_service = get_feature_service(db)

        try:
            if not feature_service.check_organization_has_feature(organization.id, feature_name):
                logger.warning(
                    f"Feature access denied: org={organization.id} ({organization.name}), feature={feature_name}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Feature '{feature_name}' is not available in your current plan. Please upgrade to unlock this functionality.",
                )

            logger.debug(f"Feature access granted: org={organization.id}, feature={feature_name}")
            return None

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in RequiresFeature dependency: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error during feature validation",
            )

    return check_feature


# Convenience function to check multiple features
def requires_any_feature(*feature_names: str):
    """Decorator that allows access if organization has ANY of the specified features.

    Usage:
        @requires_any_feature("advanced_reports", "premium_analytics")
        async def generate_report():
            return {"report": "data"}
    """

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            db = None
            organization = None

            for key, value in kwargs.items():
                if key == "db" and hasattr(value, "query"):
                    db = value
                elif key == "organization" and hasattr(value, "id"):
                    organization = value

            if not db or not organization:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error: feature validation misconfigured",
                )

            feature_service = get_feature_service(db)

            # Check if organization has any of the required features
            has_any_feature = False
            for feature_name in feature_names:
                if feature_service.check_organization_has_feature(organization.id, feature_name):
                    has_any_feature = True
                    break

            if not has_any_feature:
                logger.warning(
                    f"Feature access denied: org={organization.id}, required_any_of={feature_names}, endpoint={func.__name__}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"This functionality requires one of these features: {', '.join(feature_names)}. Please upgrade your plan.",
                )

            return await func(*args, **kwargs)

        return wrapper

    return decorator


# Helper function for manual feature checking
async def check_feature_access(feature_name: str, organization_id, db: Session) -> bool:
    """Helper function to manually check feature access.

    Useful for conditional logic within endpoints.
    """
    try:
        feature_service = get_feature_service(db)
        return feature_service.check_organization_has_feature(organization_id, feature_name)
    except Exception as e:
        logger.error(f"Error checking feature access: {e}")
        return False
