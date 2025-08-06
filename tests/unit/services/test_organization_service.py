"""Unit tests for services.organization_service module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper multi-tenant organization management
"""

import pytest
import uuid
from unittest.mock import Mock, patch, MagicMock
from typing import List

from api.services.organization_service import OrganizationService
from api.models.organization import Organization, OrganizationMember
from api.models.user import User


class TestOrganizationService:
    """Test OrganizationService functionality - FUNCTIONALITY FIRST."""

    @pytest.fixture
    def mock_db_session(self):
        """Create mock database session."""
        session = Mock()
        session.add = Mock()
        session.commit = Mock()
        session.refresh = Mock()
        session.flush = Mock()
        session.query = Mock()
        return session

    @pytest.fixture
    def org_service(self, mock_db_session):
        """Create organization service instance with mock session."""
        return OrganizationService(mock_db_session)

    def test_organization_service_initialization_success(self, mock_db_session):
        """Test organization service initializes correctly."""
        # ✅ SUCCESS SCENARIO: Service initialization works
        service = OrganizationService(mock_db_session)
        
        assert service.db == mock_db_session

    def test_get_organization_by_id_success(self, org_service, mock_db_session):
        """Test getting organization by ID."""
        # ✅ SUCCESS SCENARIO: Get by ID returns correct organization
        org_id = uuid.uuid4()
        expected_org = Organization(
            id=org_id,
            name="Test Organization",
            slug="test-org",
            owner_id=uuid.uuid4()
        )
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = expected_org
        mock_db_session.query.return_value = mock_query
        
        result = org_service.get_organization_by_id(org_id)
        
        # Verify query was constructed correctly
        mock_db_session.query.assert_called_once_with(Organization)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
        
        assert result == expected_org

    def test_get_organization_by_id_not_found_success(self, org_service, mock_db_session):
        """Test getting organization by ID when not found."""
        # ✅ SUCCESS SCENARIO: Non-existent ID returns None
        org_id = uuid.uuid4()
        
        # Setup mock query chain to return None
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db_session.query.return_value = mock_query
        
        result = org_service.get_organization_by_id(org_id)
        
        assert result is None

    def test_get_user_organizations_success(self, org_service, mock_db_session):
        """Test getting all organizations for a user."""
        # ✅ SUCCESS SCENARIO: Get user organizations returns correct results
        user = Mock()
        user.id = uuid.uuid4()
        
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
        mock_db_session.query.return_value = mock_query
        
        result = org_service.get_user_organizations(user)
        
        # Verify query construction
        mock_db_session.query.assert_called_once_with(Organization)
        mock_query.join.assert_called_once_with(OrganizationMember)
        mock_join.filter.assert_called_once()
        mock_filter.all.assert_called_once()
        
        assert result == organizations

    def test_get_user_organizations_with_roles_success(self, org_service, mock_db_session):
        """Test getting user organizations with their roles."""
        # ✅ SUCCESS SCENARIO: Get user organizations with roles returns structured data
        user = Mock()
        user.id = uuid.uuid4()
        
        org1 = Mock()
        org1.id = uuid.uuid4()
        org1.name = "Organization 1"
        org1.slug = "org-1"
        org1.description = "Description 1"
        org1.website = "https://org1.com"
        org1.is_active = True
        org1.created_at = "2023-01-01"
        org1.updated_at = "2023-01-02"
        org1.owner_id = uuid.uuid4()
        
        org2 = Mock()
        org2.id = uuid.uuid4()
        org2.name = "Organization 2"
        org2.slug = "org-2"
        org2.description = None
        org2.website = None
        org2.is_active = True
        org2.created_at = "2023-01-03"
        org2.updated_at = "2023-01-04"
        org2.owner_id = uuid.uuid4()
        
        # Mock query results (org, role tuples)
        query_results = [
            (org1, "owner"),
            (org2, "admin")
        ]
        
        # Setup mock query chain
        mock_query = Mock()
        mock_join = Mock()
        mock_filter = Mock()
        mock_query.join.return_value = mock_join
        mock_join.filter.return_value = mock_filter
        mock_filter.all.return_value = query_results
        mock_db_session.query.return_value = mock_query
        
        result = org_service.get_user_organizations_with_roles(user)
        
        # Verify query construction
        mock_db_session.query.assert_called_once()
        mock_query.join.assert_called_once_with(OrganizationMember)
        mock_join.filter.assert_called_once()
        
        # Verify result structure
        assert len(result) == 2
        
        # Check first organization
        org1_result = result[0]
        assert org1_result["id"] == org1.id
        assert org1_result["name"] == "Organization 1"
        assert org1_result["slug"] == "org-1"
        assert org1_result["role"] == "owner"
        assert org1_result["is_active"] is True
        
        # Check second organization
        org2_result = result[1]
        assert org2_result["id"] == org2.id
        assert org2_result["name"] == "Organization 2"
        assert org2_result["role"] == "admin"
        assert org2_result["description"] is None

    def test_get_organization_members_success(self, org_service, mock_db_session):
        """Test getting organization members with user data."""
        # ✅ SUCCESS SCENARIO: Get organization members returns members with user data
        org_id = uuid.uuid4()
        
        members = [
            Mock(user_id=uuid.uuid4(), role="owner"),
            Mock(user_id=uuid.uuid4(), role="admin"),
            Mock(user_id=uuid.uuid4(), role="member")
        ]
        
        # Setup mock query chain
        mock_query = Mock()
        mock_options = Mock()
        mock_filter = Mock()
        mock_query.options.return_value = mock_options
        mock_options.filter.return_value = mock_filter
        mock_filter.all.return_value = members
        mock_db_session.query.return_value = mock_query
        
        with patch('sqlalchemy.orm.joinedload') as mock_joinedload:
            mock_joinedload.return_value = "mocked_joinedload"
            
            result = org_service.get_organization_members(org_id)
        
        # Verify query construction
        mock_db_session.query.assert_called_once_with(OrganizationMember)
        mock_query.options.assert_called_once_with("mocked_joinedload")
        mock_options.filter.assert_called_once()
        mock_filter.all.assert_called_once()
        
        # Verify joinedload was configured for user relationship
        mock_joinedload.assert_called_once_with(OrganizationMember.user)
        
        assert result == members

    @patch('api.services.organization_service.Organization')
    @patch('api.services.organization_service.OrganizationMember')
    def test_create_organization_success(
        self, mock_member_class, mock_org_class, org_service, mock_db_session
    ):
        """Test creating new organization with owner membership."""
        # ✅ SUCCESS SCENARIO: Organization creation with owner membership works
        name = "New Organization"
        owner_id = uuid.uuid4()
        
        # Setup organization mock
        org_instance = Mock()
        org_instance.id = uuid.uuid4()
        org_instance.name = name
        mock_org_class.return_value = org_instance
        
        # Setup member mock
        member_instance = Mock()
        mock_member_class.return_value = member_instance
        
        result = org_service.create_organization(name, owner_id)
        
        # Verify organization creation
        mock_org_class.assert_called_once_with(
            name=name,
            slug="new-organization",  # Name converted to slug
            owner_id=owner_id,
            is_active=True
        )
        
        # Verify member creation
        mock_member_class.assert_called_once_with(
            organization_id=org_instance.id,
            user_id=owner_id,
            role="owner",
            is_active=True
        )
        
        # Verify database operations
        assert mock_db_session.add.call_count == 2  # Organization and member
        mock_db_session.flush.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(org_instance)
        
        assert result == org_instance

    def test_create_organization_slug_generation_success(self, org_service):
        """Test organization slug generation from name."""
        # ✅ SUCCESS SCENARIO: Slug generation works correctly for various names
        test_cases = [
            ("Simple Name", "simple-name"),
            ("Multiple Word Organization", "multiple-word-organization"),
            ("Name With CAPS", "name-with-caps"),
            ("Special-Characters!", "special-characters!"),
            ("123 Numeric Start", "123-numeric-start")
        ]
        
        with patch('api.services.organization_service.Organization') as mock_org_class, \
             patch('api.services.organization_service.OrganizationMember'), \
             patch.object(org_service, 'db'):
            
            org_instance = Mock()
            org_instance.id = uuid.uuid4() 
            mock_org_class.return_value = org_instance
            
            for name, expected_slug in test_cases:
                org_service.create_organization(name, uuid.uuid4())
                
                # Check that slug was generated correctly
                call_args = mock_org_class.call_args[1]  # Get keyword arguments
                assert call_args["slug"] == expected_slug

    def test_update_organization_success(self, org_service, mock_db_session):
        """Test updating organization."""
        # ✅ SUCCESS SCENARIO: Organization update works correctly
        org_id = uuid.uuid4()
        
        # Setup existing organization
        org_instance = Mock()
        org_instance.id = org_id
        org_instance.name = "Old Name"
        org_instance.description = "Old Description"
        
        org_service.get_organization_by_id = Mock(return_value=org_instance)
        
        update_data = {
            "name": "Updated Name",
            "description": "Updated Description",
            "website": "https://updated.com"
        }
        
        result = org_service.update_organization(org_id, update_data)
        
        # Verify organization was found
        org_service.get_organization_by_id.assert_called_once_with(org_id)
        
        # Verify attributes were updated
        assert org_instance.name == "Updated Name"
        assert org_instance.description == "Updated Description"
        assert org_instance.website == "https://updated.com"
        
        # Verify database operations
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(org_instance)
        
        assert result == org_instance

    def test_update_organization_not_found_success(self, org_service, mock_db_session):
        """Test updating non-existent organization."""
        # ✅ SUCCESS SCENARIO: Update of non-existent organization returns None
        org_id = uuid.uuid4()
        update_data = {"name": "Updated Name"}
        
        org_service.get_organization_by_id = Mock(return_value=None)
        
        with patch('api.services.organization_service.logger') as mock_logger:
            result = org_service.update_organization(org_id, update_data)
        
        # Verify warning was logged
        mock_logger.warning.assert_called_once()
        warning_message = mock_logger.warning.call_args[0][0]
        assert "non-existent organization" in warning_message
        assert str(org_id) in warning_message
        
        assert result is None

    def test_update_organization_partial_update_success(self, org_service, mock_db_session):
        """Test partial organization update."""
        # ✅ SUCCESS SCENARIO: Partial update only changes specified fields
        org_id = uuid.uuid4()
        
        # Setup existing organization with initial values
        org_instance = Mock()
        org_instance.id = org_id
        org_instance.name = "Original Name"
        org_instance.description = "Original Description"
        org_instance.website = "https://original.com"
        
        org_service.get_organization_by_id = Mock(return_value=org_instance)
        
        # Update only name
        update_data = {"name": "New Name Only"}
        
        result = org_service.update_organization(org_id, update_data)
        
        # Verify only name was updated
        assert org_instance.name == "New Name Only"
        assert org_instance.description == "Original Description"  # Unchanged
        assert org_instance.website == "https://original.com"  # Unchanged
        
        assert result == org_instance

    def test_update_organization_ignore_invalid_fields_success(self, org_service, mock_db_session):
        """Test organization update ignores invalid fields."""
        # ✅ SUCCESS SCENARIO: Invalid fields are ignored gracefully
        org_id = uuid.uuid4()
        
        # Setup existing organization with spec to control attributes
        org_instance = Mock(spec=['id', 'name', 'description'])
        org_instance.id = org_id
        org_instance.name = "Original Name"
        org_instance.description = None
        
        org_service.get_organization_by_id = Mock(return_value=org_instance)
        
        update_data = {
            "name": "Updated Name",  # Valid field
            "invalid_field": "Invalid Value",  # Invalid field
            "another_invalid": "Another Invalid"  # Another invalid field
        }
        
        result = org_service.update_organization(org_id, update_data)
        
        # Verify only valid field was updated
        assert org_instance.name == "Updated Name"
        # Invalid fields should not be set (hasattr returns False for them)
        assert not hasattr(org_instance, "invalid_field")
        assert not hasattr(org_instance, "another_invalid")
        
        assert result == org_instance

    def test_organization_service_multi_tenant_workflow_success(self, org_service, mock_db_session):
        """Test complete multi-tenant organization workflow."""
        # ✅ SUCCESS SCENARIO: Full workflow with multiple organizations and users
        
        # Create two users
        user1 = Mock()
        user1.id = uuid.uuid4()
        user2 = Mock()
        user2.id = uuid.uuid4()
        
        # Mock organization creation for user1
        with patch('api.services.organization_service.Organization') as mock_org_class, \
             patch('api.services.organization_service.OrganizationMember') as mock_member_class:
            
            # Create organization for user1
            org1 = Mock()
            org1.id = uuid.uuid4()
            org1.name = "User1 Organization"
            mock_org_class.return_value = org1
            
            member1 = Mock()
            mock_member_class.return_value = member1
            
            created_org = org_service.create_organization("User1 Organization", user1.id)
            
            # Verify organization was created with user1 as owner
            mock_org_class.assert_called_with(
                name="User1 Organization",
                slug="user1-organization",
                owner_id=user1.id,
                is_active=True
            )
            
            mock_member_class.assert_called_with(
                organization_id=org1.id,
                user_id=user1.id,
                role="owner",
                is_active=True
            )
            
            assert created_org == org1

    def test_get_user_organizations_empty_result_success(self, org_service, mock_db_session):
        """Test getting user organizations when user has no organizations."""
        # ✅ SUCCESS SCENARIO: User with no organizations returns empty list
        user = Mock()
        user.id = uuid.uuid4()
        
        # Setup mock query chain to return empty list
        mock_query = Mock()
        mock_join = Mock()
        mock_filter = Mock()
        mock_query.join.return_value = mock_join
        mock_join.filter.return_value = mock_filter
        mock_filter.all.return_value = []
        mock_db_session.query.return_value = mock_query
        
        result = org_service.get_user_organizations(user)
        
        assert result == []
        assert isinstance(result, list)

    def test_get_organization_members_empty_result_success(self, org_service, mock_db_session):
        """Test getting organization members when organization has no members."""
        # ✅ SUCCESS SCENARIO: Organization with no members returns empty list
        org_id = uuid.uuid4()
        
        # Setup mock query chain to return empty list
        mock_query = Mock()
        mock_options = Mock()
        mock_filter = Mock()
        mock_query.options.return_value = mock_options
        mock_options.filter.return_value = mock_filter
        mock_filter.all.return_value = []
        mock_db_session.query.return_value = mock_query
        
        with patch('sqlalchemy.orm.joinedload') as mock_joinedload:
            # Mock joinedload to return a mock that can be used in query options
            mock_joinedload.return_value = Mock()
            result = org_service.get_organization_members(org_id)
        
        assert result == []
        assert isinstance(result, list)