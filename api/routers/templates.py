"""Templates Router.

FastAPI router for Message Template endpoints with organizational isolation.
"""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.core.deps import get_current_active_user, get_current_organization, get_db
from api.models.organization import Organization
from api.models.user import User
from api.schemas.template import (
    TemplateCreate,
    TemplateResponse,
    TemplateUpdate,
    TemplateUseRequest,
    TemplateUseResponse,
)
from api.services.template_service import TemplateService

router = APIRouter(prefix="/templates", tags=["Templates"])
logger = logging.getLogger(__name__)


@router.get("", response_model=List[TemplateResponse])
def get_templates(
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: bool = Query(True, description="Filter by active status"),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Get organization templates with optional filtering.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = TemplateService(db)
    templates = service.get_templates(
        organization_id=UUID(str(organization.id)), category=category, is_active=is_active
    )
    return templates


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Get template by ID with organization validation.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = TemplateService(db)
    template = service.get_template_by_id(template_id, UUID(str(organization.id)))

    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    return template


@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    template_data: TemplateCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create new template with organization isolation.

    **Required**: X-Org-Id header with valid organization ID.
    """
    try:
        logger.info(f"Creating template: {template_data.name}")
        service = TemplateService(db)
        template = service.create_template(
            organization_id=UUID(str(organization.id)),
            name=template_data.name,
            category=template_data.category,
            content=template_data.content,
            user_id=UUID(str(current_user.id)),
        )
        logger.info(f"Template created successfully: {template.id}")
        return template
    except HTTPException:
        # Re-raise HTTPExceptions from service layer without wrapping
        raise
    except Exception as e:
        logger.error(f"Template creation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create template: {str(e)}",
        )


@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: UUID,
    template_data: TemplateUpdate,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Update template with organization validation.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = TemplateService(db)
    template = service.update_template(
        template_id=template_id,
        organization_id=UUID(str(organization.id)),
        name=template_data.name,
        category=template_data.category,
        content=template_data.content,
        is_active=template_data.is_active,
    )
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Delete template with organization validation.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = TemplateService(db)
    service.delete_template(template_id, UUID(str(organization.id)))


@router.post("/{template_id}/use", response_model=TemplateUseResponse)
def use_template(
    template_id: UUID,
    use_request: TemplateUseRequest,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Use template with variable substitution + increment usage.

    **Required**: X-Org-Id header with valid organization ID.
    """
    service = TemplateService(db)
    result = service.use_template(
        template_id=template_id,
        organization_id=UUID(str(organization.id)),
        context=use_request.context,
    )
    return result


@router.get("/categories/list", response_model=List[str])
def get_template_categories(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Get available template categories for organization."""
    # Predefined categories from the roadmap requirements
    categories = ["greeting", "follow-up", "objection", "closing", "custom"]
    return categories


@router.get("/variables/available", response_model=List[str])
async def get_available_variables():
    """Get list of available variables for template creation."""
    # Available variables from lead context and system
    variables = [
        "lead_name",
        "company",
        "value",
        "phone",
        "email",
        "source",
        "user_name",
        "user_title",
        "organization",
        "current_date",
        "current_time",
    ]
    return variables
