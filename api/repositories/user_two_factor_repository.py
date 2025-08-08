"""Repository for UserTwoFactor data access operations.

This module provides data access operations for user two-factor authentication,
including TOTP setup, backup codes, and organization-scoped queries.
"""
import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.user_two_factor import UserTwoFactor
from .base import SQLRepository


class UserTwoFactorRepository(SQLRepository[UserTwoFactor]):
    """Repository for managing user two-factor authentication with organization-scoped operations."""

    def __init__(self, db: Session):
        """Initialize UserTwoFactorRepository."""
        super().__init__(db, UserTwoFactor)

    def get_by_user_and_organization(
        self, user_id: uuid.UUID, organization_id: uuid.UUID
    ) -> Optional[UserTwoFactor]:
        """Get 2FA settings for a user in a specific organization."""
        return (
            self.session.query(UserTwoFactor)
            .filter(
                UserTwoFactor.user_id == user_id, UserTwoFactor.organization_id == organization_id
            )
            .first()
        )

    def create_2fa_setup(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        secret_key: str,
        backup_codes: List[str],
    ) -> UserTwoFactor:
        """Create initial 2FA setup (not yet enabled)."""
        # Check if user already has 2FA setup
        existing = self.get_by_user_and_organization(user_id, organization_id)
        if existing:
            # Update existing setup
            existing.secret_key = secret_key
            existing.backup_codes = backup_codes
            existing.backup_codes_used = []
            self.session.commit()
            self.session.refresh(existing)
            return existing

        two_factor = UserTwoFactor(
            user_id=user_id,
            organization_id=organization_id,
            secret_key=secret_key,
            backup_codes=backup_codes,
            is_enabled=False,
        )

        self.session.add(two_factor)
        self.session.commit()
        self.session.refresh(two_factor)
        return two_factor

    def enable_2fa(self, user_id: uuid.UUID, organization_id: uuid.UUID) -> Optional[UserTwoFactor]:
        """Enable 2FA for a user."""
        two_factor = self.get_by_user_and_organization(user_id, organization_id)
        if two_factor:
            two_factor.enable_2fa()
            self.session.commit()
            self.session.refresh(two_factor)
        return two_factor

    def disable_2fa(
        self, user_id: uuid.UUID, organization_id: uuid.UUID
    ) -> Optional[UserTwoFactor]:
        """Disable 2FA for a user."""
        two_factor = self.get_by_user_and_organization(user_id, organization_id)
        if two_factor:
            two_factor.disable_2fa()
            self.session.commit()
            self.session.refresh(two_factor)
        return two_factor

    def update_last_used(self, user_id: uuid.UUID, organization_id: uuid.UUID) -> bool:
        """Update last used timestamp for 2FA."""
        two_factor = self.get_by_user_and_organization(user_id, organization_id)
        if two_factor and two_factor.is_enabled:
            two_factor.update_last_used()
            self.session.commit()
            return True
        return False

    def use_backup_code(
        self, user_id: uuid.UUID, organization_id: uuid.UUID, code_hash: str
    ) -> bool:
        """Mark a backup code as used."""
        two_factor = self.get_by_user_and_organization(user_id, organization_id)
        if two_factor and two_factor.is_enabled:
            success = two_factor.mark_backup_code_used(code_hash)
            if success:
                two_factor.update_last_used()
                self.session.commit()
            return success
        return False

    def regenerate_backup_codes(
        self, user_id: uuid.UUID, organization_id: uuid.UUID, new_codes: List[str]
    ) -> Optional[UserTwoFactor]:
        """Regenerate backup codes for a user."""
        two_factor = self.get_by_user_and_organization(user_id, organization_id)
        if two_factor and two_factor.is_enabled:
            two_factor.regenerate_backup_codes(new_codes)
            self.session.commit()
            self.session.refresh(two_factor)
        return two_factor

    def delete_2fa_setup(self, user_id: uuid.UUID, organization_id: uuid.UUID) -> bool:
        """Completely remove 2FA setup for a user."""
        two_factor = self.get_by_user_and_organization(user_id, organization_id)
        if two_factor:
            self.session.delete(two_factor)
            self.session.commit()
            return True
        return False

    def is_backup_code_valid(
        self, user_id: uuid.UUID, organization_id: uuid.UUID, code_hash: str
    ) -> bool:
        """Check if a backup code is valid (exists and not used)."""
        two_factor = self.get_by_user_and_organization(user_id, organization_id)
        if not two_factor or not two_factor.is_enabled:
            return False

        if not two_factor.backup_codes or code_hash not in two_factor.backup_codes:
            return False

        used_codes = set(two_factor.backup_codes_used or [])
        return code_hash not in used_codes

    def get_2fa_statistics(self, organization_id: uuid.UUID) -> dict:
        """Get 2FA statistics for an organization."""
        total_users = (
            self.session.query(UserTwoFactor)
            .filter(UserTwoFactor.organization_id == organization_id)
            .count()
        )

        enabled_users = (
            self.session.query(UserTwoFactor)
            .filter(
                UserTwoFactor.organization_id == organization_id, UserTwoFactor.is_enabled is True
            )
            .count()
        )

        confirmed_users = (
            self.session.query(UserTwoFactor)
            .filter(
                UserTwoFactor.organization_id == organization_id,
                UserTwoFactor.is_enabled is True,
                UserTwoFactor.confirmed_at.isnot(None),
            )
            .count()
        )

        return {
            "total_setups": total_users,
            "enabled_users": enabled_users,
            "confirmed_users": confirmed_users,
            "adoption_rate": (enabled_users / max(total_users, 1)) * 100,
        }
