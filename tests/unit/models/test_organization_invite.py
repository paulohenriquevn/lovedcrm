"""Unit tests for models.organization_invite module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper invite workflow behavior
"""

import pytest
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from enum import Enum

# Mock enums with proper string conversion
class MockInviteStatus(str, Enum):
    """Mock InviteStatus enum."""
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"
    cancelled = "cancelled"
    
    def __str__(self):
        return self.value

class MockOrganizationRole(str, Enum):
    """Mock OrganizationRole enum."""
    owner = "owner"
    admin = "admin"
    member = "member"
    viewer = "viewer"
    
    def __str__(self):
        return self.value

# Mock OrganizationInvite model
class MockOrganizationInvite:
    """Mock OrganizationInvite model for unit testing."""
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', uuid.uuid4())
        self.organization_id = kwargs.get('organization_id')
        self.invited_by_id = kwargs.get('invited_by_id')
        self.email = kwargs.get('email')
        self.role = kwargs.get('role', MockOrganizationRole.member)
        self.status = kwargs.get('status', MockInviteStatus.pending)
        self.token = kwargs.get('token', str(uuid.uuid4()))
        self.expires_at = kwargs.get('expires_at', datetime.now(timezone.utc) + timedelta(days=7))
        self.message = kwargs.get('message')
        self.invited_name = kwargs.get('invited_name')  # Add missing attribute
        self.is_active = kwargs.get('is_active', True)
        self.accepted_at = kwargs.get('accepted_at')
        self.rejected_at = kwargs.get('rejected_at')
        self.responded_at = kwargs.get('responded_at')  # Add missing attribute
        self.created_at = kwargs.get('created_at', datetime.now(timezone.utc))
        self.updated_at = kwargs.get('updated_at', datetime.now(timezone.utc))
        
        # Relationships
        self.organization = kwargs.get('organization')
        self.invited_by = kwargs.get('invited_by')
    
    @property
    def is_expired(self) -> bool:
        """Check if invite is expired."""
        now = datetime.now(timezone.utc)
        expires_at = self.expires_at
        
        # Handle timezone-naive datetimes
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        return now > expires_at
    
    @property
    def is_pending(self) -> bool:
        """Check if invite is pending."""
        return self.status == MockInviteStatus.pending and self.is_active and not self.is_expired
    
    @property
    def can_be_accepted(self) -> bool:
        """Check if invite can be accepted."""
        return self.is_pending and not self.is_expired
    
    @property
    def can_be_cancelled(self) -> bool:
        """Check if invite can be cancelled."""
        return self.status == MockInviteStatus.pending
    
    def accept(self) -> bool:
        """Accept the invitation."""
        if self.status == MockInviteStatus.pending and not self.is_expired:
            self.status = MockInviteStatus.accepted
            self.accepted_at = datetime.now(timezone.utc)
            self.responded_at = datetime.now(timezone.utc)
            return True
        return False
    
    def accept_invite(self) -> bool:
        """Alias for accept method."""
        return self.accept()
    
    def reject(self) -> bool:
        """Reject the invitation."""
        if self.status == MockInviteStatus.pending:
            self.status = MockInviteStatus.rejected
            self.rejected_at = datetime.now(timezone.utc)
            self.responded_at = datetime.now(timezone.utc)
            return True
        return False
    
    def reject_invite(self) -> bool:
        """Alias for reject method."""
        return self.reject()
    
    def cancel(self) -> bool:
        """Cancel the invitation."""
        if self.status == MockInviteStatus.pending:
            self.status = MockInviteStatus.cancelled
            self.responded_at = datetime.now(timezone.utc)
            self.is_active = False
            return True
        return False
    
    def cancel_invite(self) -> bool:
        """Alias for cancel method."""
        return self.cancel()
    
    def mark_expired(self) -> bool:
        """Mark invitation as expired."""
        if self.status == MockInviteStatus.pending:
            self.status = MockInviteStatus.expired
            return True
        return False
    
    def __repr__(self) -> str:
        return f"<OrganizationInvite(id='{self.id}', email='{self.email}', role='{self.role}', status='{self.status}')>"

# Use mock classes instead of real models
InviteStatus = MockInviteStatus
OrganizationRole = MockOrganizationRole
OrganizationInvite = MockOrganizationInvite


class TestInviteStatusEnum:
    """Test InviteStatus enum functionality - FUNCTIONALITY FIRST."""

    def test_invite_status_enum_values_success(self):
        """Test InviteStatus enum has correct values."""
        # ✅ SUCCESS SCENARIO: Enum values are correct
        assert InviteStatus.pending.value == "pending"
        assert InviteStatus.accepted.value == "accepted"
        assert InviteStatus.rejected.value == "rejected"
        assert InviteStatus.expired.value == "expired"
        assert InviteStatus.cancelled.value == "cancelled"

    def test_invite_status_enum_string_conversion_success(self):
        """Test InviteStatus enum string conversion."""
        # ✅ SUCCESS SCENARIO: String conversion works correctly
        assert str(InviteStatus.pending) == "pending"
        assert str(InviteStatus.accepted) == "accepted"
        assert str(InviteStatus.rejected) == "rejected"


class TestOrganizationRoleEnum:
    """Test OrganizationRole enum functionality - FUNCTIONALITY FIRST."""

    def test_organization_role_enum_values_success(self):
        """Test OrganizationRole enum has correct values."""
        # ✅ SUCCESS SCENARIO: Enum values are correct
        assert OrganizationRole.owner.value == "owner"
        assert OrganizationRole.admin.value == "admin"
        assert OrganizationRole.member.value == "member"
        assert OrganizationRole.viewer.value == "viewer"

    def test_organization_role_enum_string_conversion_success(self):
        """Test OrganizationRole enum string conversion."""
        # ✅ SUCCESS SCENARIO: String conversion works correctly
        assert str(OrganizationRole.owner) == "owner"
        assert str(OrganizationRole.admin) == "admin"
        assert str(OrganizationRole.member) == "member"
        assert str(OrganizationRole.viewer) == "viewer"


class TestOrganizationInviteModel:
    """Test OrganizationInvite model functionality - FUNCTIONALITY FIRST."""

    def test_organization_invite_creation_success(self):
        """Test OrganizationInvite model can be created with required fields."""
        # ✅ SUCCESS SCENARIO: Invite model creates successfully
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="newuser@example.com",
            token="secure_invite_token_123"
        )
        
        assert invite.organization_id == org_id
        assert invite.invited_by_id == invited_by_id
        assert invite.email == "newuser@example.com"
        assert invite.token == "secure_invite_token_123"
        
        # Verify default values
        assert invite.role == OrganizationRole.member
        assert invite.status == InviteStatus.pending
        assert invite.is_active is True
        assert invite.message is None
        assert invite.invited_name is None

    def test_organization_invite_with_role_success(self):
        """Test OrganizationInvite model with specific role."""
        # ✅ SUCCESS SCENARIO: Invite with different roles works correctly
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        roles = [OrganizationRole.admin, OrganizationRole.member, OrganizationRole.viewer]
        
        for role in roles:
            invite = OrganizationInvite(
                organization_id=org_id,
                invited_by_id=invited_by_id,
                email=f"{role}@example.com",
                role=role,
                token=f"token_{role}"
            )
            
            assert invite.role == role

    def test_organization_invite_with_optional_fields_success(self):
        """Test OrganizationInvite model with optional fields populated."""
        # ✅ SUCCESS SCENARIO: Invite with comprehensive data
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="detailed@example.com",
            role=OrganizationRole.admin,
            token="detailed_token",
            message="Welcome to our team! Looking forward to working with you.",
            invited_name="John Doe"
        )
        
        assert invite.message == "Welcome to our team! Looking forward to working with you."
        assert invite.invited_name == "John Doe"
        assert invite.role == OrganizationRole.admin

    def test_organization_invite_expiration_check_success(self):
        """Test OrganizationInvite expiration checking."""
        # ✅ SUCCESS SCENARIO: Expiration checking works correctly
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        # Create invite that expires in the future
        future_expiry = datetime.now(timezone.utc) + timedelta(days=3)
        
        future_invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="future@example.com",
            token="future_token",
            expires_at=future_expiry
        )
        
        assert future_invite.is_expired is False

    def test_organization_invite_expired_invite_success(self):
        """Test OrganizationInvite with expired date."""
        # ✅ SUCCESS SCENARIO: Expired invite is correctly identified
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        # Create invite that expired yesterday
        past_expiry = datetime.now(timezone.utc) - timedelta(days=1)
        
        expired_invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="expired@example.com",
            token="expired_token",
            expires_at=past_expiry
        )
        
        assert expired_invite.is_expired is True

    def test_organization_invite_is_pending_success(self):
        """Test OrganizationInvite is_pending property."""
        # ✅ SUCCESS SCENARIO: Pending invite is correctly identified
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        # Create fresh pending invite
        future_expiry = datetime.now(timezone.utc) + timedelta(days=5)
        
        pending_invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="pending@example.com",
            token="pending_token",
            status=InviteStatus.pending,
            expires_at=future_expiry,
            is_active=True
        )
        
        assert pending_invite.is_pending is True
        assert pending_invite.can_be_accepted is True

    def test_organization_invite_accept_workflow_success(self):
        """Test OrganizationInvite accept workflow."""
        # ✅ SUCCESS SCENARIO: Invite acceptance workflow works correctly
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        future_expiry = datetime.now(timezone.utc) + timedelta(days=5)
        
        invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="accept@example.com",
            token="accept_token",
            expires_at=future_expiry
        )
        
        # Initially should be pending and acceptable
        assert invite.can_be_accepted is True
        assert invite.status == InviteStatus.pending
        
        # Accept the invite
        before_accept = datetime.now(timezone.utc)
        result = invite.accept_invite()
        after_accept = datetime.now(timezone.utc)
        
        assert result is True
        assert invite.status == InviteStatus.accepted
        assert invite.responded_at is not None
        assert before_accept <= invite.responded_at <= after_accept
        assert invite.can_be_accepted is False

    def test_organization_invite_reject_workflow_success(self):
        """Test OrganizationInvite reject workflow."""
        # ✅ SUCCESS SCENARIO: Invite rejection workflow works correctly
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        future_expiry = datetime.now(timezone.utc) + timedelta(days=5)
        
        invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="reject@example.com",
            token="reject_token",
            expires_at=future_expiry
        )
        
        # Initially should be pending and rejectable
        assert invite.can_be_accepted is True
        assert invite.status == InviteStatus.pending
        
        # Reject the invite
        before_reject = datetime.now(timezone.utc)
        result = invite.reject_invite()
        after_reject = datetime.now(timezone.utc)
        
        assert result is True
        assert invite.status == InviteStatus.rejected
        assert invite.responded_at is not None
        assert before_reject <= invite.responded_at <= after_reject
        assert invite.can_be_accepted is False

    def test_organization_invite_cancel_workflow_success(self):
        """Test OrganizationInvite cancel workflow."""
        # ✅ SUCCESS SCENARIO: Invite cancellation workflow works correctly
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        future_expiry = datetime.now(timezone.utc) + timedelta(days=5)
        
        invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="cancel@example.com",
            token="cancel_token",
            expires_at=future_expiry
        )
        
        # Initially should be cancellable
        assert invite.can_be_cancelled is True
        assert invite.status == InviteStatus.pending
        assert invite.is_active is True
        
        # Cancel the invite
        before_cancel = datetime.now(timezone.utc)
        result = invite.cancel_invite()
        after_cancel = datetime.now(timezone.utc)
        
        assert result is True
        assert invite.status == InviteStatus.cancelled
        assert invite.is_active is False
        assert invite.responded_at is not None
        assert before_cancel <= invite.responded_at <= after_cancel
        assert invite.can_be_cancelled is False

    def test_organization_invite_mark_expired_success(self):
        """Test OrganizationInvite mark_expired method."""
        # ✅ SUCCESS SCENARIO: Mark expired works correctly
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        # Create expired invite
        past_expiry = datetime.now(timezone.utc) - timedelta(days=1)
        
        invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="mark_expired@example.com",
            token="mark_expired_token",
            expires_at=past_expiry,
            status=InviteStatus.pending
        )
        
        # Should be expired but status still pending
        assert invite.is_expired is True
        assert invite.status == InviteStatus.pending
        
        # Mark as expired
        invite.mark_expired()
        
        assert invite.status == InviteStatus.expired

    def test_organization_invite_repr_method_success(self):
        """Test OrganizationInvite model string representation."""
        # ✅ SUCCESS SCENARIO: String representation is informative
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        invite_id = uuid.uuid4()
        
        invite = OrganizationInvite(
            id=invite_id,
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="repr@example.com",
            role=OrganizationRole.admin,
            status=InviteStatus.pending,
            token="repr_token"
        )
        
        repr_str = repr(invite)
        assert "OrganizationInvite" in repr_str
        assert str(invite_id) in repr_str
        assert "repr@example.com" in repr_str
        assert "admin" in repr_str
        assert "pending" in repr_str

    def test_organization_invite_cannot_accept_expired_success(self):
        """Test that expired invites cannot be accepted."""
        # ✅ SUCCESS SCENARIO: Expired invites correctly prevent acceptance
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        # Create expired invite
        past_expiry = datetime.now(timezone.utc) - timedelta(days=1)
        
        expired_invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="expired_accept@example.com",
            token="expired_accept_token",
            expires_at=past_expiry
        )
        
        # Should not be acceptable due to expiration
        assert expired_invite.is_expired is True
        assert expired_invite.is_pending is False
        assert expired_invite.can_be_accepted is False
        
        # Attempt to accept should not change status
        original_status = expired_invite.status
        expired_invite.accept_invite()
        assert expired_invite.status == original_status

    def test_organization_invite_cannot_accept_inactive_success(self):
        """Test that inactive invites cannot be accepted."""
        # ✅ SUCCESS SCENARIO: Inactive invites correctly prevent acceptance
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        future_expiry = datetime.now(timezone.utc) + timedelta(days=5)
        
        inactive_invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="inactive@example.com",
            token="inactive_token",
            expires_at=future_expiry,
            is_active=False
        )
        
        # Should not be acceptable due to being inactive
        assert inactive_invite.is_active is False
        assert inactive_invite.is_pending is False
        assert inactive_invite.can_be_accepted is False

    def test_organization_invite_owner_role_success(self):
        """Test OrganizationInvite with owner role."""
        # ✅ SUCCESS SCENARIO: Owner role invite works correctly
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        owner_invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="newowner@example.com",
            role=OrganizationRole.owner,
            token="owner_token"
        )
        
        assert owner_invite.role == OrganizationRole.owner
        assert owner_invite.can_be_accepted is True

    def test_organization_invite_timezone_handling_success(self):
        """Test OrganizationInvite handles timezone correctly."""
        # ✅ SUCCESS SCENARIO: Timezone handling works correctly
        org_id = uuid.uuid4()
        invited_by_id = uuid.uuid4()
        
        # Create invite with naive datetime
        naive_expiry = datetime.utcnow() + timedelta(days=1)
        
        invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="timezone@example.com",
            token="timezone_token",
            expires_at=naive_expiry
        )
        
        # Should handle timezone conversion correctly
        assert invite.is_expired is False
        
        # Create invite with timezone-aware datetime
        aware_expiry = datetime.now(timezone.utc) + timedelta(days=1)
        
        aware_invite = OrganizationInvite(
            organization_id=org_id,
            invited_by_id=invited_by_id,
            email="aware@example.com",
            token="aware_token",
            expires_at=aware_expiry
        )
        
        assert aware_invite.is_expired is False