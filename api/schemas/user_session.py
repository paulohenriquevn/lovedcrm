"""User Session schemas for API request/response handling."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class UserSessionBase(BaseModel):
    """Base schema for user session."""
    
    device_info: Optional[str] = Field(None, max_length=500, description="Device information")
    ip_address: Optional[str] = Field(None, max_length=45, description="IP address")
    location: Optional[str] = Field(None, max_length=255, description="Geographic location")
    user_agent: Optional[str] = Field(None, description="User agent string")


class UserSessionCreate(UserSessionBase):
    """Schema for creating a new user session."""
    
    session_token: str = Field(..., max_length=255, description="Unique session token")
    expires_at: datetime = Field(..., description="Session expiration time")


class UserSessionResponse(UserSessionBase):
    """Schema for user session API responses."""
    
    id: uuid.UUID
    user_id: uuid.UUID
    organization_id: uuid.UUID
    session_token: str
    is_active: bool
    last_activity: datetime
    created_at: datetime
    expires_at: datetime
    current: bool = Field(default=False, description="Whether this is the current session")

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class UserSessionListResponse(BaseModel):
    """Schema for listing user sessions."""
    
    sessions: list[UserSessionResponse]
    total: int
    current_session_id: Optional[uuid.UUID] = None

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class RevokeSessionRequest(BaseModel):
    """Schema for revoking a session."""
    
    session_id: uuid.UUID = Field(..., description="Session ID to revoke")


class RevokeAllSessionsRequest(BaseModel):
    """Schema for revoking all sessions except current."""
    
    confirm: bool = Field(..., description="Confirmation to revoke all sessions")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "confirm": True
            }
        }
