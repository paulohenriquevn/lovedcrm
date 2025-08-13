"""Provider Management API Endpoints.

Multi-provider management endpoints for hot-swap capability and cost optimization.
Follows existing project patterns and multi-tenancy requirements.
"""

from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.core.deps import get_current_organization, get_db
from api.models.crm_organization_integration import IntegrationProvider
from api.models.organization import Organization
from api.services.provider_service import ProviderService

# Create router with consistent project patterns
router = APIRouter(prefix="/providers", tags=["providers"])


def _validate_switch_request(
    request_data: Dict[str, Any]
) -> tuple[IntegrationProvider, UUID, bool]:
    """Validate switch request parameters.

    Args:
        request_data: Switch request data

    Returns:
        Tuple of (provider_type, new_provider_id, force_switch)

    Raises:
        HTTPException: If validation fails
    """
    provider_type_str = request_data.get("provider_type")
    new_provider_id_str = request_data.get("new_provider_id")
    force_switch = request_data.get("force", False)

    if not provider_type_str or not new_provider_id_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="provider_type and new_provider_id are required",
        )

    try:
        provider_type = IntegrationProvider(provider_type_str)
        new_provider_id = UUID(new_provider_id_str)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid parameter format: {str(e)}",
        )

    return provider_type, new_provider_id, force_switch


def _create_success_response(new_primary: Any) -> Dict[str, Any]:
    """Create successful switch response.

    Args:
        new_primary: New primary provider instance

    Returns:
        Success response dict
    """
    return {
        "success": True,
        "switched": True,
        "message": f"Successfully switched to {new_primary.provider_name}",
        "new_primary": {
            "id": str(new_primary.id),
            "name": new_primary.provider_name,
            "provider_type": new_primary.provider.value,
            "status": new_primary.status.value,
        },
    }


def _create_failure_response(message: str = "Switch operation failed") -> Dict[str, Any]:
    """Create failure response.

    Args:
        message: Failure message

    Returns:
        Failure response dict
    """
    return {
        "success": False,
        "switched": False,
        "message": message,
    }


@router.get("/")
async def list_providers(
    provider_type: Optional[IntegrationProvider] = None,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """List all providers for the organization.

    Optionally filter by provider type. Returns summary with cost analysis.

    Args:
        provider_type: Optional provider type filter
        organization: Current organization from middleware
        db: Database session dependency

    Returns:
        Dict with providers data and cost analysis
    """
    service = ProviderService(db)

    try:
        if provider_type:
            # Get providers for specific type
            providers = await service.get_all_providers(organization.id, provider_type)  # type: ignore[arg-type]
            cost_comparison = await service.get_cost_comparison(organization.id, provider_type)  # type: ignore[arg-type]

            return {
                "provider_type": provider_type.value,
                "providers": [
                    {
                        "id": str(p.id),
                        "name": p.provider_name,
                        "provider_type": p.provider.value,
                        "status": p.status.value,
                        "is_primary": p.is_primary,
                        "priority": p.priority,
                        "created_at": p.created_at.isoformat(),
                        "updated_at": p.updated_at.isoformat(),
                        "last_sync_at": p.last_sync_at.isoformat() if p.last_sync_at else None,
                        "metadata": p.integration_metadata,
                    }
                    for p in providers
                ],
                "cost_comparison": cost_comparison,
            }
        else:
            # Get all providers summary
            summary = await service.get_organization_providers_summary(organization.id)  # type: ignore[arg-type]
            return summary

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve providers: {str(e)}",
        )


@router.get("/primary/{provider_type}")
async def get_primary_provider(
    provider_type: IntegrationProvider,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get the primary provider for a specific type.

    Args:
        provider_type: Provider type enum
        organization: Current organization from middleware
        db: Database session dependency

    Returns:
        Primary provider data or 404 if not found
    """
    service = ProviderService(db)

    try:
        provider = await service.get_primary_provider(organization.id, provider_type)  # type: ignore[arg-type]

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No primary {provider_type.value} provider found",
            )

        return {
            "id": str(provider.id),
            "name": provider.provider_name,
            "provider_type": provider.provider.value,
            "status": provider.status.value,
            "is_primary": provider.is_primary,
            "priority": provider.priority,
            "created_at": provider.created_at.isoformat(),
            "updated_at": provider.updated_at.isoformat(),
            "last_sync_at": provider.last_sync_at.isoformat() if provider.last_sync_at else None,
            "metadata": provider.integration_metadata,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get primary provider: {str(e)}",
        )


@router.post("/switch")
async def switch_primary_provider(
    request_data: Dict[str, Any],
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Switch primary provider with atomic hot-swap.

    Performs zero-downtime switch between providers of the same type.

    Request Body:
    {
        "provider_type": "whatsapp",
        "new_provider_id": "uuid-string",
        "force": false  // Skip safety validation if true
    }

    Args:
        request_data: Switch request data
        organization: Current organization from middleware
        db: Database session dependency

    Returns:
        Switch operation result
    """
    service = ProviderService(db)

    try:
        # Validate request data
        provider_type, new_provider_id, force_switch = _validate_switch_request(request_data)

        # Validate switch safety unless forced
        if not force_switch:
            validation = await service.validate_provider_switch_safety(
                organization.id, provider_type, new_provider_id  # type: ignore[arg-type]
            )

            if not validation["safe_to_switch"]:
                return {
                    "success": False,
                    "switched": False,
                    "validation": validation,
                    "message": "Switch blocked due to safety concerns",
                }

        # Perform atomic switch
        success = await service.switch_primary_provider(
            organization.id, provider_type, new_provider_id  # type: ignore[arg-type]
        )

        if success:
            # Get updated primary provider info
            new_primary = await service.get_primary_provider(organization.id, provider_type)  # type: ignore[arg-type]
            return _create_success_response(new_primary)
        else:
            return _create_failure_response()

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Provider switch failed: {str(e)}",
        )


@router.get("/cost-comparison/{provider_type}")
async def get_cost_comparison(
    provider_type: IntegrationProvider,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get cost comparison analysis for provider type.

    Args:
        provider_type: Provider type enum
        organization: Current organization from middleware
        db: Database session dependency

    Returns:
        Cost comparison data with recommendations
    """
    service = ProviderService(db)

    try:
        cost_comparison = await service.get_cost_comparison(organization.id, provider_type)  # type: ignore[arg-type]
        return cost_comparison

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cost comparison: {str(e)}",
        )


@router.post("/validate-switch")
async def validate_provider_switch(
    request_data: Dict[str, Any],
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Validate if provider switch is safe to perform.

    Request Body:
    {
        "provider_type": "whatsapp",
        "new_provider_id": "uuid-string"
    }

    Args:
        request_data: Validation request data
        organization: Current organization from middleware
        db: Database session dependency

    Returns:
        Validation results with safety analysis
    """
    service = ProviderService(db)

    try:
        # Validate request data
        provider_type_str = request_data.get("provider_type")
        new_provider_id_str = request_data.get("new_provider_id")

        if not provider_type_str or not new_provider_id_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="provider_type and new_provider_id are required",
            )

        try:
            provider_type = IntegrationProvider(provider_type_str)
            new_provider_id = UUID(new_provider_id_str)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid parameter format: {str(e)}",
            )

        # Perform validation
        validation = await service.validate_provider_switch_safety(
            organization.id, provider_type, new_provider_id  # type: ignore[arg-type]
        )

        return validation

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Validation failed: {str(e)}"
        )


@router.get("/status/{provider_type}")
async def get_provider_status(
    provider_type: IntegrationProvider,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get current provider status and health metrics.

    Args:
        provider_type: Provider type enum
        organization: Current organization from middleware
        db: Database session dependency

    Returns:
        Provider status and health metrics
    """
    service = ProviderService(db)

    try:
        providers = await service.get_all_providers(organization.id, provider_type)  # type: ignore[arg-type]
        primary = await service.get_primary_provider(organization.id, provider_type)  # type: ignore[arg-type]

        if not providers:
            return {
                "provider_type": provider_type.value,
                "configured": False,
                "total_providers": 0,
                "primary_provider": None,
                "health_status": "not_configured",
            }

        # Calculate health metrics
        active_count = len([p for p in providers if p.is_active])
        error_count = len([p for p in providers if p.has_error])

        health_status = "healthy"
        if not primary:
            health_status = "no_primary"
        elif primary.has_error:
            health_status = "primary_error"
        elif error_count > 0:
            health_status = "partial_errors"
        elif active_count == 0:
            health_status = "all_inactive"

        return {
            "provider_type": provider_type.value,
            "configured": True,
            "total_providers": len(providers),
            "active_providers": active_count,
            "error_providers": error_count,
            "primary_provider": {
                "id": str(primary.id),
                "name": primary.provider_name,
                "status": primary.status.value,
            }
            if primary
            else None,
            "health_status": health_status,
            "last_sync_at": max(
                (p.last_sync_at for p in providers if p.last_sync_at), default=None
            ),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get provider status: {str(e)}",
        )
