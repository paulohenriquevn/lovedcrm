"""🔍 Audit Service - Enhanced Multi-Tenant Audit Trail Management.

Service layer para gerenciamento avançado de audit logs com isolamento organizacional.
Utiliza o modelo AuditLog existente (api/models/crm_audit_log.py) com funcionalidades estendidas.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import and_, desc, func
from sqlalchemy.orm import Session

from api.models.crm_audit_log import AuditAction, AuditLog
from api.models.organization import Organization
from api.models.user import User

logger = logging.getLogger(__name__)


class AuditService:
    """Enhanced audit service for multi-tenant audit trail management."""

    def __init__(self, db: Session):
        """Initialize audit service with database session."""
        self.db = db

    # ============================================================================
    # CORE AUDIT LOGGING METHODS
    # ============================================================================

    async def log_role_change(
        self,
        org_id: UUID,
        target_user_id: UUID,
        old_role: str,
        new_role: str,
        manager_user_id: UUID,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Log role change event with enhanced context."""
        logger.info(
            "Logging role change",
            extra={
                "organization_id": str(org_id),
                "target_user_id": str(target_user_id),
                "old_role": old_role,
                "new_role": new_role,
                "manager_user_id": str(manager_user_id),
            }
        )

        audit_log = AuditLog.create_update_log(
            organization_id=org_id,
            table_name="organization_members",
            record_id=target_user_id,
            old_values={"role": old_role},
            new_values={"role": new_role, "changed_by": str(manager_user_id)},
            user_id=manager_user_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.db.add(audit_log)
        self.db.commit()
        return audit_log

    async def log_member_removal(
        self,
        org_id: UUID,
        removed_user_id: UUID,
        manager_user_id: UUID,
        removed_user_data: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Log member removal event with user context."""
        logger.info(
            "Logging member removal",
            extra={
                "organization_id": str(org_id),
                "removed_user_id": str(removed_user_id),
                "manager_user_id": str(manager_user_id),
            }
        )

        audit_log = AuditLog.create_delete_log(
            organization_id=org_id,
            table_name="organization_members",
            record_id=removed_user_id,
            old_values={
                **removed_user_data,
                "removed_by": str(manager_user_id),
                "removal_reason": "Manual removal by administrator",
            },
            user_id=manager_user_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.db.add(audit_log)
        self.db.commit()
        return audit_log

    async def log_organization_access(
        self,
        org_id: UUID,
        user_id: UUID,
        action: str,
        details: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Log organization access events (login, permissions, etc)."""
        logger.info(
            "Logging organization access",
            extra={
                "organization_id": str(org_id),
                "user_id": str(user_id),
                "action": action,
            }
        )

        audit_log = AuditLog.create_insert_log(
            organization_id=org_id,
            table_name="organization_access",
            record_id=user_id,
            new_values={
                "action": action,
                "details": details,
                "timestamp": datetime.utcnow().isoformat(),
            },
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.db.add(audit_log)
        self.db.commit()
        return audit_log

    # ============================================================================
    # AUDIT TRAIL RETRIEVAL METHODS
    # ============================================================================

    async def get_audit_trail(
        self,
        org_id: UUID,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[AuditLog]:
        """Get audit trail for organization with optional filters."""
        logger.info(
            "Retrieving audit trail",
            extra={
                "organization_id": str(org_id),
                "filters": filters,
                "limit": limit,
                "offset": offset,
            }
        )

        query = self.db.query(AuditLog).filter(AuditLog.organization_id == org_id)

        # Apply filters if provided
        if filters:
            if "table_name" in filters:
                query = query.filter(AuditLog.table_name == filters["table_name"])

            if "action" in filters:
                query = query.filter(AuditLog.action == filters["action"])

            if "user_id" in filters:
                query = query.filter(AuditLog.user_id == filters["user_id"])

            if "start_date" in filters:
                query = query.filter(AuditLog.created_at >= filters["start_date"])

            if "end_date" in filters:
                query = query.filter(AuditLog.created_at <= filters["end_date"])

        # Order by most recent first
        query = query.order_by(desc(AuditLog.created_at))

        # Apply pagination
        query = query.offset(offset).limit(limit)

        return query.all()

    async def get_security_events(
        self,
        org_id: UUID,
        timeframe_hours: int = 24,
        severity_level: str = "medium",
    ) -> Dict[str, Any]:
        """Get security events summary for organization."""
        logger.info(
            "Retrieving security events",
            extra={
                "organization_id": str(org_id),
                "timeframe_hours": timeframe_hours,
                "severity_level": severity_level,
            }
        )

        start_time = datetime.utcnow() - timedelta(hours=timeframe_hours)

        # Get recent audit logs
        recent_logs = (
            self.db.query(AuditLog)
            .filter(
                and_(
                    AuditLog.organization_id == org_id,
                    AuditLog.created_at >= start_time,
                )
            )
            .order_by(desc(AuditLog.created_at))
            .all()
        )

        # Analyze security events
        security_events = {
            "timeframe_hours": timeframe_hours,
            "start_time": start_time.isoformat(),
            "end_time": datetime.utcnow().isoformat(),
            "total_events": len(recent_logs),
            "events_by_action": {},
            "events_by_table": {},
            "suspicious_activities": [],
            "role_changes": [],
            "member_removals": [],
        }

        # Categorize events
        for log in recent_logs:
            # Count by action
            action = log.action.value
            security_events["events_by_action"][action] = (
                security_events["events_by_action"].get(action, 0) + 1
            )

            # Count by table
            table = log.table_name
            security_events["events_by_table"][table] = (
                security_events["events_by_table"].get(table, 0) + 1
            )

            # Identify specific security events
            if log.table_name == "organization_members":
                if log.action == AuditAction.UPDATE:
                    security_events["role_changes"].append({
                        "user_id": str(log.user_id),
                        "target_user_id": str(log.record_id),
                        "old_values": log.old_values,
                        "new_values": log.new_values,
                        "timestamp": log.created_at.isoformat(),
                    })
                elif log.action == AuditAction.DELETE:
                    security_events["member_removals"].append({
                        "user_id": str(log.user_id),
                        "removed_user_id": str(log.record_id),
                        "old_values": log.old_values,
                        "timestamp": log.created_at.isoformat(),
                    })

            # Flag suspicious activities (example criteria)
            if self._is_suspicious_activity(log):
                security_events["suspicious_activities"].append({
                    "log_id": str(log.id),
                    "action": log.action.value,
                    "table": log.table_name,
                    "user_id": str(log.user_id) if log.user_id else None,
                    "timestamp": log.created_at.isoformat(),
                    "reason": "Multiple rapid changes detected",
                })

        return security_events

    async def get_user_activity_summary(
        self,
        org_id: UUID,
        user_id: UUID,
        days: int = 30,
    ) -> Dict[str, Any]:
        """Get activity summary for specific user in organization."""
        logger.info(
            "Retrieving user activity summary",
            extra={
                "organization_id": str(org_id),
                "user_id": str(user_id),
                "days": days,
            }
        )

        start_date = datetime.utcnow() - timedelta(days=days)

        # Get user's audit logs
        user_logs = (
            self.db.query(AuditLog)
            .filter(
                and_(
                    AuditLog.organization_id == org_id,
                    AuditLog.user_id == user_id,
                    AuditLog.created_at >= start_date,
                )
            )
            .order_by(desc(AuditLog.created_at))
            .all()
        )

        # Calculate activity metrics
        activity_summary = {
            "user_id": str(user_id),
            "organization_id": str(org_id),
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat(),
            "total_actions": len(user_logs),
            "actions_by_type": {},
            "actions_by_table": {},
            "recent_activities": [],
            "most_active_days": {},
        }

        # Analyze activity patterns
        daily_counts = {}
        for log in user_logs:
            # Count by action type
            action = log.action.value
            activity_summary["actions_by_type"][action] = (
                activity_summary["actions_by_type"].get(action, 0) + 1
            )

            # Count by table
            table = log.table_name
            activity_summary["actions_by_table"][table] = (
                activity_summary["actions_by_table"].get(table, 0) + 1
            )

            # Track daily activity
            day_key = log.created_at.strftime("%Y-%m-%d")
            daily_counts[day_key] = daily_counts.get(day_key, 0) + 1

            # Add to recent activities (limit to 10 most recent)
            if len(activity_summary["recent_activities"]) < 10:
                activity_summary["recent_activities"].append({
                    "action": log.action.value,
                    "table": log.table_name,
                    "timestamp": log.created_at.isoformat(),
                    "summary": log.get_summary(),
                })

        # Find most active days
        activity_summary["most_active_days"] = dict(
            sorted(daily_counts.items(), key=lambda x: x[1], reverse=True)[:7]
        )

        return activity_summary

    # ============================================================================
    # ANALYTICS & REPORTING METHODS
    # ============================================================================

    async def get_audit_statistics(
        self,
        org_id: UUID,
        days: int = 30,
    ) -> Dict[str, Any]:
        """Get comprehensive audit statistics for organization."""
        start_date = datetime.utcnow() - timedelta(days=days)

        # Get total counts
        total_logs = (
            self.db.query(func.count(AuditLog.id))
            .filter(
                and_(
                    AuditLog.organization_id == org_id,
                    AuditLog.created_at >= start_date,
                )
            )
            .scalar()
        )

        # Get action distribution
        action_stats = (
            self.db.query(AuditLog.action, func.count(AuditLog.id))
            .filter(
                and_(
                    AuditLog.organization_id == org_id,
                    AuditLog.created_at >= start_date,
                )
            )
            .group_by(AuditLog.action)
            .all()
        )

        # Get table distribution
        table_stats = (
            self.db.query(AuditLog.table_name, func.count(AuditLog.id))
            .filter(
                and_(
                    AuditLog.organization_id == org_id,
                    AuditLog.created_at >= start_date,
                )
            )
            .group_by(AuditLog.table_name)
            .all()
        )

        # Get user activity
        user_stats = (
            self.db.query(AuditLog.user_id, func.count(AuditLog.id))
            .filter(
                and_(
                    AuditLog.organization_id == org_id,
                    AuditLog.created_at >= start_date,
                    AuditLog.user_id.isnot(None),
                )
            )
            .group_by(AuditLog.user_id)
            .order_by(desc(func.count(AuditLog.id)))
            .limit(10)
            .all()
        )

        return {
            "organization_id": str(org_id),
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat(),
            "total_audit_logs": total_logs,
            "actions_distribution": {str(action): count for action, count in action_stats},
            "tables_distribution": {table: count for table, count in table_stats},
            "most_active_users": [
                {"user_id": str(user_id), "action_count": count}
                for user_id, count in user_stats
            ],
        }

    # ============================================================================
    # UTILITY METHODS
    # ============================================================================

    def _is_suspicious_activity(self, log: AuditLog) -> bool:
        """Determine if an audit log represents suspicious activity."""
        # Example criteria - can be enhanced based on security requirements
        suspicious_conditions = [
            # Multiple role changes in short time
            log.table_name == "organization_members" and log.action == AuditAction.UPDATE,
            # Bulk deletions
            log.action == AuditAction.DELETE and log.table_name in ["leads", "communications"],
        ]

        # Check for rapid sequential actions (would need additional context)
        # This is a simplified check - real implementation would analyze patterns
        return any(suspicious_conditions)

    async def cleanup_old_audit_logs(
        self,
        org_id: UUID,
        retention_days: int = 365,
        dry_run: bool = True,
    ) -> Dict[str, Any]:
        """Clean up old audit logs beyond retention period."""
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)

        # Find old logs
        old_logs_query = self.db.query(AuditLog).filter(
            and_(
                AuditLog.organization_id == org_id,
                AuditLog.created_at < cutoff_date,
            )
        )

        count = old_logs_query.count()

        if not dry_run and count > 0:
            # Delete old logs
            old_logs_query.delete()
            self.db.commit()
            logger.info(
                f"Deleted {count} old audit logs for organization {org_id}",
                extra={"organization_id": str(org_id), "deleted_count": count}
            )

        return {
            "organization_id": str(org_id),
            "retention_days": retention_days,
            "cutoff_date": cutoff_date.isoformat(),
            "logs_to_delete": count,
            "dry_run": dry_run,
            "deleted": count if not dry_run else 0,
        }

    async def verify_audit_integrity(
        self,
        org_id: UUID,
    ) -> Dict[str, Any]:
        """Verify audit log integrity for organization."""
        # Check for gaps, inconsistencies, etc.
        total_logs = (
            self.db.query(func.count(AuditLog.id))
            .filter(AuditLog.organization_id == org_id)
            .scalar()
        )

        # Check for orphaned logs (referencing non-existent records)
        integrity_issues = []

        # Verify organization exists
        org_exists = self.db.query(Organization).filter(Organization.id == org_id).first()
        if not org_exists:
            integrity_issues.append("Organization reference is invalid")

        # Check user references
        logs_with_users = (
            self.db.query(AuditLog.user_id)
            .filter(
                and_(
                    AuditLog.organization_id == org_id,
                    AuditLog.user_id.isnot(None),
                )
            )
            .distinct()
            .all()
        )

        for (user_id,) in logs_with_users:
            user_exists = self.db.query(User).filter(User.id == user_id).first()
            if not user_exists:
                integrity_issues.append(f"User {user_id} referenced in audit logs but doesn't exist")

        return {
            "organization_id": str(org_id),
            "total_logs": total_logs,
            "integrity_issues": integrity_issues,
            "is_healthy": len(integrity_issues) == 0,
            "checked_at": datetime.utcnow().isoformat(),
        }