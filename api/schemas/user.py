"""User schemas for validation, serialization, and API request/response handling."""
import re
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    is_active: bool = True

    @validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate full name (basic XSS prevention)."""
        if v is None:
            return v

        # Remove dangerous characters
        v = v.strip()
        if not v:
            return None

        # Check for basic XSS patterns
        dangerous_patterns = ["<script", "<iframe", "javascript:", "onload=", "onerror="]
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError("Invalid characters in full name")

        # Validate length after cleaning
        if len(v) > 255:
            raise ValueError("Full name too long (max 255 characters)")

        return v


class UserCreate(UserBase):
    """User creation schema with password and terms acceptance."""

    password: str = Field(
        ..., min_length=1, max_length=128
    )  # Let validate_password_strength handle min length (returns 400)
    terms_accepted: bool
    recaptcha_token: Optional[str] = None  # 🤖 reCAPTCHA v3 token

    # Password validation removed from schema - handled in auth_service.validate_password_strength()
    # This allows auth_service to return proper HTTP 400 status codes

    # terms_accepted validation removed from schema - handled in auth service
    # This prevents potential loops and allows proper HTTP status codes


class UserUpdate(BaseModel):
    """User update schema with optional profile fields."""

    email: Optional[EmailStr] = None  # Optional email update with validation
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    bio: Optional[str] = Field(None, max_length=1000)
    location: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    timezone: Optional[str] = Field(None, max_length=50)
    language: Optional[str] = Field(None, max_length=10)

    @validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate full name (basic XSS prevention)."""
        if v is None:
            return v

        v = v.strip()
        if not v:
            return None

        # Check for basic XSS patterns
        dangerous_patterns = ["<script", "<iframe", "javascript:", "onload=", "onerror="]
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError("Invalid characters in full name")

        return v

    @validator("bio")
    @classmethod
    def validate_bio(cls, v: Optional[str]) -> Optional[str]:
        """Validate bio field."""
        if v is None:
            return v

        v = v.strip()
        if not v:
            return None

        # Check for basic XSS patterns
        dangerous_patterns = ["<script", "<iframe", "javascript:", "onload=", "onerror="]
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError("Invalid characters in bio")

        return v

    @validator("location")
    @classmethod
    def validate_location(cls, v: Optional[str]) -> Optional[str]:
        """Validate location field."""
        if v is None:
            return v

        v = v.strip()
        if not v:
            return None

        # Check for basic XSS patterns
        dangerous_patterns = ["<script", "<iframe", "javascript:", "onload=", "onerror="]
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError("Invalid characters in location")

        return v

    @validator("timezone")
    @classmethod
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        """Validate timezone."""
        if v is None:
            return v

        # Basic timezone validation - common timezones
        valid_timezones = [
            "UTC",
            "America/New_York",
            "America/Chicago",
            "America/Denver",
            "America/Los_Angeles",
            "America/Sao_Paulo",
            "Europe/London",
            "Europe/Paris",
            "Europe/Berlin",
            "Asia/Tokyo",
            "Asia/Shanghai",
            "Australia/Sydney",
            "Pacific/Auckland",
        ]

        if v not in valid_timezones:
            raise ValueError(f"Invalid timezone. Must be one of: {', '.join(valid_timezones)}")

        return v

    @validator("language")
    @classmethod
    def validate_language(cls, v: Optional[str]) -> Optional[str]:
        """Validate language code."""
        if v is None:
            return v

        # Basic language code validation (ISO 639-1)
        valid_languages = ["en", "es", "fr", "de", "pt", "it", "ja", "zh", "ko", "ru"]

        if v not in valid_languages:
            raise ValueError(f"Invalid language code. Must be one of: {', '.join(valid_languages)}")

        return v

    @validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number."""
        if v is None:
            return v

        v = v.strip()
        if not v:
            return None

        # Basic phone validation (international format, min 10 digits)
        clean_phone = v.replace("-", "").replace(" ", "").replace("(", "").replace(")", "")
        if not re.match(r"^[\+]?[1-9][\d]{9,15}$", clean_phone):
            raise ValueError("Invalid phone number format")

        return v


class UserLogin(BaseModel):
    """User login schema with email and password."""

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)
    recaptcha_token: Optional[str] = None  # 🤖 reCAPTCHA v3 token

    # 🔐 Optional 2FA fields
    totp_token: Optional[str] = Field(
        None, min_length=6, max_length=6, description="6-digit TOTP token"
    )
    backup_code: Optional[str] = Field(
        None, min_length=8, max_length=8, description="8-digit backup code"
    )

    @validator("totp_token")
    @classmethod
    def validate_totp_token(cls, v: Optional[str]) -> Optional[str]:
        """Validate TOTP token format."""
        if v is None:
            return v
        if not v.isdigit():
            raise ValueError("TOTP token must contain only digits")
        if len(v) != 6:
            raise ValueError("TOTP token must be exactly 6 digits")
        return v

    @validator("backup_code")
    @classmethod
    def validate_backup_code(cls, v: Optional[str]) -> Optional[str]:
        """Validate backup code format."""
        if v is None:
            return v
        if not v.isdigit():
            raise ValueError("Backup code must contain only digits")
        if len(v) != 8:
            raise ValueError("Backup code must be exactly 8 digits")
        return v


class LoginResponse(BaseModel):
    """Response schema for login with optional 2FA requirement."""

    # Success case - full login response
    user: Optional[dict] = None
    organization: Optional[dict] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None

    # 2FA required case
    requires_2fa: bool = False
    message: Optional[str] = None

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "examples": [
                {
                    "user": {"id": "...", "email": "user@example.com"},
                    "organization": {"id": "...", "name": "My Org"},
                    "access_token": "eyJ...",
                    "refresh_token": "eyJ...",
                    "token_type": "bearer",
                    "requires_2fa": False,
                },
                {"requires_2fa": True, "message": "2FA token required"},
            ]
        }


class UserResponse(BaseModel):
    """User response schema for API responses."""

    id: uuid.UUID
    email: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    is_active: bool
    is_verified: bool
    is_superuser: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        """Pydantic configuration for ORM model integration."""

        from_attributes = True


class UserPasswordReset(BaseModel):
    """User password reset request schema."""

    email: EmailStr


class UserPasswordResetConfirm(BaseModel):
    """User password reset confirmation schema."""

    token: str = Field(..., min_length=32, max_length=32)
    new_password: str = Field(..., min_length=8, max_length=128)

    @validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validate new password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(v) > 128:
            raise ValueError("Password too long (max 128 characters)")

        # Check for at least one number
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")

        # Check for at least one uppercase letter
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")

        # Check for at least one lowercase letter
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")

        # Check for at least one special character
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")

        return v


class UserEmailVerification(BaseModel):
    """User email verification schema."""

    token: str = Field(..., min_length=32, max_length=32)


class UserResendVerification(BaseModel):
    """User resend verification email schema."""

    email: EmailStr


class UserPasswordChange(BaseModel):
    """User password change schema."""

    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    @validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validate new password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(v) > 128:
            raise ValueError("Password too long (max 128 characters)")

        # Check for at least one number
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")

        # Check for at least one uppercase letter
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")

        # Check for at least one lowercase letter
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")

        # Check for at least one special character
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")

        return v


class UserDeactivate(BaseModel):
    """User deactivation confirmation schema."""

    confirm: bool = Field(..., description="Confirm user deactivation")

    @validator("confirm")
    @classmethod
    def validate_confirm(cls, v: bool) -> bool:
        """Validate that deactivation is confirmed."""
        if not v:
            raise ValueError("User deactivation must be confirmed")
        return v
