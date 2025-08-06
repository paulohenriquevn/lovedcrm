"""User Preferences API endpoints."""
import logging
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.deps import get_current_active_user, get_current_organization, get_db
from ..models.organization import Organization
from ..models.user import User
from ..schemas.user_preferences import (
    QuietHoursSettings,
    UserPreferencesQuickUpdate,
    UserPreferencesResponse,
    UserPreferencesStatistics,
    UserPreferencesUpdate,
    UserPreferencesUpdateDisplay,
    UserPreferencesUpdateNotifications,
    UserPreferencesUpdatePrivacy,
)
from ..services.user_preferences_service import UserPreferencesService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users/me/preferences", tags=["user-preferences"])


@router.get("", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get current user's preferences for the organization."""
    service = UserPreferencesService(db)
    
    try:
        return service.get_user_preferences(current_user, organization)
    except Exception as e:
        logger.error(
            "Failed to get user preferences",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve preferences"
        )


@router.put("", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences_data: UserPreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update user preferences."""
    service = UserPreferencesService(db)
    
    try:
        return service.update_preferences(current_user, organization, preferences_data)
    except Exception as e:
        logger.error(
            "Failed to update user preferences",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences"
        )


@router.patch("/notifications", response_model=UserPreferencesResponse)
async def update_notification_preferences(
    notification_data: UserPreferencesUpdateNotifications,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update only notification preferences."""
    service = UserPreferencesService(db)
    
    try:
        # Convert to dict and exclude None values
        notification_dict = notification_data.model_dump(exclude_none=True)
        return service.update_notifications(current_user, organization, notification_dict)
    except Exception as e:
        logger.error(
            "Failed to update notification preferences",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences"
        )


@router.patch("/display", response_model=UserPreferencesResponse)
async def update_display_preferences(
    display_data: UserPreferencesUpdateDisplay,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update only display preferences."""
    service = UserPreferencesService(db)
    
    try:
        # Convert to dict and exclude None values
        display_dict = display_data.model_dump(exclude_none=True)
        return service.update_display_preferences(current_user, organization, display_dict)
    except Exception as e:
        logger.error(
            "Failed to update display preferences",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update display preferences"
        )


@router.patch("/privacy", response_model=UserPreferencesResponse)
async def update_privacy_preferences(
    privacy_data: UserPreferencesUpdatePrivacy,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update only privacy preferences."""
    service = UserPreferencesService(db)
    
    try:
        # Convert to dict and exclude None values
        privacy_dict = privacy_data.model_dump(exclude_none=True)
        return service.update_privacy_settings(current_user, organization, privacy_dict)
    except Exception as e:
        logger.error(
            "Failed to update privacy preferences",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update privacy preferences"
        )


@router.patch("/quiet-hours", response_model=UserPreferencesResponse)
async def update_quiet_hours(
    quiet_hours_data: QuietHoursSettings,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Update quiet hours settings."""
    service = UserPreferencesService(db)
    
    try:
        quiet_hours_dict = quiet_hours_data.model_dump()
        return service.update_quiet_hours(current_user, organization, quiet_hours_dict)
    except Exception as e:
        logger.error(
            "Failed to update quiet hours",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update quiet hours"
        )


@router.patch("/quick", response_model=UserPreferencesResponse)
async def quick_update_preferences(
    quick_data: UserPreferencesQuickUpdate,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Quick update for common preferences (theme, language, notifications)."""
    service = UserPreferencesService(db)
    
    try:
        # Convert to dict and exclude None values
        update_dict = quick_data.model_dump(exclude_none=True)
        return service.quick_update(current_user, organization, update_dict)
    except Exception as e:
        logger.error(
            "Failed to quick update preferences",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences"
        )


@router.post("/reset", response_model=UserPreferencesResponse)
async def reset_preferences_to_defaults(
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Reset user preferences to default values."""
    service = UserPreferencesService(db)
    
    try:
        return service.reset_to_defaults(current_user, organization)
    except Exception as e:
        logger.error(
            "Failed to reset preferences",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset preferences"
        )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_preferences(
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Delete user preferences (will use defaults afterward)."""
    service = UserPreferencesService(db)
    
    try:
        success = service.delete_preferences(current_user, organization)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User preferences not found"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to delete preferences",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete preferences"
        )


@router.get("/statistics", response_model=UserPreferencesStatistics)
async def get_preferences_statistics(
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    """Get preferences statistics for the organization (admin only)."""
    # Check if user is admin or owner
    from ..models.organization import OrganizationMember
    
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == organization.id
    ).first()
    
    if not member or member.role not in ["admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    service = UserPreferencesService(db)
    
    try:
        return service.get_organization_statistics(organization)
    except Exception as e:
        logger.error(
            "Failed to get preferences statistics",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        )


@router.get("/effective-settings")
async def get_effective_settings(
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Get effective language and timezone settings with fallbacks."""
    service = UserPreferencesService(db)
    
    try:
        return service.get_effective_settings(current_user, organization)
    except Exception as e:
        logger.error(
            "Failed to get effective settings",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve effective settings"
        )


# Admin endpoints for bulk operations
@router.post("/admin/bulk-notification-update")
async def bulk_update_notification_preference(
    notification_type: str,
    enabled: bool,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
) -> Dict[str, int]:
    """Bulk update notification preference for all users (admin only)."""
    # Check if user is admin or owner
    from ..models.organization import OrganizationMember
    
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == organization.id
    ).first()
    
    if not member or member.role not in ["admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Validate notification type
    valid_types = [
        "email_notifications", "push_notifications", "sms_notifications",
        "email_marketing", "email_product_updates", "email_security_alerts",
        "email_billing_alerts", "email_team_activity"
    ]
    
    if notification_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid notification type. Must be one of: {', '.join(valid_types)}"
        )
    
    service = UserPreferencesService(db)
    
    try:
        updated_count = service.bulk_notification_update(
            organization, notification_type, enabled
        )
        return {"updated_count": updated_count}
    except Exception as e:
        logger.error(
            "Failed to bulk update notification preference",
            extra={
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "notification_type": notification_type,
                "enabled": enabled,
                "error": str(e)
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences"
        )
