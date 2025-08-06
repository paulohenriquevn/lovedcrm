"""Authentication schemas for request/response validation and serialization."""
from typing import Optional

from pydantic import BaseModel

from .user import UserResponse


class Token(BaseModel):
    """JWT token response schema with access and refresh tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data for JWT validation."""

    user_id: Optional[str] = None
    email: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh."""

    refresh_token: str


class LoginRequest(BaseModel):
    """Login request schema with email and password."""

    email: str
    password: str


class RegisterRequest(BaseModel):
    """User registration request schema."""

    email: str
    password: str
    full_name: Optional[str] = None
    terms_accepted: bool = True  # Required for registration


class OAuthCallbackRequest(BaseModel):
    """OAuth callback request schema with authorization code."""

    code: str
    state: Optional[str] = None


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""

    email: str
    recaptcha_token: Optional[str] = None  # 🤖 reCAPTCHA v3 token


class PasswordResetConfirmRequest(BaseModel):
    """Password reset confirmation request schema with new password."""

    token: str
    new_password: str
    recaptcha_token: Optional[str] = None  # 🤖 reCAPTCHA v3 token


class EmailVerificationRequest(BaseModel):
    """Email verification request schema with token."""

    token: str


class OrganizationSummary(BaseModel):
    """Organization summary schema for authentication responses."""

    id: str
    name: str
    slug: str


class OAuthResponse(BaseModel):
    """Response for OAuth callback with user data."""

    user: UserResponse
    organization: OrganizationSummary
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ResendVerificationRequest(BaseModel):
    """Resend email verification request schema."""

    email: str


class RecaptchaTokenRequest(BaseModel):
    """Base class for requests that include reCAPTCHA token."""

    recaptcha_token: Optional[str] = None
