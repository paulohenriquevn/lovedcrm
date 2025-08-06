"""User Session model for tracking active user sessions."""
import uuid
from datetime import datetime, timedelta

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.database import Base


class UserSession(Base):
    """Model for tracking user sessions across devices and locations."""

    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Session identification
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    
    # Device and location information
    device_info = Column(String(500))  # "Chrome 120.0 on Windows 10"
    ip_address = Column(String(45))    # IPv4/IPv6 address
    location = Column(String(255))     # "São Paulo, Brasil"
    user_agent = Column(Text)          # Full user agent string
    
    # Session state
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    last_activity = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    organization = relationship("Organization")

    __table_args__ = (
        # Performance indexes for common queries
        Index('ix_user_sessions_user_id', 'user_id'),
        Index('ix_user_sessions_organization_id', 'organization_id'),
        Index('ix_user_sessions_user_org', 'user_id', 'organization_id'),
        Index('ix_user_sessions_active', 'is_active', 'expires_at'),
        Index('ix_user_sessions_cleanup', 'expires_at', 'is_active'),
    )

    @classmethod
    def create_expiry_time(cls, hours: int = 24 * 30) -> datetime:
        """Create expiry time for session (default: 30 days)."""
        return datetime.utcnow() + timedelta(hours=hours)

    def is_expired(self) -> bool:
        """Check if session is expired."""
        return datetime.utcnow() > self.expires_at

    def refresh_activity(self) -> None:
        """Update last activity timestamp."""
        self.last_activity = datetime.utcnow()

    def revoke(self) -> None:
        """Revoke the session."""
        self.is_active = False

    def __repr__(self) -> str:
        """String representation of UserSession."""
        return f"<UserSession(id={self.id}, user_id={self.user_id}, device='{self.device_info}', active={self.is_active})>"
