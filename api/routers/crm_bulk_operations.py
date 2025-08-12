"""CRM Bulk Operations Router.

API endpoints for bulk lead operations with validation and audit.
Features: Bulk update, stage move, assign, delete with WebSocket notifications.
Story 3.3: Lead Management - Melhorias UX.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import and_, delete, update
from sqlalchemy.orm import Session

from api.core.database import get_db
from api.core.deps import get_current_organization
from api.core.logging_config import get_logger
from api.core.websocket_manager import websocket_manager
from api.models.crm_lead import Lead
from api.models.organization import Organization
from api.schemas.crm_lead import LeadUpdate
from api.services.crm_lead_service import CRMLeadService

router = APIRouter(prefix="/crm/leads", tags=["crm-bulk-operations"])
logger = get_logger(__name__)


# Pydantic schemas for bulk operations
class BulkLeadUpdateRequest(BaseModel):
    """Request schema for bulk lead updates."""

    lead_ids: List[str] = Field(..., description="List of lead IDs to update")
    updates: LeadUpdate = Field(..., description="Updates to apply to all leads")
    notify_websocket: bool = Field(default=True, description="Send WebSocket notifications")


class BulkStageUpdateRequest(BaseModel):
    """Request schema for bulk stage updates."""

    lead_ids: List[str] = Field(..., description="List of lead IDs to update")
    stage: str = Field(..., description="New stage for all leads")
    notes: Optional[str] = Field(None, description="Optional notes for stage change")
    notify_websocket: bool = Field(default=True, description="Send WebSocket notifications")


class BulkAssignmentRequest(BaseModel):
    """Request schema for bulk assignment."""

    lead_ids: List[str] = Field(..., description="List of lead IDs to assign")
    assigned_user_id: Optional[str] = Field(None, description="User ID to assign leads to")
    notify_websocket: bool = Field(default=True, description="Send WebSocket notifications")


class BulkTagRequest(BaseModel):
    """Request schema for bulk tagging."""

    lead_ids: List[str] = Field(..., description="List of lead IDs to tag")
    tags: List[str] = Field(..., description="Tags to add to all leads")
    action: str = Field(default="add", description="Action: 'add', 'remove', or 'replace'")
    notify_websocket: bool = Field(default=True, description="Send WebSocket notifications")


class BulkDeleteRequest(BaseModel):
    """Request schema for bulk deletion."""

    lead_ids: List[str] = Field(..., description="List of lead IDs to delete")
    confirm_deletion: bool = Field(..., description="Confirmation flag for deletion")
    notify_websocket: bool = Field(default=True, description="Send WebSocket notifications")


class BulkOperationResult(BaseModel):
    """Response schema for bulk operations."""

    operation_type: str = Field(..., description="Type of bulk operation performed")
    total_requested: int = Field(..., description="Total number of leads requested to update")
    successful_updates: int = Field(..., description="Number of successfully updated leads")
    failed_updates: int = Field(..., description="Number of failed updates")
    errors: List[Dict[str, str]] = Field(default=[], description="List of errors encountered")
    updated_lead_ids: List[str] = Field(default=[], description="IDs of successfully updated leads")
    execution_time_ms: int = Field(..., description="Operation execution time in milliseconds")


def _validate_lead_ids(lead_ids: List[str]) -> List[UUID]:
    """Validate and convert lead ID strings to UUIDs."""
    if not lead_ids:
        raise HTTPException(status_code=400, detail="No lead IDs provided")

    if len(lead_ids) > 100:  # Limit bulk operations to prevent abuse
        raise HTTPException(status_code=400, detail="Maximum 100 leads can be processed at once")

    uuid_list = []
    for lead_id in lead_ids:
        try:
            uuid_list.append(UUID(lead_id))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid lead ID format: {lead_id}")

    return uuid_list


def _get_organization_leads(
    db: Session, organization: Organization, lead_uuids: List[UUID]
) -> List[Lead]:
    """Get leads that belong to the organization."""
    return (
        db.query(Lead)
        .filter(and_(Lead.id.in_(lead_uuids), Lead.organization_id == organization.id))
        .all()
    )


async def _send_bulk_websocket_notification(
    organization_id: UUID,
    operation_type: str,
    lead_ids: List[str],
    additional_data: Optional[Dict[str, Any]] = None,
):
    """Send WebSocket notification for bulk operation."""
    message = {
        "type": "bulk_operation",
        "operation": operation_type,
        "lead_ids": lead_ids,
        "timestamp": datetime.utcnow().isoformat(),
        **(additional_data or {}),
    }

    await websocket_manager.broadcast_to_organization(
        organization_id=organization_id, message=message
    )


@router.put("/bulk-update")
def bulk_update_leads(
    request: BulkLeadUpdateRequest,
    background_tasks: BackgroundTasks,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> BulkOperationResult:
    """Update multiple leads with the same data.

    Applies the same updates to all specified leads with proper validation
    and audit logging.
    """
    start_time = datetime.utcnow()

    # Validate input
    lead_uuids = _validate_lead_ids(request.lead_ids)

    # Get leads that belong to this organization
    leads = _get_organization_leads(db, organization, lead_uuids)
    found_lead_ids = {lead.id for lead in leads}

    successful_updates = []
    errors = []

    # Create service instance
    lead_service = CRMLeadService(db)

    # Process each lead
    for lead in leads:
        try:
            # Apply updates using the service layer for proper validation
            updated_lead = lead_service.update_lead(
                lead_id=str(lead.id), lead_data=request.updates, organization=organization
            )
            successful_updates.append(str(updated_lead.id))

        except Exception as e:
            logger.error(
                f"Failed to update lead {lead.id}",
                extra={
                    "lead_id": str(lead.id),
                    "organization_id": str(organization.id),
                    "error": str(e),
                },
            )
            errors.append({"lead_id": str(lead.id), "error": str(e)})

    # Check for leads that weren't found
    for lead_uuid in lead_uuids:
        if lead_uuid not in found_lead_ids:
            errors.append({"lead_id": str(lead_uuid), "error": "Lead not found or access denied"})

    # Send WebSocket notification
    if request.notify_websocket and successful_updates:
        background_tasks.add_task(
            _send_bulk_websocket_notification,
            organization.id,
            "bulk_update",
            successful_updates,
            {"updates": request.updates.dict(exclude_unset=True)},
        )

    execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

    logger.info(
        "Bulk update operation completed",
        extra={
            "organization_id": str(organization.id),
            "total_requested": len(request.lead_ids),
            "successful_updates": len(successful_updates),
            "failed_updates": len(errors),
            "execution_time_ms": execution_time,
        },
    )

    return BulkOperationResult(
        operation_type="bulk_update",
        total_requested=len(request.lead_ids),
        successful_updates=len(successful_updates),
        failed_updates=len(errors),
        errors=errors,
        updated_lead_ids=successful_updates,
        execution_time_ms=execution_time,
    )


@router.put("/bulk-stage-update")
def bulk_stage_update(
    request: BulkStageUpdateRequest,
    background_tasks: BackgroundTasks,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> BulkOperationResult:
    """Update the stage of multiple leads at once."""
    start_time = datetime.utcnow()

    # Validate input
    lead_uuids = _validate_lead_ids(request.lead_ids)

    # Validate stage
    valid_stages = ["lead", "contato", "proposta", "negociacao", "fechado"]
    if request.stage not in valid_stages:
        raise HTTPException(
            status_code=400, detail=f"Invalid stage. Must be one of: {valid_stages}"
        )

    # Get leads that belong to this organization
    leads = _get_organization_leads(db, organization, lead_uuids)
    found_lead_ids = {lead.id for lead in leads}

    successful_updates = []
    errors = []

    # Update stage for all leads
    try:
        # Bulk update in database
        stmt = (
            update(Lead)
            .where(
                and_(
                    Lead.id.in_([lead.id for lead in leads]),
                    Lead.organization_id == organization.id,
                )
            )
            .values(stage=request.stage, updated_at=datetime.utcnow())
        )

        db.execute(stmt)
        db.commit()

        successful_updates = [str(lead.id) for lead in leads]

    except Exception as e:
        db.rollback()
        logger.error(
            "Failed to bulk update stages",
            extra={"organization_id": str(organization.id), "error": str(e)},
        )
        for lead in leads:
            errors.append({"lead_id": str(lead.id), "error": str(e)})

    # Check for leads that weren't found
    for lead_uuid in lead_uuids:
        if lead_uuid not in found_lead_ids:
            errors.append({"lead_id": str(lead_uuid), "error": "Lead not found or access denied"})

    # Send WebSocket notification
    if request.notify_websocket and successful_updates:
        background_tasks.add_task(
            _send_bulk_websocket_notification,
            organization.id,
            "bulk_stage_update",
            successful_updates,
            {"new_stage": request.stage, "notes": request.notes},
        )

    execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

    logger.info(
        "Bulk stage update operation completed",
        extra={
            "organization_id": str(organization.id),
            "new_stage": request.stage,
            "total_requested": len(request.lead_ids),
            "successful_updates": len(successful_updates),
            "failed_updates": len(errors),
            "execution_time_ms": execution_time,
        },
    )

    return BulkOperationResult(
        operation_type="bulk_stage_update",
        total_requested=len(request.lead_ids),
        successful_updates=len(successful_updates),
        failed_updates=len(errors),
        errors=errors,
        updated_lead_ids=successful_updates,
        execution_time_ms=execution_time,
    )


@router.delete("/bulk-delete")
def bulk_delete_leads(
    request: BulkDeleteRequest,
    background_tasks: BackgroundTasks,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> BulkOperationResult:
    """Delete multiple leads at once with confirmation."""
    start_time = datetime.utcnow()

    # Validate confirmation
    if not request.confirm_deletion:
        raise HTTPException(status_code=400, detail="Deletion must be confirmed")

    # Validate input
    lead_uuids = _validate_lead_ids(request.lead_ids)

    # Get leads that belong to this organization
    leads = _get_organization_leads(db, organization, lead_uuids)
    found_lead_ids = {lead.id for lead in leads}

    successful_updates = []
    errors = []

    # Delete leads
    try:
        # Bulk delete in database
        stmt = delete(Lead).where(
            and_(Lead.id.in_([lead.id for lead in leads]), Lead.organization_id == organization.id)
        )

        db.execute(stmt)
        db.commit()

        successful_updates = [str(lead.id) for lead in leads]

    except Exception as e:
        db.rollback()
        logger.error(
            "Failed to bulk delete leads",
            extra={"organization_id": str(organization.id), "error": str(e)},
        )
        for lead in leads:
            errors.append({"lead_id": str(lead.id), "error": str(e)})

    # Check for leads that weren't found
    for lead_uuid in lead_uuids:
        if lead_uuid not in found_lead_ids:
            errors.append({"lead_id": str(lead_uuid), "error": "Lead not found or access denied"})

    # Send WebSocket notification
    if request.notify_websocket and successful_updates:
        background_tasks.add_task(
            _send_bulk_websocket_notification, organization.id, "bulk_delete", successful_updates
        )

    execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

    logger.info(
        "Bulk delete operation completed",
        extra={
            "organization_id": str(organization.id),
            "total_requested": len(request.lead_ids),
            "successful_updates": len(successful_updates),
            "failed_updates": len(errors),
            "execution_time_ms": execution_time,
        },
    )

    return BulkOperationResult(
        operation_type="bulk_delete",
        total_requested=len(request.lead_ids),
        successful_updates=len(successful_updates),
        failed_updates=len(errors),
        errors=errors,
        updated_lead_ids=successful_updates,
        execution_time_ms=execution_time,
    )
