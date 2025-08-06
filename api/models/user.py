"""User model and related data structures for authentication system."""
import uuid

from sqlalchemy import Boolean, Column, DateTime, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class User(Base):
    """User model for authentication and profile management."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    full_name = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    timezone = Column(String(50), nullable=True, default="UTC")
    language = Column(String(10), nullable=True, default="en")

    # OAuth fields
    google_id = Column(String(255), unique=True, nullable=True)

    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    must_change_password = Column(Boolean, default=False)  # Force password change on next login

    # Password reset fields
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime(timezone=True), nullable=True)

    # Email verification fields
    email_verification_token = Column(String(255), nullable=True)
    email_verification_expires = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    organization_memberships = relationship("OrganizationMember", back_populates="user")
    owned_organizations = relationship("Organization", back_populates="owner")
    sessions = relationship("UserSession", back_populates="user")
    two_factor = relationship("UserTwoFactor", back_populates="user", uselist=False)
    preferences = relationship("UserPreferences", back_populates="user")

    # Runtime attributes (set during authentication, not in DB) - no type hints to avoid SQLAlchemy confusion

    # Performance indexes
    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_google_id", "google_id"),
        Index("idx_users_is_active", "is_active"),
        Index("idx_users_is_verified", "is_verified"),
        Index("idx_users_created_at", "created_at"),
        Index("idx_users_last_login", "last_login"),
        Index("idx_users_password_reset_token", "password_reset_token"),
        Index("idx_users_email_verification_token", "email_verification_token"),
        # Composite indexes for common queries
        Index("idx_users_active_verified", "is_active", "is_verified"),
        Index("idx_users_email_active", "email", "is_active"),
    )

    def __repr__(self) -> str:
        """String representation of User."""
        return f"<User(email='{self.email}')>"
