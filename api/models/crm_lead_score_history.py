"""CRM Lead Score History Model.

Tracks historical changes in lead scores for trend analysis.
"""

import uuid
from decimal import Decimal

from sqlalchemy import DECIMAL, Column, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class LeadScoreHistory(Base):
    """Lead score history model for tracking score changes over time."""

    __tablename__ = "lead_score_history"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Score data
    score = Column(DECIMAL(5, 2), nullable=False, default=Decimal("0.00"))
    previous_score = Column(DECIMAL(5, 2), nullable=True)
    score_factors = Column(JSONB, nullable=False, default=dict)

    # Change tracking
    change_reason = Column("change_reason", nullable=True)  # e.g., "lead_updated", "stage_changed"
    changed_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), index=True)

    # Relationships
    lead = relationship("Lead", backref="score_history")
    organization = relationship("Organization")
    changed_by = relationship("User")

    # Performance indexes
    __table_args__ = (
        Index("idx_lead_score_history_lead_id", "lead_id"),
        Index("idx_lead_score_history_org_id", "organization_id"),
        Index("idx_lead_score_history_created_at", "created_at"),
        Index("idx_lead_score_history_lead_date", "lead_id", "created_at"),
        # Composite index for efficient queries
        Index("idx_lead_score_history_org_lead_date", "organization_id", "lead_id", "created_at"),
    )

    def __repr__(self) -> str:
        """String representation of LeadScoreHistory."""
        return f"<LeadScoreHistory(lead_id={self.lead_id}, score={self.score}, date={self.created_at})>"
