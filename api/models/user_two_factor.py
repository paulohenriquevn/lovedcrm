"""User Two-Factor Authentication model for enhanced security."""
import uuid
from datetime import datetime
from typing import List

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.database import Base


class UserTwoFactor(Base):
    """Model for managing user two-factor authentication settings."""

    __tablename__ = "user_two_factor"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # TOTP Configuration
    secret_key = Column(String(32), nullable=False)  # Base32 encoded secret
    is_enabled = Column(Boolean, default=False, nullable=False)

    # Backup codes (hashed)
    backup_codes = Column(JSON, default=list)  # List of hashed backup codes
    backup_codes_used = Column(JSON, default=list)  # List of used backup code hashes

    # Timestamps
    confirmed_at = Column(DateTime, nullable=True)  # When 2FA was first confirmed
    last_used_at = Column(DateTime, nullable=True)  # Last successful 2FA verification
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="two_factor")
    organization = relationship("Organization")

    __table_args__ = (
        # Unique constraint: one 2FA setup per user per organization
        UniqueConstraint("user_id", "organization_id", name="uq_user_two_factor_user_org"),
        # Performance indexes
        Index("ix_user_two_factor_user_id", "user_id"),
        Index("ix_user_two_factor_organization_id", "organization_id"),
        Index("ix_user_two_factor_enabled", "is_enabled"),
        Index("ix_user_two_factor_user_org", "user_id", "organization_id"),
    )

    def is_confirmed(self) -> bool:
        """Check if 2FA has been confirmed by user."""
        return self.confirmed_at is not None and self.is_enabled

    def get_unused_backup_codes_count(self) -> int:
        """Get count of unused backup codes."""
        if not self.backup_codes:
            return 0

        used_codes = set(self.backup_codes_used or [])
        return len([code for code in self.backup_codes if code not in used_codes])

    def mark_backup_code_used(self, code_hash: str) -> bool:
        """Mark a backup code as used."""
        if not self.backup_codes or code_hash not in self.backup_codes:
            return False

        if not self.backup_codes_used:
            self.backup_codes_used = []

        if code_hash not in self.backup_codes_used:
            self.backup_codes_used.append(code_hash)
            return True

        return False  # Already used

    def regenerate_backup_codes(self, new_codes: List[str]) -> None:
        """Regenerate backup codes (should be pre-hashed)."""
        self.backup_codes = new_codes
        self.backup_codes_used = []

    def enable_2fa(self) -> None:
        """Enable 2FA and set confirmation timestamp."""
        self.is_enabled = True
        self.confirmed_at = datetime.utcnow()

    def disable_2fa(self) -> None:
        """Disable 2FA and clear sensitive data."""
        self.is_enabled = False
        self.confirmed_at = None
        self.backup_codes_used = []

    def update_last_used(self) -> None:
        """Update last used timestamp."""
        self.last_used_at = datetime.utcnow()

    def __repr__(self) -> str:
        """String representation of UserTwoFactor."""
        return f"<UserTwoFactor(user_id={self.user_id}, enabled={self.is_enabled}, confirmed={self.is_confirmed()})>"
