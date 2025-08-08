"""Essential models for multi-tenant SaaS."""
# Template foundation models (DO NOT MODIFY)
from .billing import OrganizationSubscription, Plan
from .crm_ai_summary import AISentiment, AISummary
from .crm_audit_log import AuditAction, AuditLog
from .crm_communication import Communication, CommunicationChannel, CommunicationDirection
from .crm_file_attachment import FileAttachment, StorageType

# CRM business models (YOUR EXTENSION)
from .crm_lead import Lead, PipelineStage
from .crm_organization_integration import (
    IntegrationProvider,
    IntegrationStatus,
    OrganizationIntegration,
)
from .organization import Organization, OrganizationMember
from .organization_invite import InviteStatus, OrganizationInvite, OrganizationRole
from .user import User
from .user_preferences import UserPreferences
from .user_session import UserSession
from .user_two_factor import UserTwoFactor

__all__ = [
    # Template foundation models
    "User",
    "Organization",
    "OrganizationMember",
    "OrganizationInvite",
    "InviteStatus",
    "OrganizationRole",
    "Plan",
    "OrganizationSubscription",
    "UserSession",
    "UserTwoFactor",
    "UserPreferences",
    # CRM business models
    "Lead",
    "PipelineStage",
    "Communication",
    "CommunicationChannel",
    "CommunicationDirection",
    "AISummary",
    "AISentiment",
    "OrganizationIntegration",
    "IntegrationProvider",
    "IntegrationStatus",
    "FileAttachment",
    "StorageType",
    "AuditLog",
    "AuditAction",
]
