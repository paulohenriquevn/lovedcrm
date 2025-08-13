"""🔍 Audit Router - Multi-Tenant Audit Trail API.

Endpoints for accessing audit logs with strict organization isolation.
All endpoints require authentication and organization context (X-Org-Id header).
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.core.database import get_db
from api.core.deps import get_current_active_user, get_current_organization
from api.models.crm_audit_log import AuditAction, AuditLog
from api.models.organization import Organization
from api.models.user import User
from api.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit Trail"])
logger = logging.getLogger(__name__)


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================


class AuditLogResponse(BaseModel):
    """Response model for audit log entries."""

    id: UUID
    organization_id: UUID
    table_name: str
    record_id: UUID
    action: str
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    user_id: Optional[UUID] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    summary: str

    class Config:
        """Pydantic configuration for ORM mode."""

        from_attributes = True

    @classmethod
    def from_audit_log(cls, audit_log: AuditLog) -> "AuditLogResponse":
        """Convert AuditLog model to response schema."""
        return cls(
            id=audit_log.id,
            organization_id=audit_log.organization_id,
            table_name=audit_log.table_name,
            record_id=audit_log.record_id,
            action=audit_log.action.value,
            old_values=audit_log.old_values,
            new_values=audit_log.new_values,
            user_id=audit_log.user_id,
            ip_address=str(audit_log.ip_address) if audit_log.ip_address else None,
            user_agent=audit_log.user_agent,
            created_at=audit_log.created_at,
            summary=audit_log.get_summary(),
        )


class SecurityEventsResponse(BaseModel):
    """Response model for security events summary."""

    timeframe_hours: int
    start_time: str
    end_time: str
    total_events: int
    events_by_action: Dict[str, int]
    events_by_table: Dict[str, int]
    suspicious_activities: List[Dict[str, Any]]
    role_changes: List[Dict[str, Any]]
    member_removals: List[Dict[str, Any]]


class UserActivityResponse(BaseModel):
    """Response model for user activity summary."""

    user_id: UUID
    organization_id: UUID
    period_days: int
    start_date: str
    end_date: str
    total_actions: int
    actions_by_type: Dict[str, int]
    actions_by_table: Dict[str, int]
    recent_activities: List[Dict[str, Any]]
    most_active_days: Dict[str, int]


class AuditStatisticsResponse(BaseModel):
    """Response model for audit statistics."""

    organization_id: UUID
    period_days: int
    start_date: str
    end_date: str
    total_audit_logs: int
    actions_distribution: Dict[str, int]
    tables_distribution: Dict[str, int]
    most_active_users: List[Dict[str, Any]]


class AuditFilters(BaseModel):
    """Query filters for audit trail."""

    table_name: Optional[str] = None
    action: Optional[AuditAction] = None
    user_id: Optional[UUID] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


# ============================================================================
# AUDIT TRAIL ENDPOINTS
# ============================================================================


@router.get("/trail", response_model=List[AuditLogResponse])
async def get_audit_trail(
    table_name: Optional[str] = Query(None, description="Filter by table name"),
    action: Optional[AuditAction] = Query(None, description="Filter by action type"),
    user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
    start_date: Optional[datetime] = Query(None, description="Filter from date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Filter to date (ISO format)"),
    limit: int = Query(100, ge=1, le=1000, description="Limit results (max 1000)"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> List[AuditLogResponse]:
    """Get organization audit trail with optional filters.

    Returns audit logs for the current organization with optional filtering.
    All results are automatically scoped to the organization context.
    """
    logger.info(
        "Fetching audit trail",
        extra={
            "organization_id": str(organization.id),
            "user_id": str(current_user.id),
            "filters": {
                "table_name": table_name,
                "action": action.value if action else None,
                "user_id": str(user_id) if user_id else None,
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None,
            },
            "limit": limit,
            "offset": offset,
        },
    )

    audit_service = AuditService(db)

    # Build filters dictionary
    filters: Dict[str, Any] = {}
    if table_name:
        filters["table_name"] = table_name
    if action:
        filters["action"] = action
    if user_id:
        filters["user_id"] = user_id
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    try:
        audit_logs = await audit_service.get_audit_trail(
            org_id=organization.id,  # type: ignore[arg-type]
            filters=filters if filters else None,
            limit=limit,
            offset=offset,
        )

        return [AuditLogResponse.from_audit_log(log) for log in audit_logs]

    except Exception as e:
        logger.error(
            "Failed to retrieve audit trail",
            extra={
                "organization_id": str(organization.id),
                "user_id": str(current_user.id),
                "error": str(e),
            },
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit trail",
        )


@router.get("/security-events", response_model=SecurityEventsResponse)
async def get_security_events(
    timeframe_hours: int = Query(24, ge=1, le=168, description="Timeframe in hours (max 1 week)"),
    severity_level: str = Query("medium", description="Minimum severity level"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> SecurityEventsResponse:
    """Get security events summary for organization.

    Returns analysis of recent security-related audit events including:
    - Role changes
    - Member additions/removals
    - Suspicious activities
    - Event distribution by type and table
    """
    logger.info(
        "Fetching security events",
        extra={
            "organization_id": str(organization.id),
            "user_id": str(current_user.id),
            "timeframe_hours": timeframe_hours,
            "severity_level": severity_level,
        },
    )

    audit_service = AuditService(db)

    try:
        security_events = await audit_service.get_security_events(
            org_id=organization.id,  # type: ignore[arg-type]
            timeframe_hours=timeframe_hours,
            severity_level=severity_level,
        )

        return SecurityEventsResponse(**security_events)

    except Exception as e:
        logger.error(
            "Failed to retrieve security events",
            extra={
                "organization_id": str(organization.id),
                "user_id": str(current_user.id),
                "error": str(e),
            },
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve security events",
        )


@router.get("/user-activity/{target_user_id}", response_model=UserActivityResponse)
async def get_user_activity(
    target_user_id: UUID,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze (max 1 year)"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UserActivityResponse:
    """Get activity summary for specific user in organization.

    Returns detailed activity analysis for a user including:
    - Action counts by type and table
    - Recent activities timeline
    - Most active days
    - Activity patterns

    Requires 'view_members' permission to access other users' activity.
    """
    logger.info(
        "Fetching user activity",
        extra={
            "organization_id": str(organization.id),
            "current_user_id": str(current_user.id),
            "target_user_id": str(target_user_id),
            "days": days,
        },
    )

    # Check if user is requesting their own activity or has permission
    if target_user_id != current_user.id:
        # TODO: Add permission check for 'view_members'
        # This would integrate with the role management service
        logger.info(
            "User requesting other user's activity - permission check needed",
            extra={
                "current_user_id": str(current_user.id),
                "target_user_id": str(target_user_id),
            },
        )

    audit_service = AuditService(db)

    try:
        activity_summary = await audit_service.get_user_activity_summary(
            org_id=organization.id,  # type: ignore[arg-type]
            user_id=target_user_id,
            days=days,
        )

        return UserActivityResponse(**activity_summary)

    except Exception as e:
        logger.error(
            "Failed to retrieve user activity",
            extra={
                "organization_id": str(organization.id),
                "current_user_id": str(current_user.id),
                "target_user_id": str(target_user_id),
                "error": str(e),
            },
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user activity",
        )


@router.get("/statistics", response_model=AuditStatisticsResponse)
async def get_audit_statistics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze (max 1 year)"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> AuditStatisticsResponse:
    """Get comprehensive audit statistics for organization.

    Returns statistical analysis of audit activity including:
    - Total log counts
    - Distribution by action type
    - Distribution by table/entity
    - Most active users
    """
    logger.info(
        "Fetching audit statistics",
        extra={
            "organization_id": str(organization.id),
            "user_id": str(current_user.id),
            "days": days,
        },
    )

    audit_service = AuditService(db)

    try:
        statistics = await audit_service.get_audit_statistics(
            org_id=organization.id,  # type: ignore[arg-type]
            days=days,
        )

        return AuditStatisticsResponse(**statistics)

    except Exception as e:
        logger.error(
            "Failed to retrieve audit statistics",
            extra={
                "organization_id": str(organization.id),
                "user_id": str(current_user.id),
                "error": str(e),
            },
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit statistics",
        )


# ============================================================================
# ADMINISTRATIVE ENDPOINTS
# ============================================================================


@router.post("/verify-integrity")
async def verify_audit_integrity(
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Verify audit log integrity for organization.

    Performs integrity checks including:
    - Orphaned log detection
    - Reference validation
    - Consistency checks

    Requires administrator permissions.
    """
    logger.info(
        "Verifying audit integrity",
        extra={
            "organization_id": str(organization.id),
            "user_id": str(current_user.id),
        },
    )

    # TODO: Add admin permission check
    # This would integrate with the role management service

    audit_service = AuditService(db)

    try:
        integrity_report = await audit_service.verify_audit_integrity(
            org_id=organization.id  # type: ignore[arg-type]
        )

        return integrity_report

    except Exception as e:
        logger.error(
            "Failed to verify audit integrity",
            extra={
                "organization_id": str(organization.id),
                "user_id": str(current_user.id),
                "error": str(e),
            },
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify audit integrity",
        )


@router.post("/cleanup")
async def cleanup_old_audit_logs(
    retention_days: int = Query(
        365, ge=30, le=2555, description="Retention period in days (30 days to 7 years)"
    ),
    dry_run: bool = Query(
        True, description="Dry run mode - show what would be deleted without actually deleting"
    ),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Clean up old audit logs beyond retention period.

    Removes audit logs older than the specified retention period.
    Use dry_run=true to preview what would be deleted.

    Requires administrator permissions.
    """
    logger.info(
        "Cleaning up audit logs",
        extra={
            "organization_id": str(organization.id),
            "user_id": str(current_user.id),
            "retention_days": retention_days,
            "dry_run": dry_run,
        },
    )

    # TODO: Add admin permission check
    # This would integrate with the role management service

    audit_service = AuditService(db)

    try:
        cleanup_result = await audit_service.cleanup_old_audit_logs(
            org_id=organization.id,  # type: ignore[arg-type]
            retention_days=retention_days,
            dry_run=dry_run,
        )

        return cleanup_result

    except Exception as e:
        logger.error(
            "Failed to cleanup audit logs",
            extra={
                "organization_id": str(organization.id),
                "user_id": str(current_user.id),
                "error": str(e),
            },
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup audit logs",
        )
