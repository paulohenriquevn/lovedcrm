"""🏢 Organization Invite Model - Advanced Member Management.

Handles invitation system for organizations with expiration, roles, and status tracking.
"""
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum

from sqlalchemy import UUID, Boolean, Column, DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from ..core.database import Base


class InviteStatus(str, Enum):
    """Invitation status enum."""

    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"
    cancelled = "cancelled"


class OrganizationRole(str, Enum):
    """Extended organization roles enum."""

    owner = "owner"
    admin = "admin"
    member = "member"
    viewer = "viewer"


class OrganizationInvite(Base):
    """Organization invitation model for advanced member management."""

    __tablename__ = "organization_invites"

    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True
    )
    invited_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Invite details
    email = Column(String(255), nullable=False, index=True)
    role = Column(SQLEnum(OrganizationRole), nullable=False, default=OrganizationRole.member)
    status = Column(SQLEnum(InviteStatus), nullable=False, default=InviteStatus.pending, index=True)

    # Optional personalization
    message = Column(Text, nullable=True)
    invited_name = Column(String(100), nullable=True)  # Optional name if known

    # Timestamps and expiration
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(
        DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(days=7)
    )
    responded_at = Column(DateTime, nullable=True)  # When invite was accepted/rejected

    # Security and uniqueness
    token = Column(String(64), nullable=False, unique=True, index=True)  # Secure invite token
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    organization = relationship("Organization", back_populates="invites")
    invited_by = relationship("User", foreign_keys=[invited_by_id])

    def __repr__(self) -> str:
        """String representation of OrganizationInvite."""
        return f"<OrganizationInvite(id={self.id}, email={self.email}, role={self.role}, status={self.status})>"

    @property
    def is_expired(self) -> bool:
        """Check if invite has expired."""
        now = datetime.now(timezone.utc)
        expires_at = (
            self.expires_at.replace(tzinfo=timezone.utc)
            if self.expires_at.tzinfo is None
            else self.expires_at
        )
        return now > expires_at

    @property
    def is_pending(self) -> bool:
        """Check if invite is still pending."""
        return self.status == InviteStatus.pending and not self.is_expired and self.is_active

    @property
    def can_be_accepted(self) -> bool:
        """Check if invite can be accepted."""
        return self.is_pending

    @property
    def can_be_cancelled(self) -> bool:
        """Check if invite can be cancelled."""
        return self.status == InviteStatus.pending and self.is_active

    def mark_expired(self) -> None:
        """Mark invite as expired."""
        if self.is_expired and self.status == InviteStatus.pending:
            self.status = InviteStatus.expired

    def accept_invite(self) -> None:
        """Mark invite as accepted."""
        if self.can_be_accepted:
            self.status = InviteStatus.accepted
            self.responded_at = datetime.utcnow()

    def reject_invite(self) -> None:
        """Mark invite as rejected."""
        if self.can_be_accepted:
            self.status = InviteStatus.rejected
            self.responded_at = datetime.utcnow()

    def cancel_invite(self) -> None:
        """Cancel a pending invite."""
        if self.can_be_cancelled:
            self.status = InviteStatus.cancelled
            self.is_active = False
            self.responded_at = datetime.utcnow()
