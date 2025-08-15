"""Message Template Model for Templates System MVP.

Template CRUD para acelerar comunicação B2B com variable substitution.
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class MessageTemplate(Base):
    """Message template model with organizational isolation.

    Templates para agilizar comunicação com variable substitution.
    All templates are scoped to organization_id.
    """

    __tablename__ = "message_templates"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Organization isolation (REQUIRED for multi-tenancy)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)

    # Template details
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="general")
    content = Column(Text, nullable=False)
    variables = Column(JSONB, default=list)

    # Template status
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)

    # User tracking
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="message_templates")
    created_by = relationship("User")

    # Required template index pattern for performance
    __table_args__ = (
        Index("ix_message_templates_org_id", "organization_id"),
        Index("ix_message_templates_category", "organization_id", "category"),
        Index("ix_message_templates_active", "organization_id", "is_active"),
    )

    def __repr__(self) -> str:
        """String representation of MessageTemplate."""
        return f"<MessageTemplate(id={self.id}, name='{self.name}', category='{self.category}')>"
