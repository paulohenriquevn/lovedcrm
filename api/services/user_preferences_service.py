"""User Preferences service for business logic operations.

This module provides business logic for user preferences management,
including CRUD operations and organization-scoped preference handling.
"""
import logging
from datetime import datetime
from typing import Dict, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models.organization import Organization
from ..models.user import User
from ..models.user_preferences import UserPreferences
from ..repositories.user_preferences_repository import UserPreferencesRepository
from ..schemas.user_preferences import (
    UserPreferencesCreate,
    UserPreferencesResponse,
    UserPreferencesStatistics,
    UserPreferencesUpdate,
)

logger = logging.getLogger(__name__)


class UserPreferencesService:
    """Service for managing user preferences business logic."""

    def __init__(self, db: Session):
        """Initialize UserPreferencesService."""
        self.db = db
        self.repository = UserPreferencesRepository(db)

    def get_user_preferences(
        self,
        user: User,
        organization: Organization
    ) -> UserPreferencesResponse:
        """Get user preferences for the organization, create defaults if not exist."""
        preferences = self.repository.get_by_user_and_organization(
            user.id, organization.id
        )
        
        if not preferences:
            # Create default preferences
            preferences = self._create_default_preferences(user, organization)
            
            logger.info(
                "Created default preferences for user",
                extra={
                    "user_id": str(user.id),
                    "organization_id": str(organization.id),
                    "preferences_id": str(preferences.id)
                }
            )
        
        return UserPreferencesResponse.model_validate(preferences)

    def create_preferences(
        self,
        user: User,
        organization: Organization,
        preferences_data: UserPreferencesCreate
    ) -> UserPreferencesResponse:
        """Create new user preferences."""
        # Check if preferences already exist
        existing = self.repository.get_by_user_and_organization(
            user.id, organization.id
        )
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User preferences already exist for this organization"
            )
        
        preferences = self.repository.create_or_update_preferences(
            user_id=user.id,
            organization_id=organization.id,
            preferences_data=preferences_data.model_dump()
        )
        
        logger.info(
            "Created user preferences",
            extra={
                "user_id": str(user.id),
                "organization_id": str(organization.id),
                "preferences_id": str(preferences.id)
            }
        )
        
        return UserPreferencesResponse.model_validate(preferences)

    def update_preferences(
        self,
        user: User,
        organization: Organization,
        preferences_data: UserPreferencesUpdate
    ) -> UserPreferencesResponse:
        """Update user preferences."""
        # Get existing preferences or create defaults
        existing = self.repository.get_by_user_and_organization(
            user.id, organization.id
        )
        
        if not existing:
            existing = self._create_default_preferences(user, organization)
        
        # Update with provided data (exclude None values)
        update_data = preferences_data.model_dump(exclude_none=True)
        
        preferences = self.repository.create_or_update_preferences(
            user_id=user.id,
            organization_id=organization.id,
            preferences_data=update_data
        )
        
        logger.info(
            "Updated user preferences",
            extra={
                "user_id": str(user.id),
                "organization_id": str(organization.id),
                "updated_fields": list(update_data.keys())
            }
        )
        
        return UserPreferencesResponse.model_validate(preferences)

    def update_notifications(
        self,
        user: User,
        organization: Organization,
        notification_data: Dict[str, bool]
    ) -> UserPreferencesResponse:
        """Update only notification preferences."""
        preferences = self.repository.update_notifications(
            user.id, organization.id, notification_data
        )
        
        if not preferences:
            # Create defaults first
            preferences = self._create_default_preferences(user, organization)
            preferences = self.repository.update_notifications(
                user.id, organization.id, notification_data
            )
        
        logger.info(
            "Updated notification preferences",
            extra={
                "user_id": str(user.id),
                "organization_id": str(organization.id),
                "updated_notifications": list(notification_data.keys())
            }
        )
        
        return UserPreferencesResponse.model_validate(preferences)

    def update_display_preferences(
        self,
        user: User,
        organization: Organization,
        display_data: Dict[str, str]
    ) -> UserPreferencesResponse:
        """Update only display preferences."""
        preferences = self.repository.update_display(
            user.id, organization.id, display_data
        )
        
        if not preferences:
            # Create defaults first
            preferences = self._create_default_preferences(user, organization)
            preferences = self.repository.update_display(
                user.id, organization.id, display_data
            )
        
        logger.info(
            "Updated display preferences",
            extra={
                "user_id": str(user.id),
                "organization_id": str(organization.id),
                "updated_display": list(display_data.keys())
            }
        )
        
        return UserPreferencesResponse.model_validate(preferences)

    def update_privacy_settings(
        self,
        user: User,
        organization: Organization,
        privacy_data: Dict
    ) -> UserPreferencesResponse:
        """Update privacy and visibility settings."""
        preferences = self.repository.update_privacy_settings(
            user.id, organization.id, privacy_data
        )
        
        if not preferences:
            # Create defaults first
            preferences = self._create_default_preferences(user, organization)
            preferences = self.repository.update_privacy_settings(
                user.id, organization.id, privacy_data
            )
        
        logger.info(
            "Updated privacy settings",
            extra={
                "user_id": str(user.id),
                "organization_id": str(organization.id),
                "updated_privacy": list(privacy_data.keys())
            }
        )
        
        return UserPreferencesResponse.model_validate(preferences)

    def update_quiet_hours(
        self,
        user: User,
        organization: Organization,
        quiet_hours_data: Dict
    ) -> UserPreferencesResponse:
        """Update quiet hours settings."""
        preferences = self.repository.update_quiet_hours(
            user.id, organization.id, quiet_hours_data
        )
        
        if not preferences:
            # Create defaults first
            preferences = self._create_default_preferences(user, organization)
            preferences = self.repository.update_quiet_hours(
                user.id, organization.id, quiet_hours_data
            )
        
        logger.info(
            "Updated quiet hours settings",
            extra={
                "user_id": str(user.id),
                "organization_id": str(organization.id),
                "quiet_hours_enabled": quiet_hours_data.get("enabled", False)
            }
        )
        
        return UserPreferencesResponse.model_validate(preferences)

    def quick_update(
        self,
        user: User,
        organization: Organization,
        updates: Dict
    ) -> UserPreferencesResponse:
        """Quick update for common preferences (theme, language, notifications)."""
        return self.update_preferences(
            user, organization, UserPreferencesUpdate(**updates)
        )

    def reset_to_defaults(
        self,
        user: User,
        organization: Organization
    ) -> UserPreferencesResponse:
        """Reset user preferences to default values."""
        preferences = self.repository.reset_to_defaults(
            user.id, organization.id
        )
        
        if not preferences:
            # Create new default preferences
            preferences = self._create_default_preferences(user, organization)
        
        logger.info(
            "Reset user preferences to defaults",
            extra={
                "user_id": str(user.id),
                "organization_id": str(organization.id)
            }
        )
        
        return UserPreferencesResponse.model_validate(preferences)

    def delete_preferences(
        self,
        user: User,
        organization: Organization
    ) -> bool:
        """Delete user preferences."""
        success = self.repository.delete_preferences(user.id, organization.id)
        
        if success:
            logger.info(
                "Deleted user preferences",
                extra={
                    "user_id": str(user.id),
                    "organization_id": str(organization.id)
                }
            )
        
        return success

    def get_organization_statistics(
        self,
        organization: Organization
    ) -> UserPreferencesStatistics:
        """Get preferences statistics for the organization."""
        stats = self.repository.get_preferences_statistics(organization.id)
        return UserPreferencesStatistics(**stats)

    def should_send_notification(
        self,
        user: User,
        organization: Organization,
        notification_type: str,
        current_time: Optional[datetime] = None
    ) -> bool:
        """Check if notification should be sent based on user preferences."""
        preferences = self.repository.get_by_user_and_organization(
            user.id, organization.id
        )
        
        if not preferences:
            # Default behavior if no preferences set
            return notification_type in [
                "email_security_alerts",
                "email_billing_alerts"
            ]
        
        return preferences.should_send_notification(notification_type)

    def get_effective_settings(
        self,
        user: User,
        organization: Organization
    ) -> Dict[str, str]:
        """Get effective language and timezone settings with fallbacks."""
        preferences = self.repository.get_by_user_and_organization(
            user.id, organization.id
        )
        
        if not preferences:
            return {
                "language": user.language or "en",
                "timezone": user.timezone or "UTC"
            }
        
        return {
            "language": preferences.get_effective_language(),
            "timezone": preferences.get_effective_timezone()
        }

    def _create_default_preferences(
        self,
        user: User,
        organization: Organization
    ) -> UserPreferences:
        """Create default preferences for a user."""
        default_data = {
            "language": user.language or "en",
            "timezone": user.timezone or "UTC"
        }
        
        return self.repository.create_or_update_preferences(
            user_id=user.id,
            organization_id=organization.id,
            preferences_data=default_data
        )

    def bulk_notification_update(
        self,
        organization: Organization,
        notification_type: str,
        enabled: bool
    ) -> int:
        """Bulk update notification preference for all users in organization (admin only)."""
        updated_count = self.repository.bulk_update_notification_preference(
            organization.id, notification_type, enabled
        )
        
        logger.info(
            "Bulk updated notification preference",
            extra={
                "organization_id": str(organization.id),
                "notification_type": notification_type,
                "enabled": enabled,
                "updated_count": updated_count
            }
        )
        
        return updated_count
