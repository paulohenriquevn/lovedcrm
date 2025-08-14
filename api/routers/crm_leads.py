"""CRM Leads Router.

FastAPI router for Lead management endpoints with organizational isolation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.core.deps import get_current_active_user, get_current_organization, get_db
from api.models.crm_lead import Lead, PipelineStage
from api.models.organization import Organization
from api.models.user import User
from api.schemas.crm_lead import (
    AdvancedFiltersSchema,
    AdvancedMetricsResponse,
    ConversionMetricsResponse,
    FilterOptionsResponse,
    LeadCreate,
    LeadFavoriteToggle,
    LeadListResponse,
    LeadResponse,
    LeadSearchRequest,
    LeadStageUpdate,
    LeadUpdate,
    PipelineStatsResponse,
)
from api.services.crm_lead_assignment_service import AssignmentStrategy, LeadAssignmentService
from api.services.crm_lead_deduplication_service import LeadDeduplicationService
from api.services.crm_lead_scoring_service import LeadScoringService
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
    return await service.create_lead_response(organization, lead_data, UUID(str(current_user.id)))


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


@router.get("/assignment-analytics", status_code=status.HTTP_200_OK)
async def get_assignment_analytics(
    days_back: int = Query(30, ge=1, le=365, description="Days of data to analyze"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get assignment analytics and team performance metrics.

    Provides:
    - Team member workload distribution
    - Recent assignment statistics
    - Conversion rates by team member
    - Performance scores and recommendations

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = LeadAssignmentService(db)
    return await service.get_assignment_analytics(organization, days_back)


@router.get("/duplicates", status_code=status.HTTP_200_OK)
async def find_potential_duplicates(
    limit: int = Query(50, ge=1, le=200, description="Maximum duplicates to return"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Find potential duplicate leads using fuzzy matching algorithms.

    Detection methods:
    - Exact email matching (100% confidence)
    - Normalized phone matching (95% confidence)
    - Fuzzy name matching (85%+ similarity)
    - Email domain matching (same company)

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = LeadDeduplicationService(db)
    return service.find_potential_duplicates(organization, limit=limit)


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
    return service.get_lead_by_id_response(organization, lead_id)


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
    return service.update_lead_response(organization, lead_id, lead_data)


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
    return await service.update_lead_stage_response(
        organization, lead_id, stage_data, UUID(str(current_user.id))
    )


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
    return service.toggle_lead_favorite_response(organization, lead_id, favorite_data)


@router.get("/{lead_id}/transition-validation")
async def validate_stage_transition(
    lead_id: UUID,
    target_stage: PipelineStage = Query(..., description="Target stage to validate"),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Validate if a stage transition is allowed for a lead.
    
    Returns validation result and requirements if transition is not allowed.
    
    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    lead = service.get_lead_by_id(organization, lead_id)
    
    can_transition = lead.can_move_to_stage(target_stage)
    requirements = lead.get_transition_requirements(target_stage) if not can_transition else []
    
    return {
        "can_transition": can_transition,
        "current_stage": lead.stage.value,
        "target_stage": target_stage.value,
        "requirements": requirements,
        "valid_transitions": [
            stage.value for stage in PipelineStage 
            if lead.can_move_to_stage(stage) and stage != lead.stage
        ]
    }


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


@router.get("/pipeline/metrics", response_model=ConversionMetricsResponse)
async def get_pipeline_metrics(
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Get pipeline conversion metrics and analytics.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    return service.get_conversion_metrics(organization, start_date, end_date)


@router.get("/pipeline/filters", response_model=FilterOptionsResponse)
async def get_pipeline_filters(
    organization: Organization = Depends(get_current_organization), db: Session = Depends(get_db)
):
    """Get available filter options for pipeline.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)
    return service.get_filter_options(organization)


@router.get("/metrics/advanced", response_model=AdvancedMetricsResponse)
async def get_advanced_pipeline_metrics(
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    stages: List[str] = Query(default=[], description="Pipeline stages to include"),
    sources: List[str] = Query(default=[], description="Lead sources to include"),
    assigned_users: List[str] = Query(default=[], description="Assigned user IDs to include"),
    tags: List[str] = Query(default=[], description="Tags to include"),
    value_min: Optional[float] = Query(None, ge=0, description="Minimum estimated value"),
    value_max: Optional[float] = Query(None, ge=0, description="Maximum estimated value"),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Get advanced pipeline metrics with 6-dimensional filtering.

    Advanced analytics including:
    - Stage distribution with percentages and values
    - Conversion funnel analysis with drop-off rates
    - Bottleneck detection with recommendations
    - Trending metrics over time periods
    - Executive summary with KPIs

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = CRMLeadService(db)

    # Build advanced filters schema
    filters = AdvancedFiltersSchema(
        start_date=start_date,
        end_date=end_date,
        stages=stages,
        sources=sources,
        assigned_users=assigned_users,
        tags=tags,
        value_min=value_min,
        value_max=value_max,
    )

    return await service.get_advanced_metrics(UUID(str(organization.id)), filters)


# =============================================================================
# STORY 3.1 - LEAD MANAGEMENT MVP ENDPOINTS
# =============================================================================


@router.post("/{lead_id}/calculate-score", status_code=status.HTTP_200_OK)
async def calculate_lead_score(
    lead_id: UUID,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Calculate ML-based lead score with 6-factor algorithm.

    Scoring factors:
    - Email authority (10 points)
    - Phone completeness (5 points)
    - Estimated value tier (20 points)
    - Source quality (15 points)
    - Company size (25 points)
    - Recent engagement (15 points)

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = LeadScoringService(db)
    return await service.calculate_and_update_score(organization, lead_id)


@router.post("/bulk-score", status_code=status.HTTP_200_OK)
async def bulk_score_leads(
    lead_ids: Optional[List[UUID]] = None,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Bulk score multiple leads (or all leads if no IDs specified).

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = LeadScoringService(db)
    return await service.bulk_score_leads(organization, lead_ids)


@router.get("/{lead_id}/duplicates", status_code=status.HTTP_200_OK)
async def find_lead_duplicates(
    lead_id: UUID,
    limit: int = Query(10, ge=1, le=50, description="Maximum duplicates to return"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Find potential duplicates for a specific lead.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = LeadDeduplicationService(db)

    # Get the target lead first
    lead = (
        db.query(Lead).filter(Lead.id == lead_id, Lead.organization_id == organization.id).first()  # type: ignore[arg-type]
    )

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return service.find_potential_duplicates(organization, target_lead=lead, limit=limit)


@router.post("/merge/{primary_id}/{duplicate_id}", status_code=status.HTTP_200_OK)
async def merge_duplicate_leads(
    primary_id: UUID,
    duplicate_id: UUID,
    merge_strategy: str = Query(
        "keep_best_data", description="Merge strategy: keep_original, keep_recent, keep_best_data"
    ),
    notes: Optional[str] = Query(None, description="Optional merge notes"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Merge duplicate leads with specified strategy.

    Strategies:
    - keep_original: Keep primary lead data, merge supplementary info
    - keep_recent: Use most recently updated lead data
    - keep_best_data: Intelligently merge best quality data from both

    **Required**: X-Org-Id header with valid organization ID.
    """
    if merge_strategy not in ["keep_original", "keep_recent", "keep_best_data"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid merge strategy. Must be: keep_original, keep_recent, keep_best_data",
        )

    service = LeadDeduplicationService(db)
    return await service.merge_leads(organization, primary_id, duplicate_id, merge_strategy, notes)


@router.post("/assign-batch", status_code=status.HTTP_200_OK)
async def assign_leads_batch(
    lead_ids: List[UUID],
    strategy: AssignmentStrategy = Query(
        AssignmentStrategy.WORKLOAD_BALANCED, description="Assignment strategy to use"
    ),
    user_ids: Optional[List[UUID]] = Query(
        None, description="Optional specific users to assign to"
    ),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Intelligently assign multiple leads to team members.

    Strategies:
    - round_robin: Equal distribution rotation
    - workload_balanced: Based on current active lead counts
    - score_based: High-score leads to top performers

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = LeadAssignmentService(db)
    return await service.assign_leads_batch(organization, lead_ids, strategy, user_ids)
