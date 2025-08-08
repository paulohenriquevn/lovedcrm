"""User Preferences Pydantic schemas for request/response validation.

This module defines Pydantic schemas for user preferences API requests
and responses, including validation rules and type constraints.
"""
from datetime import datetime
from typing import Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class QuietHoursSettings(BaseModel):
    """Schema for quiet hours configuration."""

    enabled: bool = False
    start: str = Field(default="22:00", pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")  # HH:MM format
    end: str = Field(default="08:00", pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")  # HH:MM format
    timezone: str = "UTC"

    @validator("start", "end")
    def validate_time_format(cls, v):
        """Validate time format is HH:MM."""
        try:
            hour, minute = map(int, v.split(":"))
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                raise ValueError("Invalid time format")
            return v
        except (ValueError, AttributeError):
            raise ValueError("Time must be in HH:MM format (24-hour)")


class NotificationPreferences(BaseModel):
    """Schema for notification preferences."""

    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    email_marketing: bool = False
    email_product_updates: bool = True
    email_security_alerts: bool = True
    email_billing_alerts: bool = True
    email_team_activity: bool = True


class DisplayPreferences(BaseModel):
    """Schema for display preferences."""

    theme: str = Field("system", pattern=r"^(light|dark|system)$")
    language: str = Field("en", min_length=2, max_length=10)
    timezone: str = Field("UTC", min_length=3, max_length=50)
    date_format: str = Field("MM/dd/yyyy", min_length=5, max_length=20)
    time_format: str = Field("12h", pattern=r"^(12h|24h)$")
    dashboard_layout: str = Field("default", pattern=r"^(default|compact|expanded)$")
    items_per_page: str = Field("20", pattern=r"^(10|20|50|100)$")


class PrivacyPreferences(BaseModel):
    """Schema for privacy preferences."""

    profile_visibility: str = Field("organization", pattern=r"^(private|organization|public)$")
    activity_status: bool = True
    show_onboarding: bool = True
    show_tips: bool = True


class UserPreferencesBase(BaseModel):
    """Base schema for user preferences."""

    # Display & UI Preferences
    theme: str = Field("system", pattern=r"^(light|dark|system)$")
    language: str = Field("en", min_length=2, max_length=10)
    timezone: str = Field("UTC", min_length=3, max_length=50)
    date_format: str = Field("MM/dd/yyyy", min_length=5, max_length=20)
    time_format: str = Field("12h", pattern=r"^(12h|24h)$")

    # Notification Preferences
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    email_marketing: bool = False
    email_product_updates: bool = True
    email_security_alerts: bool = True
    email_billing_alerts: bool = True
    email_team_activity: bool = True

    # Dashboard & Display Preferences
    dashboard_layout: str = Field("default", pattern=r"^(default|compact|expanded)$")
    items_per_page: str = Field("20", pattern=r"^(10|20|50|100)$")
    show_onboarding: bool = True
    show_tips: bool = True

    # Privacy & Security Preferences
    profile_visibility: str = Field("organization", pattern=r"^(private|organization|public)$")
    activity_status: bool = True

    # Quiet Hours
    quiet_hours: QuietHoursSettings = Field(default_factory=lambda: QuietHoursSettings())

    # Custom settings
    custom_settings: Dict = Field(default_factory=dict)


class UserPreferencesCreate(UserPreferencesBase):
    """Schema for creating user preferences."""

    pass  # Inherits all fields from base


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences (all fields optional)."""

    # Display & UI Preferences
    theme: Optional[str] = Field(None, pattern=r"^(light|dark|system)$")
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    timezone: Optional[str] = Field(None, min_length=3, max_length=50)
    date_format: Optional[str] = Field(None, min_length=5, max_length=20)
    time_format: Optional[str] = Field(None, pattern=r"^(12h|24h)$")

    # Notification Preferences
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    email_marketing: Optional[bool] = None
    email_product_updates: Optional[bool] = None
    email_security_alerts: Optional[bool] = None
    email_billing_alerts: Optional[bool] = None
    email_team_activity: Optional[bool] = None

    # Dashboard & Display Preferences
    dashboard_layout: Optional[str] = Field(None, pattern=r"^(default|compact|expanded)$")
    items_per_page: Optional[str] = Field(None, pattern=r"^(10|20|50|100)$")
    show_onboarding: Optional[bool] = None
    show_tips: Optional[bool] = None

    # Privacy & Security Preferences
    profile_visibility: Optional[str] = Field(None, pattern=r"^(private|organization|public)$")
    activity_status: Optional[bool] = None

    # Quiet Hours
    quiet_hours: Optional[QuietHoursSettings] = None

    # Custom settings
    custom_settings: Optional[Dict] = None


class UserPreferencesResponse(UserPreferencesBase):
    """Schema for user preferences response."""

    id: UUID
    user_id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        """Pydantic model configuration."""

        from_attributes = True


class UserPreferencesUpdateNotifications(BaseModel):
    """Schema for updating only notification preferences."""

    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    email_marketing: Optional[bool] = None
    email_product_updates: Optional[bool] = None
    email_security_alerts: Optional[bool] = None
    email_billing_alerts: Optional[bool] = None
    email_team_activity: Optional[bool] = None


class UserPreferencesUpdateDisplay(BaseModel):
    """Schema for updating only display preferences."""

    theme: Optional[str] = Field(None, pattern=r"^(light|dark|system)$")
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    timezone: Optional[str] = Field(None, min_length=3, max_length=50)
    date_format: Optional[str] = Field(None, min_length=5, max_length=20)
    time_format: Optional[str] = Field(None, pattern=r"^(12h|24h)$")
    dashboard_layout: Optional[str] = Field(None, pattern=r"^(default|compact|expanded)$")
    items_per_page: Optional[str] = Field(None, pattern=r"^(10|20|50|100)$")


class UserPreferencesUpdatePrivacy(BaseModel):
    """Schema for updating only privacy preferences."""

    profile_visibility: Optional[str] = Field(None, pattern=r"^(private|organization|public)$")
    activity_status: Optional[bool] = None
    show_onboarding: Optional[bool] = None
    show_tips: Optional[bool] = None


class UserPreferencesStatistics(BaseModel):
    """Schema for preferences statistics response."""

    total_users: int
    theme_light: int
    theme_dark: int
    theme_system: int
    email_notifications_enabled: int
    push_notifications_enabled: int
    most_common_language: Optional[str] = None
    most_common_timezone: Optional[str] = None

    class Config:
        """Pydantic model configuration."""

        from_attributes = True


class UserPreferencesQuickUpdate(BaseModel):
    """Schema for common quick preference updates."""

    theme: Optional[str] = Field(None, pattern=r"^(light|dark|system)$")
    language: Optional[str] = Field(None, min_length=2, max_length=10)
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
