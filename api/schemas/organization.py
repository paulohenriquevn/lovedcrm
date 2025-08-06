"""Organization schemas for multi-tenant system validation and serialization."""
import re
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, validator

from ..schemas.user import UserResponse


class OrganizationBase(BaseModel):
    """Base organization schema with common fields."""

    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=255)

    @validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate organization name with security checks."""
        v = v.strip()

        if len(v) < 2:
            raise ValueError("Organization name must be at least 2 characters long")
        if len(v) > 255:
            raise ValueError("Organization name must be less than 255 characters")

        # Check for basic XSS patterns
        dangerous_patterns = ["<script", "<iframe", "javascript:", "onload=", "onerror="]
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError("Invalid characters in organization name")

        # Validate characters (unicode alphanumeric, spaces, common punctuation)
        # Allow unicode letters, numbers, spaces, and common punctuation
        if not re.match(
            r"^[\w\s\-_\.\'\&\u00C0-\u017F\u4E00-\u9FFF\U0001F300-\U0001F5FF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F]+$",
            v,
            re.UNICODE,
        ):
            raise ValueError("Organization name contains invalid characters")

        return v

    @validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Validate organization description."""
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
                raise ValueError("Invalid characters in organization description")

        return v

    @validator("website")
    @classmethod
    def validate_website(cls, v: Optional[str]) -> Optional[str]:
        """Validate organization website URL."""
        if v is None:
            return v

        v = v.strip()
        if not v:
            return None

        # Basic URL validation
        if not v.startswith(("http://", "https://")):
            v = f"https://{v}"

        # Simple URL validation pattern
        url_pattern = r"^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\/?.*$"
        if not re.match(url_pattern, v):
            raise ValueError("Invalid website URL format")

        return v


class OrganizationCreate(OrganizationBase):
    """Organization creation schema with slug validation."""

    slug: Optional[str] = Field(None, min_length=3, max_length=100)

    @validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        """Validate organization slug."""
        if v is None:
            return v

        v = v.strip().lower()
        if not v:
            return None

        # Slug should be URL-safe (alphanumeric, hyphens, underscores)
        if not re.match(r"^[a-z0-9\-_]+$", v):
            raise ValueError(
                "Slug can only contain lowercase letters, numbers, hyphens, and underscores"
            )

        # Can't start or end with hyphen/underscore
        if v.startswith(("-", "_")) or v.endswith(("-", "_")):
            raise ValueError("Slug cannot start or end with hyphen or underscore")

        # Reserved slugs
        reserved_slugs = ["admin", "api", "www", "app", "dashboard", "settings", "help", "support"]
        if v in reserved_slugs:
            raise ValueError("This slug is reserved and cannot be used")

        return v


class OrganizationUpdate(BaseModel):
    """Organization update schema with optional fields."""

    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=255)

    @validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate organization name with security checks."""
        if v is None:
            return v

        v = v.strip()
        if not v:
            return None

        if len(v) < 2:
            raise ValueError("Organization name must be at least 2 characters long")
        if len(v) > 255:
            raise ValueError("Organization name must be less than 255 characters")

        # Check for basic XSS patterns
        dangerous_patterns = ["<script", "<iframe", "javascript:", "onload=", "onerror="]
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError("Invalid characters in organization name")

        # Validate characters (unicode alphanumeric, spaces, common punctuation)
        # Allow unicode letters, numbers, spaces, and common punctuation
        if not re.match(
            r"^[\w\s\-_\.\'\&\u00C0-\u017F\u4E00-\u9FFF\U0001F300-\U0001F5FF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F]+$",
            v,
            re.UNICODE,
        ):
            raise ValueError("Organization name contains invalid characters")

        return v

    @validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Validate organization description."""
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
                raise ValueError("Invalid characters in organization description")

        return v

    @validator("website")
    @classmethod
    def validate_website(cls, v: Optional[str]) -> Optional[str]:
        """Validate organization website URL."""
        if v is None:
            return v

        v = v.strip()
        if not v:
            return None

        # Basic URL validation
        if not v.startswith(("http://", "https://")):
            v = f"https://{v}"

        # Simple URL validation pattern
        url_pattern = r"^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\/?.*$"
        if not re.match(url_pattern, v):
            raise ValueError("Invalid website URL format")

        return v


class OrganizationResponse(OrganizationBase):
    """Organization response schema for API responses."""

    id: uuid.UUID
    slug: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    owner_id: uuid.UUID

    class Config:
        """Configuration class."""

        from_attributes = True


class OrganizationMemberBase(BaseModel):
    """Base organization member schema."""


class OrganizationMemberCreate(BaseModel):
    """Organization member creation schema."""

    email: str


class OrganizationMemberUpdate(BaseModel):
    """Organization member update schema."""


class OrganizationMemberResponse(OrganizationMemberBase):
    """Organization member response schema."""

    id: uuid.UUID
    user_id: uuid.UUID
    organization_id: uuid.UUID
    role: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        """Configuration class."""

        from_attributes = True


class OrganizationMemberWithUser(OrganizationMemberResponse):
    """Organization member response with user details."""

    user: Optional[UserResponse] = None

    class Config:
        """Configuration class."""

        from_attributes = True


class OrganizationWithMembers(OrganizationResponse):
    """Organization response with member list."""

    members: List[OrganizationMemberWithUser] = []

    class Config:
        """Configuration class."""

        from_attributes = True


class OrganizationWithRole(OrganizationResponse):
    """Organization response with user's role included."""

    role: str  # User's role in this organization

    class Config:
        """Configuration class."""

        from_attributes = True


OrganizationMemberWithUser.model_rebuild()


class InvitationAcceptRequest(BaseModel):
    """Schema for accepting organization invitations."""

    invitation_token: str
