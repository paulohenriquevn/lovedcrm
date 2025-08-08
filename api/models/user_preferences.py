"""User Preferences model for personalized user settings."""
import uuid
from datetime import datetime
from typing import Dict, Optional

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.database import Base


class UserPreferences(Base):
    """Model for managing user preferences per organization."""

    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Display & UI Preferences
    theme = Column(String(20), default="system", nullable=False)  # light, dark, system
    language = Column(String(10), default="en", nullable=False)  # en, pt, es
    timezone = Column(String(50), default="UTC", nullable=False)
    date_format = Column(String(20), default="MM/dd/yyyy", nullable=False)
    time_format = Column(String(10), default="12h", nullable=False)  # 12h, 24h

    # Notification Preferences
    email_notifications = Column(Boolean, default=True, nullable=False)
    push_notifications = Column(Boolean, default=True, nullable=False)
    sms_notifications = Column(Boolean, default=False, nullable=False)

    # Email Notification Types
    email_marketing = Column(Boolean, default=False, nullable=False)
    email_product_updates = Column(Boolean, default=True, nullable=False)
    email_security_alerts = Column(Boolean, default=True, nullable=False)
    email_billing_alerts = Column(Boolean, default=True, nullable=False)
    email_team_activity = Column(Boolean, default=True, nullable=False)

    # Dashboard & Display Preferences
    dashboard_layout = Column(
        String(20), default="default", nullable=False
    )  # default, compact, expanded
    items_per_page = Column(String(10), default="20", nullable=False)  # 10, 20, 50, 100
    show_onboarding = Column(Boolean, default=True, nullable=False)
    show_tips = Column(Boolean, default=True, nullable=False)

    # Privacy & Security Preferences
    profile_visibility = Column(
        String(20), default="organization", nullable=False
    )  # private, organization, public
    activity_status = Column(Boolean, default=True, nullable=False)  # Show online status

    # Quiet Hours (JSON format: {"enabled": false, "start": "22:00", "end": "08:00", "timezone": "UTC"})
    quiet_hours = Column(
        JSON,
        default=lambda: {"enabled": False, "start": "22:00", "end": "08:00", "timezone": "UTC"},
    )

    # Custom preferences (flexible JSON field for future extensions)
    custom_settings = Column(JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="preferences")
    organization = relationship("Organization")

    __table_args__ = (
        # Unique constraint: one preferences setup per user per organization
        UniqueConstraint("user_id", "organization_id", name="uq_user_preferences_user_org"),
        # Performance indexes
        Index("ix_user_preferences_user_id", "user_id"),
        Index("ix_user_preferences_organization_id", "organization_id"),
        Index("ix_user_preferences_user_org", "user_id", "organization_id"),
        Index("ix_user_preferences_theme", "theme"),
        Index("ix_user_preferences_language", "language"),
    )

    def get_notification_preferences(self) -> Dict[str, bool]:
        """Get all notification preferences as dictionary."""
        return {
            "email_notifications": self.email_notifications,
            "push_notifications": self.push_notifications,
            "sms_notifications": self.sms_notifications,
            "email_marketing": self.email_marketing,
            "email_product_updates": self.email_product_updates,
            "email_security_alerts": self.email_security_alerts,
            "email_billing_alerts": self.email_billing_alerts,
            "email_team_activity": self.email_team_activity,
        }

    def get_display_preferences(self) -> Dict[str, str]:
        """Get all display preferences as dictionary."""
        return {
            "theme": self.theme,
            "language": self.language,
            "timezone": self.timezone,
            "date_format": self.date_format,
            "time_format": self.time_format,
            "dashboard_layout": self.dashboard_layout,
            "items_per_page": self.items_per_page,
        }

    def update_notification_preferences(self, preferences: Dict[str, bool]) -> None:
        """Update notification preferences from dictionary."""
        for key, value in preferences.items():
            if hasattr(self, key) and isinstance(value, bool):
                setattr(self, key, value)

    def update_display_preferences(self, preferences: Dict[str, str]) -> None:
        """Update display preferences from dictionary."""
        valid_themes = ["light", "dark", "system"]
        valid_layouts = ["default", "compact", "expanded"]
        valid_time_formats = ["12h", "24h"]
        valid_items_per_page = ["10", "20", "50", "100"]

        for key, value in preferences.items():
            if key == "theme" and value in valid_themes:
                self.theme = value
            elif key == "dashboard_layout" and value in valid_layouts:
                self.dashboard_layout = value
            elif key == "time_format" and value in valid_time_formats:
                self.time_format = value
            elif key == "items_per_page" and value in valid_items_per_page:
                self.items_per_page = value
            elif key in ["language", "timezone", "date_format"] and isinstance(value, str):
                setattr(self, key, value)

    def is_in_quiet_hours(self, current_time: Optional[datetime] = None) -> bool:
        """Check if current time is within quiet hours."""
        if not self.quiet_hours or not self.quiet_hours.get("enabled", False):
            return False

        if current_time is None:
            current_time = datetime.utcnow()

        # This is a simplified check - in production you'd want proper timezone handling
        current_hour_min = current_time.strftime("%H:%M")
        start_time = self.quiet_hours.get("start", "22:00")
        end_time = self.quiet_hours.get("end", "08:00")

        # Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if start_time > end_time:
            return current_hour_min >= start_time or current_hour_min <= end_time
        else:
            return start_time <= current_hour_min <= end_time

    def should_send_notification(self, notification_type: str) -> bool:
        """Check if notification should be sent based on preferences and quiet hours."""
        # Check if notification type is enabled
        if not getattr(self, notification_type, True):
            return False

        # Check quiet hours for non-critical notifications
        critical_types = ["email_security_alerts", "email_billing_alerts"]
        if notification_type not in critical_types and self.is_in_quiet_hours():
            return False

        return True

    def get_effective_language(self) -> str:
        """Get effective language preference (fallback to user.language then 'en')."""
        if self.language and self.language != "auto":
            return self.language

        # Fallback to user's language if available
        if hasattr(self, "user") and self.user and self.user.language:
            return self.user.language

        return "en"  # Default fallback

    def get_effective_timezone(self) -> str:
        """Get effective timezone preference (fallback to user.timezone then 'UTC')."""
        if self.timezone and self.timezone != "auto":
            return self.timezone

        # Fallback to user's timezone if available
        if hasattr(self, "user") and self.user and self.user.timezone:
            return self.user.timezone

        return "UTC"  # Default fallback

    def __repr__(self) -> str:
        """String representation of UserPreferences."""
        return f"<UserPreferences(user_id={self.user_id}, org_id={self.organization_id}, theme={self.theme})>"
