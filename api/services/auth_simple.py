"""Ultra-simple auth service - basic functionality only."""
import logging
import re
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from ..models.organization import Organization, OrganizationMember
from ..models.user import User

logger = logging.getLogger(__name__)


class SimpleAuthService:
    """Ultra-simple auth service without complex features."""

    def __init__(self, db: Session):
        """Initialize authentication service with database session."""
        self.db = db

    def register_user(
        self, email: str, password: str, full_name: str = None, terms_accepted: bool = True
    ) -> tuple[User, Organization]:
        """Register a new user and auto-create organization."""
        # Validate terms acceptance
        if not terms_accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must accept the terms and conditions to register",
            )

        # Validate password strength
        self._validate_password_strength(password)

        # Check if user exists (case insensitive)
        existing_user = self.db.query(User).filter(func.lower(User.email) == email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists"
            )

        # Create user
        hashed_password = get_password_hash(password)
        from ..core.config import settings

        # Set verification status based on configuration
        is_verified = not settings.EMAIL_VERIFICATION_REQUIRED

        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_active=True,
            is_verified=is_verified,  # Depends on EMAIL_VERIFICATION_REQUIRED flag
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # 🔴 CRITICAL: Always create organization for new user
        try:
            # Create organization name based on SAAS_MODE
            if settings.is_b2c_mode:
                org_name = "Personal Workspace"  # Generic name for B2C mode
            else:  # B2B mode
                org_name = f"{full_name or email.split('@')[0]}'s Organization"

            org_slug = f"org_{user.id}"
            org = Organization(name=org_name, slug=org_slug, owner_id=user.id, is_active=True)
            self.db.add(org)
            self.db.commit()
            self.db.refresh(org)

            # Create membership with owner role
            member = OrganizationMember(
                user_id=user.id, organization_id=org.id, role="owner", is_active=True
            )
            self.db.add(member)
            self.db.commit()

            logger.info(f"Organization '{org.name}' created automatically for user {email}")

            # Send verification email if required
            if settings.EMAIL_VERIFICATION_REQUIRED and settings.EMAIL_ENABLED:
                self._send_verification_email(user)

            return user, org

        except Exception as e:
            logger.error(f"CRITICAL: Organization creation failed for {email}: {e}")
            # Rollback user creation if org creation fails
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create organization for user",
            ) from e

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user - basic version."""
        user = self.db.query(User).filter(func.lower(User.email) == email.lower()).first()

        if not user or not user.is_active:
            return None

        if not user.hashed_password or not verify_password(password, user.hashed_password):
            return None

        # Update last login
        user.last_login = func.now()
        self.db.commit()

        return user

    def create_tokens(self, user: User) -> dict:
        """Create tokens with basic org context."""
        # Get user's organization
        org_member = (
            self.db.query(OrganizationMember).filter(OrganizationMember.user_id == user.id).first()
        )

        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "org_id": str(org_member.organization_id) if org_member else None,
            "role": org_member.role if org_member else "member",
        }

        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data=token_data)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    def login(
        self, email: str, password: str, totp_token: str = None, backup_code: str = None
    ) -> dict:
        """Login user and return tokens with organization."""
        user = self.authenticate_user(email, password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 🚀 Check if user must change password (from invite flow)
        if hasattr(user, "must_change_password") and user.must_change_password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="MUST_CHANGE_PASSWORD",  # Special code for frontend
                headers={"X-Action-Required": "change-password"},
            )

        # Get user's organization
        org_member = (
            self.db.query(OrganizationMember)
            .filter(OrganizationMember.user_id == user.id, OrganizationMember.is_active.is_(True))
            .first()
        )

        if not org_member:
            logger.error(f"CRITICAL: User {user.email} has no organization membership")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User has no organization membership",
            )

        organization = (
            self.db.query(Organization)
            .filter(Organization.id == org_member.organization_id)
            .first()
        )

        # 🔐 2FA VERIFICATION (OPTIONAL)
        from ..services.user_two_factor_service import UserTwoFactorService

        two_factor_service = UserTwoFactorService(self.db)

        # Check if 2FA is required for this user
        if two_factor_service.is_2fa_required(user, organization):
            # 2FA is enabled - verify token
            if not totp_token and not backup_code:
                # No 2FA credentials provided - request them
                return {
                    "requires_2fa": True,
                    "message": "2FA token required",
                    "user_id": str(user.id),  # Temp user ID for 2FA flow
                }

            # Verify 2FA credentials
            is_2fa_valid = two_factor_service.verify_2fa_for_login(
                user=user, organization=organization, token=totp_token, backup_code=backup_code
            )

            if not is_2fa_valid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid 2FA token or backup code",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            logger.info(f"2FA verification successful for user {user.email}")

        # Generate tokens and return successful login
        tokens = self.create_tokens(user)
        tokens["user"] = user
        tokens["organization"] = organization
        tokens["requires_2fa"] = False  # Always false for successful login

        return tokens

    def _validate_password_strength(self, password: str) -> None:
        """Validate password strength - basic version."""
        # 🔒 SECURITY: Log without exposing password
        logger.info(f"Validating password strength (length: {len(password)})")
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must be at least 8 characters long",
            )

        if len(password) > 128:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password too long (max 128 characters)",
            )

        # Check for at least one number
        if not re.search(r"\d", password):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must contain at least one number",
            )

        # Check for at least one uppercase letter
        if not re.search(r"[A-Z]", password):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must contain at least one uppercase letter",
            )

        # Check for at least one lowercase letter
        if not re.search(r"[a-z]", password):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must contain at least one lowercase letter",
            )

    def send_password_reset_email(self, email: str) -> bool:
        """Send password reset email."""
        user = self.db.query(User).filter(func.lower(User.email) == email.lower()).first()

        if not user:
            # Security: Don't reveal if email exists
            logger.info(f"Password reset requested for non-existent email: {email}")
            return True

        # Generate reset token
        reset_token = secrets.token_urlsafe(32)

        # Store reset token in user record (expires in 1 hour)
        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
        self.db.commit()

        # 🔒 SECURITY: Log without exposing token
        logger.info(f"Password reset token generated for {email}")
        # Token is NOT logged for security - only confirmation of generation

        # Send actual email using sync version
        from .email_service import email_service

        try:
            success = email_service.send_password_reset_email_sync(
                email, reset_token, user.full_name
            )

            if success:
                logger.info(f"✅ Password reset email sent to {email}")
            else:
                logger.error(f"❌ Failed to send password reset email to {email}")

            return success

        except Exception as e:
            logger.error(f"❌ Error sending password reset email to {email}: {e}")
            return False

    def _send_verification_email(self, user: User) -> bool:
        """Send email verification email to newly registered user."""
        import secrets
        from datetime import datetime, timedelta

        try:
            # Generate verification token
            verification_token = secrets.token_urlsafe(32)

            # Store verification token (expires in 24 hours)
            user.email_verification_token = verification_token
            user.email_verification_expires = datetime.utcnow() + timedelta(hours=24)
            self.db.commit()

            # 🔒 SECURITY: Log without exposing token
            logger.info(f"Email verification token generated for {user.email}")
            # Token is NOT logged for security - only confirmation of generation

            # Send verification email
            from .email_service import email_service

            success = email_service.send_verification_email_sync(
                user.email, verification_token, user.full_name
            )

            if success:
                logger.info(f"✅ Verification email sent to {user.email}")
            else:
                logger.error(f"❌ Failed to send verification email to {user.email}")

            return success

        except Exception as e:
            logger.error(f"❌ Error sending verification email to {user.email}: {e}")
            return False

    def reset_password_with_token(self, token: str, new_password: str) -> bool:
        """Reset password using token - simple implementation."""
        self._validate_password_strength(new_password)

        # Find user by reset token
        user = (
            self.db.query(User)
            .filter(
                User.password_reset_token == token, User.password_reset_expires > datetime.utcnow()
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token"
            )

        # Update password and clear reset token
        user.hashed_password = get_password_hash(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        self.db.commit()

        logger.info(f"Password reset completed for user {user.email}")
        return True

    def verify_email_with_token(self, token: str) -> bool:
        """Verify email using token."""
        # Find user by verification token
        user = (
            self.db.query(User)
            .filter(
                User.email_verification_token == token,
                User.email_verification_expires > datetime.utcnow(),
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )

        if user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already verified"
            )

        # Update user as verified and clear verification token
        user.is_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        self.db.commit()

        logger.info(f"Email verification completed for user {user.email}")
        return True

    def send_email_verification(self, email: str) -> bool:
        """Send email verification - simple implementation."""
        user = self.db.query(User).filter(func.lower(User.email) == email.lower()).first()

        if not user:
            # Security: Don't reveal if email exists
            logger.info(f"Email verification requested for non-existent email: {email}")
            return True

        if user.is_verified:
            logger.info(f"Email verification requested for already verified email: {email}")
            return True

        # Generate verification token
        verification_token = secrets.token_urlsafe(32)

        # Store verification token
        user.email_verification_token = verification_token
        user.email_verification_expires = datetime.utcnow() + timedelta(hours=24)
        self.db.commit()

        # 🔒 SECURITY: Log without exposing token
        logger.info(f"Email verification token generated for {email}")
        # Token is NOT logged for security - only confirmation of generation

        return True

    def force_change_password(self, email: str, temp_password: str, new_password: str) -> bool:
        """Force password change for users with temporary passwords."""
        # Authenticate with temporary password
        user = self.authenticate_user(email, temp_password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid temporary password",
            )

        # Verify user must change password
        if not (hasattr(user, "must_change_password") and user.must_change_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Password change not required"
            )

        # Validate new password strength
        self._validate_password_strength(new_password)

        # Update password and clear must_change_password flag
        user.hashed_password = get_password_hash(new_password)
        user.must_change_password = False
        user.updated_at = datetime.utcnow()

        self.db.commit()

        logger.info(f"Password successfully changed for user {email}")
        return True


def get_simple_auth_service(db: Session) -> SimpleAuthService:
    """Get simple auth service instance."""
    return SimpleAuthService(db)
