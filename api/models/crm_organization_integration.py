"""CRM Organization Integration Model.

Gerenciamento de integrações externas com isolamento organizacional.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    UUID as SA_UUID,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
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

    # Sync tracking
    last_sync_at: Optional[datetime] = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at: datetime = Column(
        DateTime(timezone=True), nullable=False, default=func.now(), index=True
    )
    updated_at: datetime = Column(
        DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now()
    )

    # Table constraints
    __table_args__ = (
        # One integration per provider per organization
        UniqueConstraint(
            "organization_id", "provider", name="uq_organization_integrations_org_provider"
        ),
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

    @classmethod
    def create_whatsapp_integration(
        cls,
        organization_id: UUID,
        encrypted_credentials: str,
        webhook_secret: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> "OrganizationIntegration":
        """Factory method for WhatsApp integration."""
        return cls(
            organization_id=organization_id,
            provider=IntegrationProvider.WHATSAPP,
            encrypted_credentials=encrypted_credentials,
            webhook_secret=webhook_secret,
            status=IntegrationStatus.PENDING,
            integration_metadata=metadata or {},
        )

    @classmethod
    def create_email_integration(
        cls,
        organization_id: UUID,
        provider: str,  # 'gmail' or 'outlook'
        encrypted_credentials: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> "OrganizationIntegration":
        """Factory method for email integrations."""
        if provider not in ["gmail", "outlook"]:
            raise ValueError("Provider must be 'gmail' or 'outlook'")

        return cls(
            organization_id=organization_id,
            provider=IntegrationProvider.GMAIL
            if provider == "gmail"
            else IntegrationProvider.OUTLOOK,
            encrypted_credentials=encrypted_credentials,
            status=IntegrationStatus.PENDING,
            integration_metadata=metadata or {},
        )

    @classmethod
    def create_voip_integration(
        cls,
        organization_id: UUID,
        provider: str,  # 'twilio' or 'voip_provider'
        encrypted_credentials: str,
        webhook_secret: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> "OrganizationIntegration":
        """Factory method for VoIP integrations."""
        if provider not in ["twilio", "voip_provider"]:
            raise ValueError("Provider must be 'twilio' or 'voip_provider'")

        return cls(
            organization_id=organization_id,
            provider=IntegrationProvider.TWILIO
            if provider == "twilio"
            else IntegrationProvider.VOIP_PROVIDER,
            encrypted_credentials=encrypted_credentials,
            webhook_secret=webhook_secret,
            status=IntegrationStatus.PENDING,
            integration_metadata=metadata or {},
        )
