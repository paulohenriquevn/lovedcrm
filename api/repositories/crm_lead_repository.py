"""CRM Lead Repository.

Repository pattern for Lead entity with organizational isolation.
"""

from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from api.models.crm_lead import Lead, PipelineStage
from api.repositories.base import SQLRepository


class CRMLeadRepository(SQLRepository[Lead]):
    """Repository for Lead operations with organizational scope."""

    def __init__(self, db: Session):
        """Initialize repository with database session."""
        super().__init__(db, Lead)

    def get_by_organization(self, org_id: UUID, skip: int = 0, limit: int = 100) -> List[Lead]:
        """Get all leads for organization with pagination."""
        return (
            self.session.query(Lead)
            .filter(Lead.organization_id == org_id)
            .order_by(Lead.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_organization_and_stage(self, org_id: UUID, stage: PipelineStage) -> List[Lead]:
        """Get leads by organization and pipeline stage."""
        return (
            self.session.query(Lead)
            .filter(and_(Lead.organization_id == org_id, Lead.stage == stage))
            .order_by(Lead.created_at.desc())
            .all()
        )

    def get_pipeline_stages_count(self, org_id: UUID) -> dict:
        """Get count of leads per pipeline stage for organization."""
        result = (
            self.session.query(Lead.stage, func.count(Lead.id).label("count"))
            .filter(Lead.organization_id == org_id)
            .group_by(Lead.stage)
            .all()
        )

        # Initialize with 0 counts for all stages
        stage_counts = {stage.value: 0 for stage in PipelineStage}

        # Update with actual counts
        for stage, count in result:
            stage_counts[stage] = count

        return stage_counts

    def get_by_organization_with_assigned_user(self, org_id: UUID, user_id: UUID) -> List[Lead]:
        """Get leads assigned to specific user in organization."""
        return (
            self.session.query(Lead)
            .filter(and_(Lead.organization_id == org_id, Lead.assigned_user_id == user_id))
            .order_by(Lead.created_at.desc())
            .all()
        )

    def search_by_organization(
        self, org_id: UUID, query: str, skip: int = 0, limit: int = 20
    ) -> List[Lead]:
        """Search leads by name, email or phone in organization."""
        search_filter = f"%{query.lower()}%"

        return (
            self.session.query(Lead)
            .filter(
                and_(
                    Lead.organization_id == org_id,
                    or_(
                        func.lower(Lead.name).like(search_filter),
                        func.lower(Lead.email).like(search_filter),
                        func.lower(Lead.phone).like(search_filter),
                    ),
                )
            )
            .order_by(Lead.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_organization(self, org_id: UUID) -> int:
        """Count total leads for organization."""
        return self.session.query(Lead).filter(Lead.organization_id == org_id).count()

    def get_by_id_and_org(self, lead_id: UUID, org_id: UUID) -> Optional[Lead]:
        """Get lead by ID with organization validation."""
        return (
            self.session.query(Lead)
            .filter(and_(Lead.id == lead_id, Lead.organization_id == org_id))
            .first()
        )

    def update_stage(self, lead_id: UUID, org_id: UUID, new_stage: PipelineStage) -> Optional[Lead]:
        """Update lead stage with organization validation."""
        lead = (
            self.session.query(Lead)
            .filter(and_(Lead.id == lead_id, Lead.organization_id == org_id))
            .first()
        )

        if not lead:
            return None

        lead.move_to_stage(new_stage)
        self.session.commit()
        self.session.refresh(lead)

        return lead

    def get_unique_sources(self, org_id: UUID) -> List[str]:
        """Get unique lead sources for organization."""
        result = (
            self.session.query(Lead.source)
            .filter(Lead.organization_id == org_id)
            .filter(Lead.source.isnot(None))
            .distinct()
            .all()
        )
        return [source[0] for source in result if source[0]]

    def get_assigned_users(self, org_id: UUID):
        """Get users with assigned leads in organization."""
        from api.models.user import User

        return (
            self.session.query(User)
            .join(Lead)
            .filter(Lead.organization_id == org_id)
            .filter(Lead.assigned_user_id == User.id)
            .distinct()
            .all()
        )

    def get_date_ranges(self, org_id: UUID) -> Dict[str, Optional[str]]:
        """Get min/max dates for organization leads."""
        result = (
            self.session.query(
                func.min(Lead.created_at).label("min_date"),
                func.max(Lead.created_at).label("max_date"),
            )
            .filter(Lead.organization_id == org_id)
            .first()
        )

        return {
            "earliest": result.min_date.isoformat() if result.min_date else None,
            "latest": result.max_date.isoformat() if result.max_date else None,
        }

    def get_unique_tags(self, org_id: UUID) -> List[str]:
        """Get unique tags used in organization."""
        leads = (
            self.session.query(Lead.tags)
            .filter(Lead.organization_id == org_id)
            .filter(Lead.tags.isnot(None))
            .all()
        )

        all_tags = set()
        for lead in leads:
            if lead.tags:
                all_tags.update(lead.tags)

        return list(all_tags)
