"""
CRM Lead Model
Entidade principal do CRM com isolamento organizacional
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    ARRAY, 
    DECIMAL, 
    Column, 
    DateTime, 
    ForeignKey, 
    String, 
    Text,
    UUID as SQLAlchemyUUID,
    CheckConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class PipelineStage(str, Enum):
    """Pipeline stages for Brazilian agencies"""
    LEAD = "lead"
    CONTATO = "contato" 
    PROPOSTA = "proposta"
    NEGOCIACAO = "negociacao"
    FECHADO = "fechado"


class Lead(Base):
    """
    Lead CRM model with organizational isolation
    
    Core entity for Pipeline Kanban functionality
    All leads are scoped to organization_id
    """
    __tablename__ = "leads"
    
    # Primary key
    id: UUID = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Organizational isolation (CRITICAL)
    organization_id: UUID = Column(
        SQLAlchemyUUID(as_uuid=True), 
        ForeignKey("organizations.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    
    # Lead basic information
    name: str = Column(String(255), nullable=False)
    email: Optional[str] = Column(String(255), nullable=True, index=True)
    phone: Optional[str] = Column(String(50), nullable=True, index=True)
    
    # Pipeline stage (core CRM functionality)
    stage: PipelineStage = Column(
        String(50), 
        nullable=False, 
        default=PipelineStage.LEAD,
        index=True
    )
    
    # Lead source and value
    source: str = Column(String(100), default="web")
    estimated_value: Optional[Decimal] = Column(DECIMAL(12, 2), nullable=True)
    
    # Lead categorization
    tags: Optional[List[str]] = Column(ARRAY(Text), nullable=True)
    
    # Assignment and tracking
    assigned_user_id: Optional[UUID] = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )
    
    # Last contact tracking
    last_contact_at: Optional[datetime] = Column(DateTime(timezone=True), nullable=True)
    last_contact_channel: Optional[str] = Column(String(20), nullable=True)
    
    # Additional information
    notes: Optional[str] = Column(Text, nullable=True)
    lead_metadata: dict = Column("metadata", JSONB, nullable=False, default=dict)
    
    # Favorite functionality  
    is_favorite: bool = Column("is_favorite", nullable=False, default=False, index=True)
    
    # Timestamps
    created_at: datetime = Column(
        DateTime(timezone=True), 
        nullable=False, 
        default=func.now(),
        index=True
    )
    updated_at: datetime = Column(
        DateTime(timezone=True), 
        nullable=False, 
        default=func.now(),
        onupdate=func.now()
    )
    
    # Table constraints
    __table_args__ = (
        CheckConstraint(
            stage.in_([
                PipelineStage.LEAD.value,
                PipelineStage.CONTATO.value,
                PipelineStage.PROPOSTA.value,
                PipelineStage.NEGOCIACAO.value,
                PipelineStage.FECHADO.value
            ]),
            name='leads_stage_check'
        ),
        # Composite indexes for performance
        {'extend_existing': True}
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="leads")
    assigned_user = relationship("User", backref="assigned_leads")
    communications = relationship(
        "Communication", 
        back_populates="lead", 
        cascade="all, delete-orphan"
    )
    ai_summaries = relationship(
        "AISummary", 
        back_populates="lead", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Lead(id={self.id}, name='{self.name}', stage='{self.stage}', org_id={self.organization_id})>"
    
    @property
    def is_closed(self) -> bool:
        """Check if lead is in closed stage"""
        return self.stage == PipelineStage.FECHADO
    
    @property
    def days_in_current_stage(self) -> Optional[int]:
        """Calculate days in current stage"""
        if not self.updated_at:
            return None
        
        delta = datetime.now() - self.updated_at.replace(tzinfo=None)
        return delta.days
    
    def can_move_to_stage(self, new_stage: PipelineStage) -> bool:
        """
        Business logic for stage transitions
        Can be extended with more complex rules
        """
        # For now, allow any stage transition
        # TODO: Add business rules if needed
        return True
        
    def move_to_stage(self, new_stage: PipelineStage, notes: Optional[str] = None):
        """Move lead to new stage with optional notes"""
        if self.can_move_to_stage(new_stage):
            old_stage = self.stage
            self.stage = new_stage
            self.updated_at = func.now()
            
            if notes:
                if self.notes:
                    self.notes += f"\n[{datetime.now()}] Stage {old_stage} → {new_stage}: {notes}"
                else:
                    self.notes = f"[{datetime.now()}] Stage {old_stage} → {new_stage}: {notes}"
        else:
            raise ValueError(f"Cannot move lead from {self.stage} to {new_stage}")