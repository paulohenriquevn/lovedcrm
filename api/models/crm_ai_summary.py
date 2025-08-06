"""
CRM AI Summary Model
Resumos inteligentes de conversas com isolamento organizacional
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
    Integer,
    String,
    Text,
    UUID as SQLAlchemyUUID
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class AISentiment(str, Enum):
    """AI-detected sentiment"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    MIXED = "mixed"


class AISummary(Base):
    """
    AI Summary model for conversation analysis
    
    AI-powered conversation summaries functionality
    All summaries are scoped to organization_id
    """
    __tablename__ = "ai_summaries"
    
    # Primary key
    id: UUID = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Organizational isolation (CRITICAL)
    organization_id: UUID = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Conversation grouping
    conversation_id: UUID = Column(
        SQLAlchemyUUID(as_uuid=True),
        nullable=False,
        index=True
    )
    
    # Lead association (optional - summaries can be conversation-wide)
    lead_id: Optional[UUID] = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    
    # AI-generated summary content
    summary: str = Column(Text, nullable=False)
    sentiment: AISentiment = Column(String(20), nullable=True)
    next_actions: Optional[List[str]] = Column(ARRAY(Text), nullable=True)
    
    # AI model metadata
    confidence_score: Optional[Decimal] = Column(DECIMAL(3, 2), nullable=True)
    model_used: str = Column(String(50), nullable=False, default="gpt-4")
    tokens_used: Optional[int] = Column(Integer, nullable=True)
    
    # Timestamp
    created_at: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        default=func.now(),
        index=True
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="ai_summaries")
    lead = relationship("Lead", back_populates="ai_summaries")
    
    def __repr__(self):
        return f"<AISummary(id={self.id}, conversation_id={self.conversation_id}, sentiment='{self.sentiment}', org_id={self.organization_id})>"
    
    @property
    def has_lead(self) -> bool:
        """Check if summary is associated with a specific lead"""
        return self.lead_id is not None
    
    @property
    def is_high_confidence(self) -> bool:
        """Check if AI confidence is high (>0.8)"""
        if not self.confidence_score:
            return False
        return float(self.confidence_score) > 0.8
    
    @property
    def has_next_actions(self) -> bool:
        """Check if summary has suggested next actions"""
        return bool(self.next_actions)
    
    @property
    def action_count(self) -> int:
        """Count suggested next actions"""
        return len(self.next_actions) if self.next_actions else 0
    
    @property
    def is_positive_sentiment(self) -> bool:
        """Check if sentiment is positive"""
        return self.sentiment == AISentiment.POSITIVE
    
    @property
    def is_negative_sentiment(self) -> bool:
        """Check if sentiment is negative"""
        return self.sentiment == AISentiment.NEGATIVE
    
    def add_next_action(self, action: str):
        """Add a suggested next action"""
        if not self.next_actions:
            self.next_actions = []
        self.next_actions.append(action)
    
    def update_confidence(self, score: float):
        """Update confidence score with validation"""
        if 0.0 <= score <= 1.0:
            self.confidence_score = Decimal(str(round(score, 2)))
        else:
            raise ValueError("Confidence score must be between 0.0 and 1.0")
    
    @classmethod
    def create_conversation_summary(
        cls,
        organization_id: UUID,
        conversation_id: UUID,
        summary: str,
        model_used: str = "gpt-4",
        lead_id: Optional[UUID] = None,
        sentiment: Optional[AISentiment] = None,
        confidence_score: Optional[float] = None,
        tokens_used: Optional[int] = None,
        next_actions: Optional[List[str]] = None
    ) -> "AISummary":
        """Factory method for conversation summaries"""
        summary_obj = cls(
            organization_id=organization_id,
            conversation_id=conversation_id,
            lead_id=lead_id,
            summary=summary,
            sentiment=sentiment,
            model_used=model_used,
            tokens_used=tokens_used,
            next_actions=next_actions or []
        )
        
        if confidence_score is not None:
            summary_obj.update_confidence(confidence_score)
        
        return summary_obj
    
    def update_summary_content(
        self,
        new_summary: str,
        new_sentiment: Optional[AISentiment] = None,
        new_confidence: Optional[float] = None,
        new_actions: Optional[List[str]] = None
    ):
        """Update summary content and metadata"""
        self.summary = new_summary
        
        if new_sentiment:
            self.sentiment = new_sentiment
        
        if new_confidence is not None:
            self.update_confidence(new_confidence)
        
        if new_actions:
            self.next_actions = new_actions