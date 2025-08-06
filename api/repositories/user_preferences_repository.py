"""Repository for UserPreferences data access operations.

This module provides data access operations for user preferences,
including CRUD operations and organization-scoped queries.
"""
import uuid
from typing import Dict, Optional

from sqlalchemy.orm import Session

from ..models.user_preferences import UserPreferences
from .base import SQLRepository


class UserPreferencesRepository(SQLRepository[UserPreferences]):
    """Repository for managing user preferences with organization-scoped operations."""

    def __init__(self, db: Session):
        """Initialize UserPreferencesRepository."""
        super().__init__(db, UserPreferences)

    def get_by_user_and_organization(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID
    ) -> Optional[UserPreferences]:
        """Get preferences for a user in a specific organization."""
        return self.session.query(UserPreferences).filter(
            UserPreferences.user_id == user_id,
            UserPreferences.organization_id == organization_id
        ).first()

    def create_or_update_preferences(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        preferences_data: Dict
    ) -> UserPreferences:
        """Create new preferences or update existing ones."""
        # Check if preferences already exist
        existing = self.get_by_user_and_organization(user_id, organization_id)
        
        if existing:
            # Update existing preferences
            for key, value in preferences_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            
            self.session.commit()
            self.session.refresh(existing)
            return existing
        else:
            # Create new preferences
            preferences = UserPreferences(
                user_id=user_id,
                organization_id=organization_id,
                **preferences_data
            )
            
            self.session.add(preferences)
            self.session.commit()
            self.session.refresh(preferences)
            return preferences

    def update_notifications(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        notification_preferences: Dict[str, bool]
    ) -> Optional[UserPreferences]:
        """Update only notification preferences."""
        preferences = self.get_by_user_and_organization(user_id, organization_id)
        if preferences:
            preferences.update_notification_preferences(notification_preferences)
            self.session.commit()
            self.session.refresh(preferences)
        return preferences

    def update_display(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        display_preferences: Dict[str, str]
    ) -> Optional[UserPreferences]:
        """Update only display preferences."""
        preferences = self.get_by_user_and_organization(user_id, organization_id)
        if preferences:
            preferences.update_display_preferences(display_preferences)
            self.session.commit()
            self.session.refresh(preferences)
        return preferences

    def update_privacy_settings(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        privacy_data: Dict
    ) -> Optional[UserPreferences]:
        """Update privacy and visibility settings."""
        preferences = self.get_by_user_and_organization(user_id, organization_id)
        if preferences:
            for key, value in privacy_data.items():
                if hasattr(preferences, key):
                    setattr(preferences, key, value)
            
            self.session.commit()
            self.session.refresh(preferences)
        return preferences

    def update_quiet_hours(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        quiet_hours_data: Dict
    ) -> Optional[UserPreferences]:
        """Update quiet hours settings."""
        preferences = self.get_by_user_and_organization(user_id, organization_id)
        if preferences:
            preferences.quiet_hours = quiet_hours_data
            self.session.commit()
            self.session.refresh(preferences)
        return preferences

    def update_custom_settings(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        custom_settings: Dict
    ) -> Optional[UserPreferences]:
        """Update custom settings (merge with existing)."""
        preferences = self.get_by_user_and_organization(user_id, organization_id)
        if preferences:
            # Merge with existing custom settings
            current_settings = preferences.custom_settings or {}
            current_settings.update(custom_settings)
            preferences.custom_settings = current_settings
            
            self.session.commit()
            self.session.refresh(preferences)
        return preferences

    def reset_to_defaults(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID
    ) -> Optional[UserPreferences]:
        """Reset preferences to default values."""
        preferences = self.get_by_user_and_organization(user_id, organization_id)
        if preferences:
            # Reset to model defaults
            preferences.theme = "system"
            preferences.language = "en"
            preferences.timezone = "UTC"
            preferences.date_format = "MM/dd/yyyy"
            preferences.time_format = "12h"
            preferences.email_notifications = True
            preferences.push_notifications = True
            preferences.sms_notifications = False
            preferences.email_marketing = False
            preferences.email_product_updates = True
            preferences.email_security_alerts = True
            preferences.email_billing_alerts = True
            preferences.email_team_activity = True
            preferences.dashboard_layout = "default"
            preferences.items_per_page = "20"
            preferences.show_onboarding = True
            preferences.show_tips = True
            preferences.profile_visibility = "organization"
            preferences.activity_status = True
            preferences.quiet_hours = {
                "enabled": False,
                "start": "22:00",
                "end": "08:00",
                "timezone": "UTC"
            }
            preferences.custom_settings = {}
            
            self.session.commit()
            self.session.refresh(preferences)
        return preferences

    def delete_preferences(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID
    ) -> bool:
        """Delete user preferences."""
        preferences = self.get_by_user_and_organization(user_id, organization_id)
        if preferences:
            self.session.delete(preferences)
            self.session.commit()
            return True
        return False

    def get_users_with_email_notifications_enabled(
        self,
        organization_id: uuid.UUID,
        notification_type: str = "email_notifications"
    ) -> list[UserPreferences]:
        """Get users with specific email notifications enabled."""
        return self.session.query(UserPreferences).filter(
            UserPreferences.organization_id == organization_id,
            getattr(UserPreferences, notification_type) is True
        ).all()

    def get_preferences_statistics(self, organization_id: uuid.UUID) -> Dict:
        """Get preferences statistics for an organization."""
        total_users = self.session.query(UserPreferences).filter(
            UserPreferences.organization_id == organization_id
        ).count()
        
        if total_users == 0:
            return {
                "total_users": 0,
                "theme_light": 0,
                "theme_dark": 0,
                "theme_system": 0,
                "email_notifications_enabled": 0,
                "push_notifications_enabled": 0,
                "most_common_language": None,
                "most_common_timezone": None
            }
        
        # Theme statistics
        theme_light = self.session.query(UserPreferences).filter(
            UserPreferences.organization_id == organization_id,
            UserPreferences.theme == "light"
        ).count()
        
        theme_dark = self.session.query(UserPreferences).filter(
            UserPreferences.organization_id == organization_id,
            UserPreferences.theme == "dark"
        ).count()
        
        theme_system = self.session.query(UserPreferences).filter(
            UserPreferences.organization_id == organization_id,
            UserPreferences.theme == "system"
        ).count()
        
        # Notification statistics
        email_enabled = self.session.query(UserPreferences).filter(
            UserPreferences.organization_id == organization_id,
            UserPreferences.email_notifications is True
        ).count()
        
        push_enabled = self.session.query(UserPreferences).filter(
            UserPreferences.organization_id == organization_id,
            UserPreferences.push_notifications is True
        ).count()
        
        # Most common language and timezone (simplified approach)
        most_common_language = self.session.query(UserPreferences.language)\
            .filter(UserPreferences.organization_id == organization_id)\
            .group_by(UserPreferences.language)\
            .order_by(self.session.query(UserPreferences.language).count().desc())\
            .first()
        
        most_common_timezone = self.session.query(UserPreferences.timezone)\
            .filter(UserPreferences.organization_id == organization_id)\
            .group_by(UserPreferences.timezone)\
            .order_by(self.session.query(UserPreferences.timezone).count().desc())\
            .first()
        
        return {
            "total_users": total_users,
            "theme_light": theme_light,
            "theme_dark": theme_dark,
            "theme_system": theme_system,
            "email_notifications_enabled": email_enabled,
            "push_notifications_enabled": push_enabled,
            "most_common_language": most_common_language[0] if most_common_language else None,
            "most_common_timezone": most_common_timezone[0] if most_common_timezone else None
        }

    def bulk_update_notification_preference(
        self,
        organization_id: uuid.UUID,
        notification_type: str,
        enabled: bool
    ) -> int:
        """Bulk update a specific notification preference for all users in organization."""
        if not hasattr(UserPreferences, notification_type):
            return 0
        
        updated_count = self.session.query(UserPreferences)\
            .filter(UserPreferences.organization_id == organization_id)\
            .update({notification_type: enabled})
        
        self.session.commit()
        return updated_count
