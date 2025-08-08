"""CRM Leads Router.

FastAPI router for Lead management endpoints with organizational isolation.
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from api.core.deps import get_current_active_user, get_current_organization, get_db
from api.models.crm_lead import PipelineStage
from api.models.organization import Organization
from api.models.user import User
from api.schemas.crm_lead import (
    LeadCreate,
    LeadFavoriteToggle,
    LeadListResponse,
    LeadResponse,
    LeadSearchRequest,
    LeadStageUpdate,
    LeadUpdate,
    PipelineStatsResponse,
)
from api.services.crm_lead_service import CRMLeadService

router = APIRouter(prefix="/crm/leads", tags=["CRM - Leads"])


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_data: LeadCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create new lead for organization.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    lead = await service.create_lead(organization, lead_data, UUID(str(current_user.id)))

    # Convert to response with computed properties
    response = LeadResponse.model_validate(lead)
    response.is_closed = lead.is_closed
    response.days_in_current_stage = lead.days_in_current_stage

    return response


@router.get("", response_model=LeadListResponse)
async def get_leads(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    stage: Optional[PipelineStage] = Query(None, description="Filter by pipeline stage"),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Get leads for organization with pagination and optional stage filter.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    return service.get_organization_leads(organization, page, page_size, stage)


@router.get("/statistics", response_model=PipelineStatsResponse)
async def get_pipeline_statistics(
    organization: Organization = Depends(get_current_organization), db: Session = Depends(get_db)
):
    """Get pipeline statistics for organization.

    Returns count of leads per stage and conversion metrics.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    return service.get_pipeline_statistics(organization)


@router.post("/search", response_model=LeadListResponse)
async def search_leads(
    search_request: LeadSearchRequest,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Search leads by name, email or phone in organization.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    return service.search_leads(
        organization=organization,
        query=search_request.query,
        page=search_request.page,
        page_size=search_request.page_size,
    )


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Get single lead by ID.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    lead = service.get_lead_by_id(organization, lead_id)

    # Convert to response with computed properties
    response = LeadResponse.model_validate(lead)
    response.is_closed = lead.is_closed
    response.days_in_current_stage = lead.days_in_current_stage

    return response


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    lead_data: LeadUpdate,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Update existing lead.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    lead = service.update_lead(organization, lead_id, lead_data)

    # Convert to response with computed properties
    response = LeadResponse.model_validate(lead)
    response.is_closed = lead.is_closed
    response.days_in_current_stage = lead.days_in_current_stage

    return response


@router.put("/{lead_id}/stage", response_model=LeadResponse)
async def update_lead_stage(
    lead_id: UUID,
    stage_data: LeadStageUpdate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update lead pipeline stage.

    This endpoint is specifically for pipeline stage transitions,
    including optional notes about the stage change.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    lead = await service.update_lead_stage(
        organization, lead_id, stage_data, UUID(str(current_user.id))
    )

    # Convert to response with computed properties
    response = LeadResponse.model_validate(lead)
    response.is_closed = lead.is_closed
    response.days_in_current_stage = lead.days_in_current_stage

    return response


@router.put("/{lead_id}/favorite", response_model=LeadResponse)
async def toggle_lead_favorite(
    lead_id: UUID,
    favorite_data: LeadFavoriteToggle,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Toggle lead favorite status.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    lead = service.toggle_lead_favorite(organization, lead_id, favorite_data)

    # Convert to response with computed properties
    response = LeadResponse.model_validate(lead)
    response.is_closed = lead.is_closed
    response.days_in_current_stage = lead.days_in_current_stage

    return response


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(
    lead_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Delete lead.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    service.delete_lead(organization, lead_id)

    # Return 204 No Content on successful deletion
    return None
