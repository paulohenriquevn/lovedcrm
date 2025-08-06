"""
CRM Lead Schemas
Pydantic schemas for Lead API validation and serialization
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, EmailStr

from api.models.crm_lead import PipelineStage


class LeadBase(BaseModel):
    """Base Lead schema with common fields"""
    name: str = Field(..., min_length=1, max_length=255, description="Lead name")
    email: Optional[EmailStr] = Field(None, description="Lead email address")
    phone: Optional[str] = Field(None, max_length=50, description="Lead phone number")
    source: str = Field(default="web", max_length=100, description="Lead source")
    estimated_value: Optional[Decimal] = Field(
        None, 
        ge=0, 
        decimal_places=2, 
        description="Estimated value in BRL"
    )
    tags: Optional[List[str]] = Field(default_factory=list, description="Lead tags")
    notes: Optional[str] = Field(None, description="Additional notes about the lead")


class LeadCreate(LeadBase):
    """Schema for creating new leads"""
    stage: PipelineStage = Field(
        default=PipelineStage.LEAD,
        description="Initial pipeline stage"
    )
    assigned_user_id: Optional[UUID] = Field(
        None,
        description="User ID to assign this lead to"
    )


class LeadUpdate(BaseModel):
    """Schema for updating existing leads"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    source: Optional[str] = Field(None, max_length=100)
    estimated_value: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    assigned_user_id: Optional[UUID] = None
    is_favorite: Optional[bool] = Field(None, description="Whether lead is favorited")


class LeadStageUpdate(BaseModel):
    """Schema for updating lead pipeline stage"""
    stage: PipelineStage = Field(..., description="New pipeline stage")
    notes: Optional[str] = Field(None, description="Notes about stage transition")


class LeadFavoriteToggle(BaseModel):
    """Schema for toggling lead favorite status"""
    is_favorite: bool = Field(..., description="New favorite status")


class LeadResponse(LeadBase):
    """Schema for Lead API responses"""
    id: UUID
    organization_id: UUID
    stage: PipelineStage
    assigned_user_id: Optional[UUID]
    last_contact_at: Optional[datetime]
    last_contact_channel: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_favorite: bool = Field(default=False, description="Whether lead is favorited")
    
    # Computed fields
    is_closed: bool = Field(..., description="Whether lead is in closed stage")
    days_in_current_stage: Optional[int] = Field(
        None, 
        description="Days since last stage change"
    )
    
    class Config:
        from_attributes = True


class LeadListResponse(BaseModel):
    """Schema for paginated lead list responses"""
    leads: List[LeadResponse]
    total_count: int
    page: int
    page_size: int
    has_more: bool


class PipelineStatsResponse(BaseModel):
    """Schema for pipeline statistics"""
    stage_counts: dict = Field(
        ...,
        description="Count of leads per pipeline stage",
        examples=[{
            "lead": 15,
            "contato": 8,
            "proposta": 3,
            "negociacao": 2,
            "fechado": 12
        }]
    )
    total_leads: int
    conversion_rate: Optional[float] = Field(
        None,
        description="Conversion rate to closed deals (%)"
    )


class LeadSearchRequest(BaseModel):
    """Schema for lead search requests"""
    query: str = Field(..., min_length=1, description="Search query")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")


class LeadBulkUpdateRequest(BaseModel):
    """Schema for bulk lead updates"""
    lead_ids: List[UUID] = Field(..., description="List of lead IDs to update")
    updates: LeadUpdate = Field(..., description="Updates to apply to all leads")

    @classmethod
    def __get_validators__(cls):
        yield cls.validate_lead_ids

    @classmethod
    def validate_lead_ids(cls, v):
        if not v or len(v) == 0:
            raise ValueError("lead_ids must contain at least one item")
        return v


class LeadAssignmentRequest(BaseModel):
    """Schema for lead assignment requests"""
    lead_ids: List[UUID] = Field(..., description="List of lead IDs to assign")
    assigned_user_id: Optional[UUID] = Field(
        None, 
        description="User ID to assign leads to (null to unassign)"
    )

    @classmethod
    def __get_validators__(cls):
        yield cls.validate_lead_ids

    @classmethod
    def validate_lead_ids(cls, v):
        if not v or len(v) == 0:
            raise ValueError("lead_ids must contain at least one item")
        return v