"""Organization and membership models for multi-tenant system."""
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class Organization(Base):
    """Organization model for multi-tenant system."""

    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)

    # Owner relationship
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="owned_organizations")

    # Settings
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    members = relationship("OrganizationMember", back_populates="organization")
    invites = relationship("OrganizationInvite", back_populates="organization")
    
    # CRM Relationships
    leads = relationship("Lead", back_populates="organization", cascade="all, delete-orphan")
    communications = relationship("Communication", back_populates="organization", cascade="all, delete-orphan")
    ai_summaries = relationship("AISummary", back_populates="organization", cascade="all, delete-orphan")
    integrations = relationship("OrganizationIntegration", back_populates="organization", cascade="all, delete-orphan")
    file_attachments = relationship("FileAttachment", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")

    # Performance indexes
    __table_args__ = (
        Index("idx_organizations_slug", "slug"),
        Index("idx_organizations_owner_id", "owner_id"),
        Index("idx_organizations_is_active", "is_active"),
        Index("idx_organizations_created_at", "created_at"),
        Index("idx_organizations_name", "name"),
        # Composite indexes for common queries
        Index("idx_organizations_owner_active", "owner_id", "is_active"),
        Index("idx_organizations_active_created", "is_active", "created_at"),
    )

    def __repr__(self) -> str:
        """String representation of Organization."""
        return f"<Organization(name='{self.name}', slug='{self.slug}')>"


class OrganizationMember(Base):
    """Organization membership model linking users to organizations with roles."""

    __tablename__ = "organization_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Role field for compatibility with services
    role = Column(String(50), nullable=False, default="member")
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="organization_memberships")
    organization = relationship("Organization", back_populates="members")

    # Performance indexes - critical for multi-tenant authentication
    __table_args__ = (
        Index("idx_org_members_user_id", "user_id"),
        Index("idx_org_members_organization_id", "organization_id"),
        Index("idx_org_members_created_at", "created_at"),
        Index("idx_org_members_is_active", "is_active"),
        Index("idx_org_members_role", "role"),
        # Composite indexes for common queries
        Index("idx_org_members_user_org", "user_id", "organization_id"),
        Index("idx_org_members_active_role", "is_active", "role"),
        # Unique constraint to prevent duplicate memberships
        Index("idx_org_members_unique", "user_id", "organization_id", unique=True),
    )

    def __repr__(self) -> str:
        """String representation of OrganizationMember."""
        return f"<OrganizationMember(user_id='{self.user_id}', org_id='{self.organization_id}')>"
