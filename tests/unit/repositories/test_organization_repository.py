"""Unit tests for repositories.organization_repository module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper multi-tenant repository operations
"""

import pytest
import uuid
from unittest.mock import Mock, MagicMock, patch
from typing import List

from api.repositories.organization_repository import SimpleOrganizationRepository, get_organization_repository
from api.models.organization import Organization, OrganizationMember


class TestSimpleOrganizationRepository:
    """Test SimpleOrganizationRepository functionality - FUNCTIONALITY FIRST."""

    @pytest.fixture
    def mock_session(self):
        """Create mock database session."""
        session = Mock()
        session.add = Mock()
        session.commit = Mock()
        session.refresh = Mock()
        session.delete = Mock()
        session.query = Mock()
        return session

    @pytest.fixture
    def repository(self, mock_session):
        """Create repository instance with mock session."""
        return SimpleOrganizationRepository(mock_session)

    def test_repository_initialization_success(self, mock_session):
        """Test repository initializes correctly."""
        # ✅ SUCCESS SCENARIO: Repository initialization works
        repo = SimpleOrganizationRepository(mock_session)
        
        assert repo.session == mock_session
        assert repo.model == Organization

    def test_get_by_slug_success(self, repository, mock_session):
        """Test getting organization by slug."""
        # ✅ SUCCESS SCENARIO: Get by slug returns correct organization
        slug = "test-org"
        expected_org = Organization(
            id=uuid.uuid4(),
            name="Test Organization", 
            slug=slug,
            owner_id=uuid.uuid4()
        )
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = expected_org
        mock_session.query.return_value = mock_query
        
        result = repository.get_by_slug(slug)
        
        # Verify query was constructed correctly
        mock_session.query.assert_called_once_with(Organization)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
        
        assert result == expected_org

    def test_get_by_slug_not_found_success(self, repository, mock_session):
        """Test getting organization by slug when not found."""
        # ✅ SUCCESS SCENARIO: Non-existent slug returns None
        slug = "nonexistent-org"
        
        # Setup mock query chain to return None
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_session.query.return_value = mock_query
        
        result = repository.get_by_slug(slug)
        
        assert result is None

    @patch('api.repositories.organization_repository.OrganizationMember')
    @patch('api.repositories.organization_repository.Organization')
    def test_create_organization_success(self, mock_org_class, mock_member_class, repository, mock_session):
        """Test creating organization with owner membership."""
        # ✅ SUCCESS SCENARIO: Organization creation with owner membership works
        owner_id = uuid.uuid4()
        org_data = {
            "name": "New Organization",
            "slug": "new-org",
            "description": "A new test organization"
        }
        
        # Mock organization instance
        org_instance = Mock()
        org_instance.id = uuid.uuid4()
        mock_org_class.return_value = org_instance
        
        # Mock member instance
        member_instance = Mock()
        mock_member_class.return_value = member_instance
        
        # Mock the base create method
        repository.create = Mock(return_value=org_instance)
        
        result = repository.create_organization(org_data, owner_id)
        
        # Verify organization creation
        expected_org_data = org_data.copy()
        expected_org_data["owner_id"] = owner_id
        mock_org_class.assert_called_once_with(**expected_org_data)
        repository.create.assert_called_once_with(org_instance)
        
        # Verify member creation
        mock_member_class.assert_called_once_with(
            user_id=owner_id,
            organization_id=org_instance.id,
            role="owner",
            is_active=True
        )
        
        # Verify session operations
        mock_session.add.assert_called_once_with(member_instance)
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(org_instance)
        
        assert result == org_instance

    def test_update_organization_success(self, repository, mock_session):
        """Test updating organization."""
        # ✅ SUCCESS SCENARIO: Organization update works correctly
        org_id = uuid.uuid4()
        org_instance = Mock()
        org_instance.id = org_id
        org_instance.name = "Old Name"
        
        update_data = {
            "name": "Updated Name",
            "description": "Updated description"
        }
        
        # Mock find_by_id to return organization
        repository.find_by_id = Mock(return_value=org_instance)
        repository.update = Mock(return_value=org_instance)
        
        with patch('api.repositories.organization_repository.func') as mock_func:
            mock_func.now.return_value = "2023-01-01 12:00:00"
            
            result = repository.update_organization(org_id, update_data)
        
        # Verify find and update
        repository.find_by_id.assert_called_once_with(org_id)
        repository.update.assert_called_once_with(org_instance)
        
        # Verify attributes were updated
        assert org_instance.name == "Updated Name"
        assert org_instance.description == "Updated description"
        assert org_instance.updated_at == "2023-01-01 12:00:00"
        
        assert result == org_instance

    def test_update_organization_not_found_success(self, repository, mock_session):
        """Test updating non-existent organization."""
        # ✅ SUCCESS SCENARIO: Update of non-existent org returns None
        org_id = uuid.uuid4()
        update_data = {"name": "Updated Name"}
        
        # Mock find_by_id to return None
        repository.find_by_id = Mock(return_value=None)
        
        result = repository.update_organization(org_id, update_data)
        
        repository.find_by_id.assert_called_once_with(org_id)
        assert result is None

    def test_delete_organization_success(self, repository, mock_session):
        """Test soft deleting organization."""
        # ✅ SUCCESS SCENARIO: Organization soft delete works correctly
        org_id = uuid.uuid4()
        org_instance = Mock()
        org_instance.is_active = True
        
        # Mock find_by_id to return organization
        repository.find_by_id = Mock(return_value=org_instance)
        repository.update = Mock(return_value=org_instance)
        
        with patch('api.repositories.organization_repository.func') as mock_func:
            mock_func.now.return_value = "2023-01-01 12:00:00"
            
            result = repository.delete_organization(org_id)
        
        # Verify find and update
        repository.find_by_id.assert_called_once_with(org_id)
        repository.update.assert_called_once_with(org_instance)
        
        # Verify soft delete
        assert org_instance.is_active is False
        assert org_instance.updated_at == "2023-01-01 12:00:00"
        
        assert result is True

    def test_delete_organization_not_found_success(self, repository, mock_session):
        """Test deleting non-existent organization."""
        # ✅ SUCCESS SCENARIO: Delete of non-existent org returns False
        org_id = uuid.uuid4()
        
        # Mock find_by_id to return None
        repository.find_by_id = Mock(return_value=None)
        
        result = repository.delete_organization(org_id)
        
        repository.find_by_id.assert_called_once_with(org_id)
        assert result is False

    def test_get_organization_members_success(self, repository, mock_session):
        """Test getting organization members."""
        # ✅ SUCCESS SCENARIO: Get members returns active members with user data
        org_id = uuid.uuid4()
        members = [
            Mock(user_id=uuid.uuid4(), role="owner"),
            Mock(user_id=uuid.uuid4(), role="admin"),
            Mock(user_id=uuid.uuid4(), role="member")
        ]
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_options = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.options.return_value = mock_options
        mock_options.all.return_value = members
        mock_session.query.return_value = mock_query
        
        result = repository.get_organization_members(org_id)
        
        # Verify query construction
        mock_session.query.assert_called_once_with(OrganizationMember)
        mock_query.filter.assert_called_once()
        mock_filter.options.assert_called_once()
        mock_options.all.assert_called_once()
        
        assert result == members

    def test_add_member_success(self, repository, mock_session):
        """Test adding member to organization."""
        # ✅ SUCCESS SCENARIO: Add member works correctly
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        role = "admin"
        
        member_instance = Mock()
        member_instance.organization_id = org_id
        member_instance.user_id = user_id
        member_instance.role = role
        
        with patch('api.repositories.organization_repository.OrganizationMember') as mock_member_class:
            mock_member_class.return_value = member_instance
            
            result = repository.add_member(org_id, user_id, role)
        
        # Verify member creation
        mock_member_class.assert_called_once_with(
            organization_id=org_id,
            user_id=user_id,
            role=role,
            is_active=True
        )
        
        # Verify session operations
        mock_session.add.assert_called_once_with(member_instance)
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(member_instance)
        
        assert result == member_instance

    def test_add_member_default_role_success(self, repository, mock_session):
        """Test adding member with default role."""
        # ✅ SUCCESS SCENARIO: Add member with default role works
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        member_instance = Mock()
        
        with patch('api.repositories.organization_repository.OrganizationMember') as mock_member_class:
            mock_member_class.return_value = member_instance
            
            result = repository.add_member(org_id, user_id)  # No role specified
        
        # Verify default role "member" was used
        mock_member_class.assert_called_once_with(
            organization_id=org_id,
            user_id=user_id,
            role="member",  # Default role
            is_active=True
        )

    def test_update_member_role_success(self, repository, mock_session):
        """Test updating member role."""
        # ✅ SUCCESS SCENARIO: Member role update works correctly
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        new_role = "admin"
        
        member_instance = Mock()
        member_instance.role = "member"
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = member_instance
        mock_session.query.return_value = mock_query
        
        with patch('api.repositories.organization_repository.func') as mock_func:
            mock_func.now.return_value = "2023-01-01 12:00:00"
            
            result = repository.update_member_role(org_id, user_id, new_role)
        
        # Verify query and update
        mock_session.query.assert_called_once_with(OrganizationMember)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
        
        # Verify role update
        assert member_instance.role == new_role
        assert member_instance.updated_at == "2023-01-01 12:00:00"
        
        # Verify session operations
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(member_instance)
        
        assert result == member_instance

    def test_update_member_role_not_found_success(self, repository, mock_session):
        """Test updating role of non-existent member."""
        # ✅ SUCCESS SCENARIO: Update of non-existent member returns None
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        new_role = "admin"
        
        # Setup mock query chain to return None
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_session.query.return_value = mock_query
        
        result = repository.update_member_role(org_id, user_id, new_role)
        
        assert result is None

    def test_remove_member_success(self, repository, mock_session):
        """Test removing member from organization."""
        # ✅ SUCCESS SCENARIO: Member removal works correctly
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        member_instance = Mock()
        member_instance.is_active = True
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = member_instance
        mock_session.query.return_value = mock_query
        
        with patch('api.repositories.organization_repository.func') as mock_func:
            mock_func.now.return_value = "2023-01-01 12:00:00"
            
            result = repository.remove_member(org_id, user_id)
        
        # Verify query
        mock_session.query.assert_called_once_with(OrganizationMember)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
        
        # Verify soft removal
        assert member_instance.is_active is False
        assert member_instance.updated_at == "2023-01-01 12:00:00"
        
        # Verify session operations
        mock_session.commit.assert_called_once()
        
        assert result is True

    def test_remove_member_not_found_success(self, repository, mock_session):
        """Test removing non-existent member."""
        # ✅ SUCCESS SCENARIO: Remove of non-existent member returns False
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        # Setup mock query chain to return None
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_session.query.return_value = mock_query
        
        result = repository.remove_member(org_id, user_id)
        
        assert result is False

    def test_get_user_organizations_success(self, repository, mock_session):
        """Test getting organizations where user is a member."""
        # ✅ SUCCESS SCENARIO: Get user organizations returns active memberships
        user_id = uuid.uuid4()
        organizations = [
            Mock(id=uuid.uuid4(), name="Org 1"),
            Mock(id=uuid.uuid4(), name="Org 2")
        ]
        
        # Setup mock query chain
        mock_query = Mock()
        mock_join = Mock()
        mock_filter = Mock()
        mock_query.join.return_value = mock_join
        mock_join.filter.return_value = mock_filter
        mock_filter.all.return_value = organizations
        mock_session.query.return_value = mock_query
        
        result = repository.get_user_organizations(user_id)
        
        # Verify query construction
        mock_session.query.assert_called_once_with(Organization)
        mock_query.join.assert_called_once_with(OrganizationMember)
        mock_join.filter.assert_called_once()
        mock_filter.all.assert_called_once()
        
        assert result == organizations

    def test_get_user_membership_success(self, repository, mock_session):
        """Test getting user's membership in organization."""
        # ✅ SUCCESS SCENARIO: Get user membership returns membership data
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        membership = Mock(role="admin", is_active=True)
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = membership
        mock_session.query.return_value = mock_query
        
        result = repository.get_user_membership(org_id, user_id)
        
        # Verify query construction
        mock_session.query.assert_called_once_with(OrganizationMember)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
        
        assert result == membership

    def test_check_user_role_success(self, repository, mock_session):
        """Test checking if user has required role."""
        # ✅ SUCCESS SCENARIO: User role check works correctly
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        required_roles = ["admin", "owner"]
        
        membership = Mock(role="admin")
        repository.get_user_membership = Mock(return_value=membership)
        
        result = repository.check_user_role(org_id, user_id, required_roles)
        
        repository.get_user_membership.assert_called_once_with(org_id, user_id)
        assert result is True

    def test_check_user_role_insufficient_permission_success(self, repository, mock_session):
        """Test checking user role with insufficient permissions."""
        # ✅ SUCCESS SCENARIO: Insufficient permissions correctly identified
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        required_roles = ["admin", "owner"]
        
        membership = Mock(role="member")  # Insufficient role
        repository.get_user_membership = Mock(return_value=membership)
        
        result = repository.check_user_role(org_id, user_id, required_roles)
        
        assert result is False

    def test_check_user_role_no_membership_success(self, repository, mock_session):
        """Test checking user role with no membership."""
        # ✅ SUCCESS SCENARIO: No membership correctly identified
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        required_roles = ["admin", "owner"]
        
        repository.get_user_membership = Mock(return_value=None)
        
        result = repository.check_user_role(org_id, user_id, required_roles)
        
        assert result is False

    def test_get_user_role_success(self, repository, mock_session):
        """Test getting user's role in organization."""
        # ✅ SUCCESS SCENARIO: Get user role returns correct role
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        membership = Mock(role="admin")
        repository.get_user_membership = Mock(return_value=membership)
        
        result = repository.get_user_role(org_id, user_id)
        
        repository.get_user_membership.assert_called_once_with(org_id, user_id)
        assert result == "admin"

    def test_get_user_role_no_membership_success(self, repository, mock_session):
        """Test getting user role with no membership."""
        # ✅ SUCCESS SCENARIO: No membership returns None
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        
        repository.get_user_membership = Mock(return_value=None)
        
        result = repository.get_user_role(org_id, user_id)
        
        assert result is None


class TestRepositoryDependencyInjection:
    """Test repository dependency injection function - FUNCTIONALITY FIRST."""

    def test_get_organization_repository_success(self):
        """Test dependency injection function returns repository instance."""
        # ✅ SUCCESS SCENARIO: Dependency injection works correctly
        mock_session = Mock()
        
        result = get_organization_repository(mock_session)
        
        assert isinstance(result, SimpleOrganizationRepository)
        assert result.session == mock_session
        assert result.model == Organization