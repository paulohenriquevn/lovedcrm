"""🏢 Organization Invite Schemas - Advanced Member Management.

Pydantic schemas for organization invitation system with validation and serialization.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, validator

from ..models.organization_invite import InviteStatus, OrganizationRole


class OrganizationInviteCreate(BaseModel):
    """Schema for creating organization invites."""

    email: EmailStr = Field(..., description="Email address to send invite to")
    role: OrganizationRole = Field(
        default=OrganizationRole.member, description="Role to assign to invitee"
    )
    message: Optional[str] = Field(None, max_length=500, description="Optional welcome message")
    invited_name: Optional[str] = Field(None, max_length=100, description="Optional name if known")

    @validator("message")
    def validate_message(cls, v):
        """Validate invite message length."""
        if v and len(v.strip()) < 10:
            raise ValueError("Message must be at least 10 characters if provided")
        return v.strip() if v else None


class OrganizationInviteResponse(BaseModel):
    """Schema for organization invite responses."""

    id: UUID
    organization_id: UUID
    email: str
    role: OrganizationRole
    status: InviteStatus
    message: Optional[str] = None
    invited_name: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    responded_at: Optional[datetime] = None
    is_active: bool

    # Computed properties for UI
    is_expired: bool
    is_pending: bool
    can_be_accepted: bool
    can_be_cancelled: bool

    # Organization and inviter info (optional for basic responses)
    organization_name: Optional[str] = None
    invited_by_name: Optional[str] = None

    class Config:
        """Pydantic configuration for OrganizationInviteResponse."""

        from_attributes = True


class OrganizationInviteCancel(BaseModel):
    """Schema for cancelling invites."""

    reason: Optional[str] = Field(
        None, max_length=200, description="Optional reason for cancellation"
    )


class OrganizationInviteAccept(BaseModel):
    """Schema for accepting invites."""

    token: str = Field(..., description="Invite token from URL/email")


class OrganizationInviteReject(BaseModel):
    """Schema for rejecting invites."""

    token: str = Field(..., description="Invite token from URL/email")
    reason: Optional[str] = Field(None, max_length=200, description="Optional reason for rejection")


class PublicInviteInfo(BaseModel):
    """Public information about an invite (no sensitive data)."""

    organization_name: str
    organization_slug: str
    invited_by_name: str
    role: OrganizationRole
    created_at: datetime
    expires_at: datetime
    is_expired: bool
    message: Optional[str] = None
    # Email for validation purposes (partially masked for security)
    invited_email: str


class OrganizationInviteStats(BaseModel):
    """Statistics about organization invites."""

    total_invites: int
    pending_invites: int
    accepted_invites: int
    rejected_invites: int
    expired_invites: int
    cancelled_invites: int


class OrganizationInviteList(BaseModel):
    """Paginated list of organization invites."""

    invites: list[OrganizationInviteResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool
