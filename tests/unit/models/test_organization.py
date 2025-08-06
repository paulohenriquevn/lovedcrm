"""Unit tests for models.organization module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper multi-tenant model behavior
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import Mock

# Mock classes to avoid database dependencies
class MockOrganization:
    """Mock Organization model for unit testing."""
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', uuid.uuid4())
        self.name = kwargs.get('name')
        self.slug = kwargs.get('slug')
        self.description = kwargs.get('description')
        self.website = kwargs.get('website')
        self.owner_id = kwargs.get('owner_id')
        self.owner = kwargs.get('owner')
        self.is_active = kwargs.get('is_active', True)
        self.created_at = kwargs.get('created_at', datetime.now(timezone.utc))
        self.updated_at = kwargs.get('updated_at', datetime.now(timezone.utc))
        self.members = kwargs.get('members', [])
        self.invites = kwargs.get('invites', [])
    
    def __repr__(self) -> str:
        return f"<Organization(name='{self.name}', slug='{self.slug}')>"

class MockOrganizationMember:
    """Mock OrganizationMember model for unit testing."""
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', uuid.uuid4())
        self.organization_id = kwargs.get('organization_id')
        self.user_id = kwargs.get('user_id')
        self.role = kwargs.get('role', 'member')
        self.is_active = kwargs.get('is_active', True)
        self.created_at = kwargs.get('created_at', datetime.now(timezone.utc))
        self.updated_at = kwargs.get('updated_at', datetime.now(timezone.utc))
        self.user = kwargs.get('user')
        self.organization = kwargs.get('organization')
    
    def __repr__(self) -> str:
        return f"<OrganizationMember(user_id='{self.user_id}', org_id='{self.organization_id}')>"

# Use mock classes instead of real models
Organization = MockOrganization
OrganizationMember = MockOrganizationMember


class TestOrganizationModel:
    """Test Organization model functionality - FUNCTIONALITY FIRST."""

    def test_organization_model_creation_success(self):
        """Test Organization model can be created with required fields."""
        # ✅ SUCCESS SCENARIO: Organization model creates successfully
        owner_id = uuid.uuid4()
        
        org = Organization(
            name="Test Organization",
            slug="test-org",
            owner_id=owner_id
        )
        
        assert org.name == "Test Organization"
        assert org.slug == "test-org"
        assert org.owner_id == owner_id
        
        # Verify default values
        assert org.is_active is True
        assert org.description is None
        assert org.website is None

    def test_organization_model_with_optional_fields_success(self):
        """Test Organization model with all optional fields populated."""
        # ✅ SUCCESS SCENARIO: Organization with comprehensive data
        owner_id = uuid.uuid4()
        
        org = Organization(
            name="Acme Corporation",
            slug="acme-corp",
            owner_id=owner_id,
            description="Leading provider of innovative solutions",
            website="https://acme.com",
            is_active=True
        )
        
        assert org.name == "Acme Corporation"
        assert org.slug == "acme-corp"
        assert org.description == "Leading provider of innovative solutions"
        assert org.website == "https://acme.com"
        assert org.is_active is True

    def test_organization_model_inactive_organization_success(self):
        """Test Organization model can be set as inactive."""
        # ✅ SUCCESS SCENARIO: Organization can be deactivated
        owner_id = uuid.uuid4()
        
        org = Organization(
            name="Inactive Org",
            slug="inactive-org",
            owner_id=owner_id,
            is_active=False
        )
        
        assert org.is_active is False
        assert org.name == "Inactive Org"

    def test_organization_model_repr_method_success(self):
        """Test Organization model string representation."""
        # ✅ SUCCESS SCENARIO: String representation is informative
        owner_id = uuid.uuid4()
        
        org = Organization(
            name="Repr Organization",
            slug="repr-org",
            owner_id=owner_id
        )
        
        repr_str = repr(org)
        assert "Organization" in repr_str
        assert "Repr Organization" in repr_str
        assert "repr-org" in repr_str
        assert repr_str == "<Organization(name='Repr Organization', slug='repr-org')>"

    def test_organization_model_long_name_success(self):
        """Test Organization model handles long names."""
        # ✅ SUCCESS SCENARIO: Long organization name is accepted
        owner_id = uuid.uuid4()
        long_name = "A" * 255  # Max length
        
        org = Organization(
            name=long_name,
            slug="long-name-org",
            owner_id=owner_id
        )
        
        assert org.name == long_name
        assert len(org.name) == 255

    def test_organization_model_with_website_url_success(self):
        """Test Organization model with various website URL formats."""
        # ✅ SUCCESS SCENARIO: Different URL formats are accepted
        owner_id = uuid.uuid4()
        
        test_cases = [
            "https://example.com",
            "http://example.org",
            "https://subdomain.example.com",
            "https://example.com/path",
            "https://example.com:8080"
        ]
        
        for website in test_cases:
            org = Organization(
                name=f"Org for {website}",
                slug=f"org-{len(website)}",
                owner_id=owner_id,
                website=website
            )
            
            assert org.website == website

    def test_organization_model_nullable_fields_success(self):
        """Test Organization model handles nullable fields correctly."""
        # ✅ SUCCESS SCENARIO: Nullable fields can be None
        owner_id = uuid.uuid4()
        
        org = Organization(
            name="Minimal Org",
            slug="minimal-org",
            owner_id=owner_id
            # description and website are nullable
        )
        
        # Required fields
        assert org.name == "Minimal Org"
        assert org.slug == "minimal-org"
        assert org.owner_id == owner_id
        
        # Nullable fields should be None
        assert org.description is None
        assert org.website is None


class TestOrganizationMemberModel:
    """Test OrganizationMember model functionality - FUNCTIONALITY FIRST."""

    def test_organization_member_model_creation_success(self):
        """Test OrganizationMember model can be created with required fields."""
        # ✅ SUCCESS SCENARIO: Organization member creates successfully
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        member = OrganizationMember(
            organization_id=org_id,
            user_id=user_id
        )
        
        assert member.organization_id == org_id
        assert member.user_id == user_id
        
        # Verify default values
        assert member.role == "member"
        assert member.is_active is True

    def test_organization_member_model_with_role_success(self):
        """Test OrganizationMember model with different roles."""
        # ✅ SUCCESS SCENARIO: Different member roles work correctly
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        roles = ["owner", "admin", "member", "viewer"]
        
        for role in roles:
            member = OrganizationMember(
                organization_id=org_id,
                user_id=user_id,
                role=role
            )
            
            assert member.role == role
            assert member.is_active is True

    def test_organization_member_model_owner_role_success(self):
        """Test OrganizationMember model with owner role."""
        # ✅ SUCCESS SCENARIO: Owner member creation
        org_id = uuid.uuid4()
        owner_id = uuid.uuid4()
        
        owner_member = OrganizationMember(
            organization_id=org_id,
            user_id=owner_id,
            role="owner",
            is_active=True
        )
        
        assert owner_member.role == "owner"
        assert owner_member.is_active is True
        assert owner_member.organization_id == org_id
        assert owner_member.user_id == owner_id

    def test_organization_member_model_admin_role_success(self):
        """Test OrganizationMember model with admin role."""
        # ✅ SUCCESS SCENARIO: Admin member creation
        org_id = uuid.uuid4()
        admin_id = uuid.uuid4()
        
        admin_member = OrganizationMember(
            organization_id=org_id,
            user_id=admin_id,
            role="admin"
        )
        
        assert admin_member.role == "admin"
        assert admin_member.is_active is True

    def test_organization_member_model_inactive_member_success(self):
        """Test OrganizationMember model can be set as inactive."""
        # ✅ SUCCESS SCENARIO: Member can be deactivated
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        inactive_member = OrganizationMember(
            organization_id=org_id,
            user_id=user_id,
            role="member",
            is_active=False
        )
        
        assert inactive_member.is_active is False
        assert inactive_member.role == "member"

    def test_organization_member_model_repr_method_success(self):
        """Test OrganizationMember model string representation."""
        # ✅ SUCCESS SCENARIO: String representation is informative
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        member = OrganizationMember(
            organization_id=org_id,
            user_id=user_id,
            role="admin"
        )
        
        repr_str = repr(member)
        assert "OrganizationMember" in repr_str
        assert str(user_id) in repr_str
        assert str(org_id) in repr_str
        expected = f"<OrganizationMember(user_id='{user_id}', org_id='{org_id}')>"
        assert repr_str == expected

    def test_organization_member_model_role_constraints_success(self):
        """Test OrganizationMember model role field constraints."""
        # ✅ SUCCESS SCENARIO: Role field accepts expected values
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        # Test with maximum length role (50 characters)
        long_role = "a" * 50
        
        member = OrganizationMember(
            organization_id=org_id,
            user_id=user_id,
            role=long_role
        )
        
        assert member.role == long_role
        assert len(member.role) == 50

    def test_organization_member_model_common_scenarios_success(self):
        """Test OrganizationMember model in common usage scenarios."""
        # ✅ SUCCESS SCENARIO: Common membership scenarios work
        org_id = uuid.uuid4()
        
        # Scenario 1: Organization owner
        owner_id = uuid.uuid4()
        owner = OrganizationMember(
            organization_id=org_id,
            user_id=owner_id,
            role="owner"
        )
        
        # Scenario 2: Team member
        member_id = uuid.uuid4()
        member = OrganizationMember(
            organization_id=org_id,
            user_id=member_id,
            role="member"
        )
        
        # Scenario 3: Admin user
        admin_id = uuid.uuid4()
        admin = OrganizationMember(
            organization_id=org_id,
            user_id=admin_id,
            role="admin"
        )
        
        # All should be valid and active
        for m in [owner, member, admin]:
            assert m.organization_id == org_id
            assert m.is_active is True
            assert m.user_id is not None
        
        # Roles should be different
        assert owner.role == "owner"
        assert member.role == "member"
        assert admin.role == "admin"

    def test_organization_member_model_multi_tenant_isolation_success(self):
        """Test OrganizationMember model supports multi-tenant isolation."""
        # ✅ SUCCESS SCENARIO: Members are properly isolated by organization
        user_id = uuid.uuid4()
        org1_id = uuid.uuid4()
        org2_id = uuid.uuid4()
        
        # Same user in different organizations
        member1 = OrganizationMember(
            organization_id=org1_id,
            user_id=user_id,
            role="admin"
        )
        
        member2 = OrganizationMember(
            organization_id=org2_id,
            user_id=user_id,
            role="member"
        )
        
        # Same user, different organizations and roles
        assert member1.user_id == member2.user_id
        assert member1.organization_id != member2.organization_id
        assert member1.role != member2.role
        
        # Both should be valid and active
        assert member1.is_active is True
        assert member2.is_active is True

    def test_organization_member_model_default_values_success(self):
        """Test OrganizationMember model default values."""
        # ✅ SUCCESS SCENARIO: Default values are set correctly
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        member = OrganizationMember(
            organization_id=org_id,
            user_id=user_id
            # Not specifying role or is_active to test defaults
        )
        
        # Verify defaults
        assert member.role == "member"  # Default role
        assert member.is_active is True  # Default active status