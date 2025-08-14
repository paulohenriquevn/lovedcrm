"""CRM Lead Score History Service.

Service for managing lead score history and trend analysis.
"""

import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import and_, desc
from sqlalchemy.orm import Session

from api.models.crm_lead import Lead
from api.models.crm_lead_score_history import LeadScoreHistory
from api.models.organization import Organization

logger = logging.getLogger(__name__)


class LeadScoreHistoryService:
    """Service for lead score history management."""

    def __init__(self, db: Session):
        """Initialize the score history service."""
        self.db = db

    def record_score_change(
        self,
        lead: Lead,
        new_score: Decimal,
        change_reason: str,
        changed_by_user_id: Optional[UUID] = None,
        score_factors: Optional[Dict] = None,
    ) -> LeadScoreHistory:
        """Record a score change in history.
        
        Args:
            lead: The lead whose score changed
            new_score: New score value
            change_reason: Reason for the change (e.g., "lead_updated", "stage_changed")
            changed_by_user_id: User who triggered the change
            score_factors: Score factor breakdown
            
        Returns:
            Created score history record
        """
        try:
            # Get previous score for comparison
            previous_score = lead.lead_score

            # Create history record
            history_record = LeadScoreHistory(
                lead_id=lead.id,
                organization_id=lead.organization_id,
                score=new_score,
                previous_score=previous_score,
                score_factors=score_factors or {},
                change_reason=change_reason,
                changed_by_user_id=changed_by_user_id,
            )

            self.db.add(history_record)
            self.db.commit()
            self.db.refresh(history_record)

            logger.info(
                "Score change recorded",
                extra={
                    "lead_id": str(lead.id),
                    "organization_id": str(lead.organization_id),
                    "previous_score": float(previous_score) if previous_score else None,
                    "new_score": float(new_score),
                    "change_reason": change_reason,
                    "changed_by": str(changed_by_user_id) if changed_by_user_id else None,
                },
            )

            return history_record

        except Exception as e:
            logger.error(f"Error recording score change for lead {lead.id}: {e}")
            self.db.rollback()
            raise

    def get_score_history(
        self,
        organization: Organization,
        lead_id: UUID,
        days_back: int = 30,
        limit: int = 100,
    ) -> List[LeadScoreHistory]:
        """Get score history for a lead.
        
        Args:
            organization: Organization context
            lead_id: Lead ID
            days_back: Number of days to look back
            limit: Maximum records to return
            
        Returns:
            List of score history records ordered by date descending
        """
        start_date = datetime.utcnow() - timedelta(days=days_back)

        return (
            self.db.query(LeadScoreHistory)
            .filter(
                and_(
                    LeadScoreHistory.organization_id == organization.id,
                    LeadScoreHistory.lead_id == lead_id,
                    LeadScoreHistory.created_at >= start_date,
                )
            )
            .order_by(desc(LeadScoreHistory.created_at))
            .limit(limit)
            .all()
        )

    def get_formatted_score_trend(
        self,
        organization: Organization,
        lead_id: UUID,
        days_back: int = 30,
    ) -> List[Dict]:
        """Get formatted score trend data for visualization.
        
        Args:
            organization: Organization context
            lead_id: Lead ID
            days_back: Number of days to analyze
            
        Returns:
            List of score data points formatted for frontend visualization
        """
        history_records = self.get_score_history(organization, lead_id, days_back)

        # Convert to frontend format
        trend_data = []
        for record in reversed(history_records):  # Reverse to get chronological order
            trend_data.append({
                "date": record.created_at.isoformat(),
                "score": float(record.score),
                "previous_score": float(record.previous_score) if record.previous_score else None,
                "change_reason": record.change_reason,
                "factors": record.score_factors,
            })

        return trend_data

    def get_score_trend_summary(
        self,
        organization: Organization,
        lead_id: UUID,
        days_back: int = 30,
    ) -> Dict:
        """Get summary statistics for score trends.
        
        Args:
            organization: Organization context
            lead_id: Lead ID
            days_back: Number of days to analyze
            
        Returns:
            Dictionary with trend summary statistics
        """
        history_records = self.get_score_history(organization, lead_id, days_back)

        if not history_records:
            return {
                "trend_direction": "stable",
                "trend_value": 0,
                "total_changes": 0,
                "average_score": 0,
                "score_range": {"min": 0, "max": 0},
            }

        scores = [float(record.score) for record in history_records]
        latest_score = scores[0] if scores else 0
        oldest_score = scores[-1] if len(scores) > 1 else latest_score

        # Calculate trend
        trend_value = latest_score - oldest_score
        if trend_value > 2:
            trend_direction = "increasing"
        elif trend_value < -2:
            trend_direction = "decreasing"
        else:
            trend_direction = "stable"

        return {
            "trend_direction": trend_direction,
            "trend_value": round(trend_value, 1),
            "total_changes": len(history_records),
            "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
            "score_range": {
                "min": round(min(scores), 1) if scores else 0,
                "max": round(max(scores), 1) if scores else 0,
            },
        }