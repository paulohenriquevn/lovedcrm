"""Two-Factor Authentication schemas for API request/response handling."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, validator


class TwoFactorSetupResponse(BaseModel):
    """Schema for 2FA setup response with QR code and secret."""
    
    secret_key: str = Field(..., description="Base32 encoded secret key")
    qr_code_data_uri: str = Field(..., description="QR code as data URI")
    backup_codes: List[str] = Field(..., description="Backup codes for recovery")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "secret_key": "JBSWY3DPEHPK3PXP",
                "qr_code_data_uri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                "backup_codes": ["12345678", "87654321", "11111111", "22222222", "33333333"]
            }
        }


class TwoFactorConfirmRequest(BaseModel):
    """Schema for confirming 2FA setup."""
    
    token: str = Field(..., min_length=6, max_length=6, description="6-digit TOTP token")
    
    @validator("token")
    @classmethod
    def validate_token(cls, v: str) -> str:
        """Validate TOTP token format."""
        if not v.isdigit():
            raise ValueError("Token must contain only digits")
        if len(v) != 6:
            raise ValueError("Token must be exactly 6 digits")
        return v
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "token": "123456"
            }
        }


class TwoFactorDisableRequest(BaseModel):
    """Schema for disabling 2FA."""
    
    token: Optional[str] = Field(None, min_length=6, max_length=8, description="6-digit TOTP token or 8-digit backup code")
    backup_code: Optional[str] = Field(None, min_length=8, max_length=8, description="8-digit backup code")
    
    @validator("token")
    @classmethod
    def validate_token(cls, v: Optional[str]) -> Optional[str]:
        """Validate TOTP token format."""
        if v is None:
            return v
        if not v.isdigit():
            raise ValueError("Token must contain only digits")
        if len(v) not in [6, 8]:
            raise ValueError("Token must be 6 digits (TOTP) or 8 digits (backup code)")
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
    
    def has_valid_credential(self) -> bool:
        """Check if at least one valid credential is provided."""
        return (self.token is not None) or (self.backup_code is not None)
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "token": "123456"
            }
        }


class TwoFactorStatusResponse(BaseModel):
    """Schema for 2FA status response."""
    
    is_enabled: bool = Field(..., description="Whether 2FA is enabled")
    is_confirmed: bool = Field(..., description="Whether 2FA setup is confirmed")
    backup_codes_remaining: int = Field(..., description="Number of unused backup codes")
    last_used_at: Optional[datetime] = Field(None, description="Last successful 2FA verification")
    setup_date: Optional[datetime] = Field(None, description="When 2FA was first confirmed")
    
    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "is_enabled": True,
                "is_confirmed": True,
                "backup_codes_remaining": 3,
                "last_used_at": "2025-01-08T10:30:00Z",
                "setup_date": "2025-01-01T12:00:00Z"
            }
        }


class TwoFactorBackupCodesResponse(BaseModel):
    """Schema for regenerated backup codes response."""
    
    backup_codes: List[str] = Field(..., description="New backup codes")
    codes_count: int = Field(..., description="Number of backup codes generated")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "backup_codes": ["12345678", "87654321", "11111111", "22222222", "33333333"],
                "codes_count": 5
            }
        }


class TwoFactorRecoveryRequest(BaseModel):
    """Schema for 2FA recovery using backup code."""
    
    backup_code: str = Field(..., min_length=8, max_length=8, description="8-digit backup code")
    
    @validator("backup_code")
    @classmethod
    def validate_backup_code(cls, v: str) -> str:
        """Validate backup code format."""
        if not v.isdigit():
            raise ValueError("Backup code must contain only digits")
        if len(v) != 8:
            raise ValueError("Backup code must be exactly 8 digits")
        return v
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "backup_code": "12345678"
            }
        }
