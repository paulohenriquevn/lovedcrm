"""CRM Lead Model.

Entidade principal do CRM com isolamento organizacional.
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    ARRAY,
    DECIMAL,
    UUID as SA_UUID,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class PipelineStage(str, Enum):
    """Pipeline stages for Brazilian agencies."""

    LEAD = "lead"
    CONTATO = "contato"
    PROPOSTA = "proposta"
    NEGOCIACAO = "negociacao"
    FECHADO = "fechado"


class Lead(Base):
    """Lead CRM model with organizational isolation.

    Core entity for Pipeline Kanban functionality.
    All leads are scoped to organization_id.
    """

    __tablename__ = "leads"

    # Primary key
    id: UUID = Column(SA_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Organizational isolation (CRITICAL)
    organization_id: UUID = Column(
        SA_UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Lead basic information
    name: str = Column(String(255), nullable=False)
    email: Optional[str] = Column(String(255), nullable=True, index=True)
    phone: Optional[str] = Column(String(50), nullable=True, index=True)

    # Pipeline stage (core CRM functionality)
    stage: PipelineStage = Column(
        String(50), nullable=False, default=PipelineStage.LEAD, index=True
    )

    # Lead source and value
    source: str = Column(String(100), default="web")
    estimated_value: Optional[Decimal] = Column(DECIMAL(12, 2), nullable=True)

    # Lead categorization
    tags: Optional[List[str]] = Column(ARRAY(Text), nullable=True)

    # Assignment and tracking
    assigned_user_id: Optional[UUID] = Column(
        SA_UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )

    # Last contact tracking
    last_contact_at: Optional[datetime] = Column(DateTime(timezone=True), nullable=True)
    last_contact_channel: Optional[str] = Column(String(20), nullable=True)

    # Additional information
    notes: Optional[str] = Column(Text, nullable=True)
    lead_metadata: dict = Column("lead_metadata", JSONB, nullable=False, default=dict)

    # Lead scoring system (Story 3.1)
    lead_score: Optional[Decimal] = Column(DECIMAL(5, 2), nullable=True, default=Decimal("0.00"))
    score_factors: dict = Column("score_factors", JSONB, nullable=False, default=dict)
    duplicate_check_hash: Optional[str] = Column(String(64), nullable=True, index=True)

    # Favorite functionality
    is_favorite: bool = Column("is_favorite", nullable=False, default=False, index=True)

    # Timestamps
    created_at: datetime = Column(
        DateTime(timezone=True), nullable=False, default=func.now(), index=True
    )
    updated_at: datetime = Column(
        DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now()
    )

    # Table constraints
    __table_args__ = (
        CheckConstraint(
            stage.in_(
                [
                    PipelineStage.LEAD.value,
                    PipelineStage.CONTATO.value,
                    PipelineStage.PROPOSTA.value,
                    PipelineStage.NEGOCIACAO.value,
                    PipelineStage.FECHADO.value,
                ]
            ),
            name="leads_stage_check",
        ),
        CheckConstraint(
            "lead_score IS NULL OR (lead_score >= 0 AND lead_score <= 100)",
            name="leads_score_range_check",
        ),
        # Composite indexes for performance
        {"extend_existing": True},
    )

    # Relationships
    organization = relationship("Organization", back_populates="leads")
    assigned_user = relationship("User", backref="assigned_leads")
    communications = relationship(
        "Communication", back_populates="lead", cascade="all, delete-orphan"
    )
    ai_summaries = relationship("AISummary", back_populates="lead", cascade="all, delete-orphan")

    def __repr__(self):
        """Return string representation of Lead."""
        return f"<Lead(id={self.id}, name='{self.name}', stage='{self.stage}', org_id={self.organization_id})>"

    @property
    def is_closed(self) -> bool:
        """Check if lead is in closed stage."""
        return self.stage == PipelineStage.FECHADO

    @property
    def days_in_current_stage(self) -> Optional[int]:
        """Calculate days in current stage."""
        if not self.updated_at:
            return None

        delta = datetime.now() - self.updated_at.replace(tzinfo=None)
        return delta.days

    def can_move_to_stage(self, new_stage: PipelineStage) -> bool:
        """Business logic for stage transitions.

        Implements realistic pipeline progression rules:
        - Sequential progression is always allowed (lead → contato → proposta → negociacao → fechado)
        - Backward movement is allowed for most stages
        - Direct jumps are allowed with some restrictions
        """
        current_stage = self.stage
        
        # If stage is not changing, allow it
        if current_stage == new_stage:
            return True
            
        # Define stage ordering for sequential progression
        stage_order = {
            PipelineStage.LEAD: 0,
            PipelineStage.CONTATO: 1,
            PipelineStage.PROPOSTA: 2,
            PipelineStage.NEGOCIACAO: 3,
            PipelineStage.FECHADO: 4,
        }
        
        current_order = stage_order[current_stage]
        new_order = stage_order[new_stage]
        
        # Always allow forward sequential progression
        if new_order == current_order + 1:
            return True
            
        # Always allow backward movement (except from FECHADO)
        if new_order < current_order and current_stage != PipelineStage.FECHADO:
            return True
            
        # Allow jumping forward, but with validation
        if new_order > current_order:
            # Cannot jump directly to FECHADO from LEAD
            if current_stage == PipelineStage.LEAD and new_stage == PipelineStage.FECHADO:
                return False
                
            # Need basic contact info for advanced stages
            if new_order >= 2:  # PROPOSTA or later
                if not self.email and not self.phone:
                    return False
                    
            return True
            
        # Special rule: Once FECHADO, can only reopen to NEGOCIACAO
        if current_stage == PipelineStage.FECHADO:
            return new_stage == PipelineStage.NEGOCIACAO
            
        # Default: allow transition
        return True

    def get_transition_requirements(self, new_stage: PipelineStage) -> List[str]:
        """Get requirements that must be met for stage transition.
        
        Returns list of requirements that are not met.
        """
        requirements = []
        
        if new_stage in [PipelineStage.PROPOSTA, PipelineStage.NEGOCIACAO, PipelineStage.FECHADO]:
            if not self.email and not self.phone:
                requirements.append("Contact information (email or phone) is required")
                
        if new_stage == PipelineStage.PROPOSTA:
            if not self.estimated_value:
                requirements.append("Estimated value should be defined for proposals")
                
        if new_stage == PipelineStage.FECHADO:
            if self.stage == PipelineStage.LEAD:
                requirements.append("Cannot close lead directly - must progress through pipeline")
                
        return requirements

    def move_to_stage(self, new_stage: PipelineStage, notes: Optional[str] = None):
        """Move lead to new stage with optional notes."""
        if not self.can_move_to_stage(new_stage):
            requirements = self.get_transition_requirements(new_stage)
            if requirements:
                error_msg = f"Cannot move lead from {self.stage} to {new_stage}. Requirements: {'; '.join(requirements)}"
            else:
                error_msg = f"Invalid transition from {self.stage} to {new_stage}"
            raise ValueError(error_msg)
            
        old_stage = self.stage
        self.stage = new_stage
        self.updated_at = func.now()

        if notes:
            if self.notes:
                self.notes += f"\n[{datetime.now()}] Stage {old_stage} → {new_stage}: {notes}"
            else:
                self.notes = f"[{datetime.now()}] Stage {old_stage} → {new_stage}: {notes}"
