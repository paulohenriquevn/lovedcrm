"""CRM Organization Integration Model.

Gerenciamento de integrações externas com isolamento organizacional.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    UUID as SA_UUID,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class IntegrationProvider(str, Enum):
    """Supported integration providers."""

    WHATSAPP = "whatsapp"
    GMAIL = "gmail"
    OUTLOOK = "outlook"
    TWILIO = "twilio"
    VOIP_PROVIDER = "voip_provider"
    EMAIL_PROVIDER = "email_provider"


class IntegrationStatus(str, Enum):
    """Integration status."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"


class OrganizationIntegration(Base):
    """Organization Integration model for external services.

    Manages external integrations with organization isolation.
    All integrations are scoped to organization_id.
    """

    __tablename__ = "organization_integrations"

    # Primary key
    id: UUID = Column(SA_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Organizational isolation (CRITICAL)
    organization_id: UUID = Column(
        SA_UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Integration details
    provider: IntegrationProvider = Column(String(50), nullable=False, index=True)
    encrypted_credentials: str = Column(Text, nullable=False)  # JSON encrypted with API keys
    webhook_secret: Optional[str] = Column(String(255), nullable=True)
    status: IntegrationStatus = Column(
        String(20), nullable=False, default=IntegrationStatus.PENDING, index=True
    )

    # Integration metadata and configuration
    integration_metadata: Dict[str, Any] = Column("metadata", JSONB, nullable=False, default=dict)

    # Multi-Provider Foundation Fields
    provider_name: str = Column(String(100), nullable=False, default="Default Provider")
    is_primary: bool = Column(Boolean, nullable=False, default=False)
    priority: int = Column(Integer, nullable=False, default=0)

    # Sync tracking
    last_sync_at: Optional[datetime] = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at: datetime = Column(
        DateTime(timezone=True), nullable=False, default=func.now(), index=True
    )
    updated_at: datetime = Column(
        DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now()
    )

    # Table constraints (Multi-Provider: removed unique constraint)
    __table_args__ = (
        # Priority must be non-negative
        CheckConstraint(priority >= 0, name="chk_organization_integrations_priority_positive"),
        # Status validation
        CheckConstraint(
            status.in_(
                [
                    IntegrationStatus.ACTIVE.value,
                    IntegrationStatus.INACTIVE.value,
                    IntegrationStatus.ERROR.value,
                    IntegrationStatus.PENDING.value,
                ]
            ),
            name="organization_integrations_status_check",
        ),
        {"extend_existing": True},
    )

    # Relationships
    organization = relationship("Organization", back_populates="integrations")

    def __repr__(self):
        """Return string representation of OrganizationIntegration."""
        return f"<OrganizationIntegration(id={self.id}, provider='{self.provider}', status='{self.status}', org_id={self.organization_id})>"

    @property
    def is_active(self) -> bool:
        """Check if integration is active."""
        return self.status == IntegrationStatus.ACTIVE

    @property
    def is_pending(self) -> bool:
        """Check if integration is pending setup."""
        return self.status == IntegrationStatus.PENDING

    @property
    def has_error(self) -> bool:
        """Check if integration has error status."""
        return self.status == IntegrationStatus.ERROR

    @property
    def is_primary_provider(self) -> bool:
        """Check if this is the primary provider for its type."""
        return self.is_primary

    @property
    def is_whatsapp(self) -> bool:
        """Check if this is a WhatsApp integration."""
        return self.provider == IntegrationProvider.WHATSAPP

    @property
    def is_email_provider(self) -> bool:
        """Check if this is an email provider integration."""
        return self.provider in [IntegrationProvider.GMAIL, IntegrationProvider.OUTLOOK]

    @property
    def is_voip_provider(self) -> bool:
        """Check if this is a VoIP provider integration."""
        return self.provider in [IntegrationProvider.TWILIO, IntegrationProvider.VOIP_PROVIDER]

    @property
    def needs_sync(self) -> bool:
        """Check if integration needs synchronization."""
        if not self.is_active:
            return False
        if not self.last_sync_at:
            return True
        # Check if last sync was more than 1 hour ago
        time_diff = datetime.utcnow() - self.last_sync_at.replace(tzinfo=None)
        return time_diff.total_seconds() > 3600

    def activate(self):
        """Activate the integration."""
        self.status = IntegrationStatus.ACTIVE
        self.updated_at = func.now()

    def deactivate(self):
        """Deactivate the integration."""
        self.status = IntegrationStatus.INACTIVE
        self.updated_at = func.now()

    def mark_error(self, error_details: Optional[Dict[str, Any]] = None):
        """Mark integration as having an error."""
        self.status = IntegrationStatus.ERROR
        self.updated_at = func.now()

        if error_details:
            if not self.integration_metadata:
                self.integration_metadata = {}
            self.integration_metadata["last_error"] = error_details
            self.integration_metadata["error_timestamp"] = datetime.utcnow().isoformat()

    def update_sync_timestamp(self):
        """Update last sync timestamp."""
        self.last_sync_at = func.now()
        self.updated_at = func.now()

    def set_webhook_secret(self, secret: str):
        """Set webhook secret for the integration."""
        self.webhook_secret = secret
        self.updated_at = func.now()

    def update_metadata(self, new_metadata: Dict[str, Any]):
        """Update integration metadata."""
        if not self.integration_metadata:
            self.integration_metadata = {}
        self.integration_metadata.update(new_metadata)
        self.updated_at = func.now()

    def clear_error_metadata(self):
        """Clear error-related metadata."""
        if self.integration_metadata and "last_error" in self.integration_metadata:
            del self.integration_metadata["last_error"]
        if self.integration_metadata and "error_timestamp" in self.integration_metadata:
            del self.integration_metadata["error_timestamp"]
        self.updated_at = func.now()

    async def switch_to_primary(self, db) -> bool:
        """Make this provider primary for its type and organization.

        Performs atomic hot-swap with zero downtime.

        Args:
            db: SQLAlchemy session for database operations

        Returns:
            bool: True if switch was successful

        Raises:
            Exception: If atomic operation fails
        """
        from sqlalchemy.orm import Session

        if not isinstance(db, Session):
            raise ValueError("db must be SQLAlchemy Session instance")

        try:
            # Remove primary flag from other providers of same type (atomic)
            db.query(OrganizationIntegration).filter(
                OrganizationIntegration.organization_id == self.organization_id,
                OrganizationIntegration.provider == self.provider,
                OrganizationIntegration.id != self.id,
            ).update({"is_primary": False})

            # Set this as primary
            self.is_primary = True
            self.status = IntegrationStatus.ACTIVE
            self.updated_at = func.now()

            db.commit()
            return True

        except Exception:
            db.rollback()
            raise

    @classmethod
    def get_primary_provider(
        cls, db, org_id: UUID, provider_type: "IntegrationProvider"
    ) -> Optional["OrganizationIntegration"]:
        """Get primary provider for organization and type.

        Args:
            db: SQLAlchemy session
            org_id: Organization UUID
            provider_type: Provider type enum

        Returns:
            Primary provider or None if not found
        """
        return (
            db.query(cls)
            .filter(
                cls.organization_id == org_id,
                cls.provider == provider_type,
                cls.is_primary == True,
                cls.status == IntegrationStatus.ACTIVE,
            )
            .first()
        )

    @classmethod
    def get_all_providers(
        cls, db, org_id: UUID, provider_type: "IntegrationProvider"
    ) -> List["OrganizationIntegration"]:
        """Get all providers for organization and type.

        Args:
            db: SQLAlchemy session
            org_id: Organization UUID
            provider_type: Provider type enum

        Returns:
            List of providers ordered by priority (desc) then created_at
        """
        return (
            db.query(cls)
            .filter(cls.organization_id == org_id, cls.provider == provider_type)
            .order_by(cls.priority.desc(), cls.created_at)
            .all()
        )

    @classmethod
    def create_whatsapp_integration(
        cls,
        organization_id: UUID,
        encrypted_credentials: str,
        webhook_secret: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        provider_name: str = "WhatsApp Default",
        is_primary: bool = False,
        priority: int = 0,
    ) -> "OrganizationIntegration":
        """Factory method for WhatsApp integration with multi-provider support."""
        return cls(
            organization_id=organization_id,
            provider=IntegrationProvider.WHATSAPP,
            encrypted_credentials=encrypted_credentials,
            webhook_secret=webhook_secret,
            status=IntegrationStatus.PENDING,
            integration_metadata=metadata or {},
            provider_name=provider_name,
            is_primary=is_primary,
            priority=priority,
        )

    @classmethod
    def create_email_integration(
        cls,
        organization_id: UUID,
        provider: str,  # 'gmail' or 'outlook'
        encrypted_credentials: str,
        metadata: Optional[Dict[str, Any]] = None,
        provider_name: Optional[str] = None,
        is_primary: bool = False,
        priority: int = 0,
    ) -> "OrganizationIntegration":
        """Factory method for email integrations with multi-provider support."""
        if provider not in ["gmail", "outlook"]:
            raise ValueError("Provider must be 'gmail' or 'outlook'")

        if provider_name is None:
            provider_name = f"{provider.title()} Default"

        return cls(
            organization_id=organization_id,
            provider=IntegrationProvider.GMAIL
            if provider == "gmail"
            else IntegrationProvider.OUTLOOK,
            encrypted_credentials=encrypted_credentials,
            status=IntegrationStatus.PENDING,
            integration_metadata=metadata or {},
            provider_name=provider_name,
            is_primary=is_primary,
            priority=priority,
        )

    @classmethod
    def create_voip_integration(
        cls,
        organization_id: UUID,
        provider: str,  # 'twilio' or 'voip_provider'
        encrypted_credentials: str,
        webhook_secret: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        provider_name: Optional[str] = None,
        is_primary: bool = False,
        priority: int = 0,
    ) -> "OrganizationIntegration":
        """Factory method for VoIP integrations with multi-provider support."""
        if provider not in ["twilio", "voip_provider"]:
            raise ValueError("Provider must be 'twilio' or 'voip_provider'")

        if provider_name is None:
            provider_name = f"{provider.title()} Default"

        return cls(
            organization_id=organization_id,
            provider=IntegrationProvider.TWILIO
            if provider == "twilio"
            else IntegrationProvider.VOIP_PROVIDER,
            encrypted_credentials=encrypted_credentials,
            webhook_secret=webhook_secret,
            status=IntegrationStatus.PENDING,
            integration_metadata=metadata or {},
            provider_name=provider_name,
            is_primary=is_primary,
            priority=priority,
        )
