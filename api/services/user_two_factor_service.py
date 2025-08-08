"""Service for managing user two-factor authentication with TOTP and backup codes.

This module provides business logic for two-factor authentication management,
including TOTP setup, backup codes, and verification workflows.
"""
import base64
import hashlib
import io
import secrets
from typing import List, Optional, Tuple

import pyotp
import qrcode
from sqlalchemy.orm import Session

from ..models.organization import Organization
from ..models.user import User
from ..models.user_two_factor import UserTwoFactor
from ..repositories.user_two_factor_repository import UserTwoFactorRepository
from ..schemas.user_two_factor import (
    TwoFactorBackupCodesResponse,
    TwoFactorSetupResponse,
    TwoFactorStatusResponse,
)


class UserTwoFactorService:
    """Service for comprehensive two-factor authentication management."""

    def __init__(self, db: Session):
        """Initialize UserTwoFactorService."""
        self.db = db
        self.repository = UserTwoFactorRepository(db)

    def generate_secret_key(self) -> str:
        """Generate a cryptographically secure secret key for TOTP."""
        return pyotp.random_base32()

    def generate_backup_codes(self, count: int = 8) -> Tuple[List[str], List[str]]:
        """Generate backup codes and their hashes."""
        backup_codes = []
        backup_code_hashes = []

        for _ in range(count):
            # Generate 8-digit backup code
            code = f"{secrets.randbelow(100000000):08d}"
            backup_codes.append(code)

            # Hash the code for storage
            code_hash = hashlib.sha256(code.encode()).hexdigest()
            backup_code_hashes.append(code_hash)

        return backup_codes, backup_code_hashes

    def generate_qr_code(
        self, secret_key: str, user_email: str, organization_name: str = "SaaS Starter"
    ) -> str:
        """Generate QR code data URI for TOTP setup."""
        # Create TOTP URI
        totp = pyotp.TOTP(secret_key)
        provisioning_uri = totp.provisioning_uri(name=user_email, issuer_name=organization_name)

        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)

        # Create image
        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to data URI
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_base64}"

    def setup_2fa(self, user: User, organization: Organization) -> TwoFactorSetupResponse:
        """Setup 2FA for a user (generates secret and QR code)."""
        secret_key = self.generate_secret_key()
        backup_codes, backup_code_hashes = self.generate_backup_codes()

        # Create or update 2FA setup
        self.repository.create_2fa_setup(
            user_id=user.id,
            organization_id=organization.id,
            secret_key=secret_key,
            backup_codes=backup_code_hashes,
        )

        # Generate QR code
        qr_code_data_uri = self.generate_qr_code(
            secret_key=secret_key, user_email=user.email, organization_name=organization.name
        )

        return TwoFactorSetupResponse(
            secret_key=secret_key, qr_code_data_uri=qr_code_data_uri, backup_codes=backup_codes
        )

    def verify_totp_token(self, secret_key: str, token: str, window: int = 1) -> bool:
        """Verify TOTP token with tolerance window."""
        try:
            totp = pyotp.TOTP(secret_key)
            return totp.verify(token, valid_window=window)
        except Exception:
            return False

    def verify_backup_code(self, user: User, organization: Organization, backup_code: str) -> bool:
        """Verify and consume a backup code."""
        # Hash the provided code
        code_hash = hashlib.sha256(backup_code.encode()).hexdigest()

        # Check if the code is valid
        if not self.repository.is_backup_code_valid(
            user_id=user.id, organization_id=organization.id, code_hash=code_hash
        ):
            return False

        # Mark the code as used
        return self.repository.use_backup_code(
            user_id=user.id, organization_id=organization.id, code_hash=code_hash
        )

    def confirm_2fa_setup(self, user: User, organization: Organization, token: str) -> bool:
        """Confirm 2FA setup by verifying the first TOTP token."""
        two_factor = self.repository.get_by_user_and_organization(
            user_id=user.id, organization_id=organization.id
        )

        if not two_factor:
            return False

        # Verify the token
        if self.verify_totp_token(two_factor.secret_key, token):
            # Enable 2FA
            self.repository.enable_2fa(user_id=user.id, organization_id=organization.id)
            return True

        return False

    def disable_2fa(
        self,
        user: User,
        organization: Organization,
        token: Optional[str] = None,
        backup_code: Optional[str] = None,
    ) -> bool:
        """Disable 2FA after verifying current credentials."""
        two_factor = self.repository.get_by_user_and_organization(
            user_id=user.id, organization_id=organization.id
        )

        if not two_factor or not two_factor.is_enabled:
            return False

        # Verify either TOTP token or backup code
        verified = False

        if token:
            verified = self.verify_totp_token(two_factor.secret_key, token)
        elif backup_code:
            verified = self.verify_backup_code(user, organization, backup_code)

        if verified:
            self.repository.disable_2fa(user_id=user.id, organization_id=organization.id)
            return True

        return False

    def get_2fa_status(self, user: User, organization: Organization) -> TwoFactorStatusResponse:
        """Get current 2FA status for a user."""
        two_factor = self.repository.get_by_user_and_organization(
            user_id=user.id, organization_id=organization.id
        )

        if not two_factor:
            return TwoFactorStatusResponse(
                is_enabled=False,
                is_confirmed=False,
                backup_codes_remaining=0,
                last_used_at=None,
                setup_date=None,
            )

        return TwoFactorStatusResponse(
            is_enabled=two_factor.is_enabled,
            is_confirmed=two_factor.is_confirmed(),
            backup_codes_remaining=two_factor.get_unused_backup_codes_count(),
            last_used_at=two_factor.last_used_at,
            setup_date=two_factor.confirmed_at,
        )

    def regenerate_backup_codes(
        self, user: User, organization: Organization
    ) -> Optional[TwoFactorBackupCodesResponse]:
        """Regenerate backup codes for a user."""
        two_factor = self.repository.get_by_user_and_organization(
            user_id=user.id, organization_id=organization.id
        )

        if not two_factor or not two_factor.is_enabled:
            return None

        backup_codes, backup_code_hashes = self.generate_backup_codes()

        updated_2fa = self.repository.regenerate_backup_codes(
            user_id=user.id, organization_id=organization.id, new_codes=backup_code_hashes
        )

        if updated_2fa:
            return TwoFactorBackupCodesResponse(
                backup_codes=backup_codes, codes_count=len(backup_codes)
            )

        return None

    def verify_2fa_for_login(
        self,
        user: User,
        organization: Organization,
        token: Optional[str] = None,
        backup_code: Optional[str] = None,
    ) -> bool:
        """Verify 2FA during login process."""
        two_factor = self.repository.get_by_user_and_organization(
            user_id=user.id, organization_id=organization.id
        )

        if not two_factor or not two_factor.is_enabled:
            return True  # 2FA not required

        verified = False

        if token:
            verified = self.verify_totp_token(two_factor.secret_key, token)
        elif backup_code:
            verified = self.verify_backup_code(user, organization, backup_code)

        if verified:
            self.repository.update_last_used(user_id=user.id, organization_id=organization.id)

        return verified

    def is_2fa_required(self, user: User, organization: Organization) -> bool:
        """Check if 2FA is required for a user."""
        two_factor = self.repository.get_by_user_and_organization(
            user_id=user.id, organization_id=organization.id
        )

        return two_factor is not None and two_factor.is_enabled

    def cleanup_incomplete_setups(self, days_old: int = 7) -> int:
        """Clean up incomplete 2FA setups older than specified days."""
        from datetime import datetime, timedelta

        cutoff_date = datetime.utcnow() - timedelta(days=days_old)

        incomplete_setups = (
            self.db.query(UserTwoFactor)
            .filter(
                UserTwoFactor.is_enabled == False,  # noqa: E712
                UserTwoFactor.confirmed_at.is_(None),
                UserTwoFactor.created_at < cutoff_date,
            )
            .all()
        )

        count = len(incomplete_setups)

        for setup in incomplete_setups:
            self.db.delete(setup)

        self.db.commit()
        return count
