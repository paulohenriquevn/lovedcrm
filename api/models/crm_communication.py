"""
CRM Communication Model
Timeline unificada de comunicações com isolamento organizacional
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4

from sqlalchemy import (
    Column,
    DateTime, 
    ForeignKey,
    String,
    Text,
    UUID as SQLAlchemyUUID
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class CommunicationChannel(str, Enum):
    """Communication channels supported"""
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    VOIP = "voip"
    NOTE = "note"
    SMS = "sms"


class CommunicationDirection(str, Enum):
    """Communication direction"""
    INBOUND = "inbound"   # Cliente para agência
    OUTBOUND = "outbound"  # Agência para cliente


class Communication(Base):
    """
    Communication model for unified timeline
    
    Central entity for Timeline Communication functionality
    All communications are scoped to organization_id
    """
    __tablename__ = "communications"
    
    # Primary key
    id: UUID = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Organizational isolation (CRITICAL)
    organization_id: UUID = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Lead association (required)
    lead_id: UUID = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Communication metadata
    channel: CommunicationChannel = Column(String(20), nullable=False, index=True)
    direction: CommunicationDirection = Column(String(10), nullable=False)
    
    # Message content
    content: str = Column(Text, nullable=False)
    subject: Optional[str] = Column(String(500), nullable=True)  # For emails
    
    # Structured metadata and attachments
    comm_metadata: Dict[str, Any] = Column(JSONB, nullable=False, default=dict)
    attachments: List[Dict[str, Any]] = Column(JSONB, nullable=False, default=list)
    
    # External system integration
    external_id: Optional[str] = Column(String(255), nullable=True, index=True)  # WhatsApp msg ID, Email ID, etc
    
    # Status tracking
    status: str = Column(String(20), nullable=False, default="delivered")
    
    # Timing
    sent_at: Optional[datetime] = Column(DateTime(timezone=True), nullable=True, index=True)
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
    
    # Relationships
    organization = relationship("Organization", back_populates="communications")
    lead = relationship("Lead", back_populates="communications")
    file_attachments = relationship(
        "FileAttachment",
        back_populates="communication",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Communication(id={self.id}, channel='{self.channel}', direction='{self.direction}', lead_id={self.lead_id})>"
    
    @property
    def is_inbound(self) -> bool:
        """Check if communication is from client to agency"""
        return self.direction == CommunicationDirection.INBOUND
    
    @property
    def is_outbound(self) -> bool:
        """Check if communication is from agency to client"""
        return self.direction == CommunicationDirection.OUTBOUND
        
    @property
    def has_attachments(self) -> bool:
        """Check if communication has attachments"""
        return bool(self.attachments) or bool(self.file_attachments)
    
    @property
    def attachment_count(self) -> int:
        """Count total attachments"""
        json_attachments = len(self.attachments) if self.attachments else 0
        file_attachments = len(self.file_attachments) if self.file_attachments else 0
        return json_attachments + file_attachments
    
    def add_attachment_metadata(self, attachment_data: Dict[str, Any]):
        """Add attachment metadata to JSONB field"""
        if not self.attachments:
            self.attachments = []
        self.attachments.append(attachment_data)
        
    def set_external_metadata(self, provider_data: Dict[str, Any]):
        """Set metadata from external provider (WhatsApp, Email, etc)"""
        if not self.comm_metadata:
            self.comm_metadata = {}
        self.comm_metadata.update(provider_data)
        
    @classmethod
    def create_whatsapp_message(
        cls,
        organization_id: UUID,
        lead_id: UUID,
        content: str,
        direction: CommunicationDirection,
        whatsapp_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> "Communication":
        """Factory method for WhatsApp messages"""
        return cls(
            organization_id=organization_id,
            lead_id=lead_id,
            channel=CommunicationChannel.WHATSAPP,
            direction=direction,
            content=content,
            external_id=whatsapp_id,
            comm_metadata=metadata or {},
            sent_at=func.now()
        )
    
    @classmethod
    def create_email_message(
        cls,
        organization_id: UUID,
        lead_id: UUID,
        content: str,
        subject: str,
        direction: CommunicationDirection,
        email_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> "Communication":
        """Factory method for Email messages"""
        return cls(
            organization_id=organization_id,
            lead_id=lead_id,
            channel=CommunicationChannel.EMAIL,
            direction=direction,
            content=content,
            subject=subject,
            external_id=email_id,
            comm_metadata=metadata or {},
            sent_at=func.now()
        )
        
    @classmethod
    def create_note(
        cls,
        organization_id: UUID,
        lead_id: UUID,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> "Communication":
        """Factory method for internal notes"""
        return cls(
            organization_id=organization_id,
            lead_id=lead_id,
            channel=CommunicationChannel.NOTE,
            direction=CommunicationDirection.OUTBOUND,  # Notes are always outbound (internal)
            content=content,
            comm_metadata=metadata or {},
            sent_at=func.now()
        )