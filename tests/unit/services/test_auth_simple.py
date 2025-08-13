"""Unit tests for services.auth_simple module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper multi-tenant authentication behavior
"""

import pytest
import uuid
from unittest.mock import Mock, patch, MagicMock
from fastapi import HTTPException

from api.services.auth_simple import SimpleAuthService
from api.models.user import User
from api.models.organization import Organization, OrganizationMember


class TestSimpleAuthService:
    """Test SimpleAuthService functionality - FUNCTIONALITY FIRST."""

    @pytest.fixture
    def mock_db_session(self):
        """Create mock database session."""
        session = Mock()
        session.add = Mock()
        session.commit = Mock()
        session.refresh = Mock()
        session.rollback = Mock()
        session.query = Mock()
        return session

    @pytest.fixture
    def auth_service(self, mock_db_session):
        """Create auth service instance with mock session."""
        return SimpleAuthService(mock_db_session)

    def test_auth_service_initialization_success(self, mock_db_session):
        """Test auth service initializes correctly."""
        # ✅ SUCCESS SCENARIO: Service initialization works
        service = SimpleAuthService(mock_db_session)
        
        assert service.db == mock_db_session

    @patch('api.services.auth_simple.get_password_hash')
    @patch('api.core.config.settings')
    def test_register_user_success(
        self, mock_settings, mock_hash_password, auth_service, mock_db_session
    ):
        """Test user registration with auto-organization creation in B2B mode."""
        # Setup mocks
        mock_settings.EMAIL_VERIFICATION_REQUIRED = False
        mock_settings.EMAIL_ENABLED = False
        mock_hash_password.return_value = "hashed_password_123"
        
        # Mock database queries
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing user
        mock_db_session.query.return_value = mock_query
        
        # Mock user and org creation
        user_id = uuid.uuid4()
        with patch('api.services.auth_simple.User') as mock_user_class, \
             patch('api.services.auth_simple.Organization') as mock_org_class, \
             patch('api.services.auth_simple.OrganizationMember') as mock_member_class:
            
            # Setup user mock
            user_instance = Mock()
            user_instance.id = user_id
            user_instance.email = "test@example.com"
            mock_user_class.return_value = user_instance
            
            # Setup org mock
            org_instance = Mock()
            org_instance.id = uuid.uuid4()
            org_instance.name = "Test's Organization"
            mock_org_class.return_value = org_instance
            
            # Setup member mock
            member_instance = Mock()
            mock_member_class.return_value = member_instance
            
            # ✅ SUCCESS SCENARIO: User registration with auto-org creation
            user, org = auth_service.register_user(
                email="test@example.com",
                password="SecurePassword123",
                full_name="Test User",
                terms_accepted=True
            )
            
            # Verify password hashing
            mock_hash_password.assert_called_once_with("SecurePassword123")
            
            # Verify user creation
            mock_user_class.assert_called_once_with(
                email="test@example.com",
                hashed_password="hashed_password_123",
                full_name="Test User",
                is_active=True,
                is_verified=True  # Since EMAIL_VERIFICATION_REQUIRED is False
            )
            
            # Verify organization creation (B2B mode creates user's organization)
            mock_org_class.assert_called_once_with(
                name="Test User's Organization",
                slug=f"org_{user_id}",
                owner_id=user_id,
                is_active=True
            )
            
            # Verify membership creation
            mock_member_class.assert_called_once_with(
                user_id=user_id,
                organization_id=org_instance.id,
                role="owner",
                is_active=True
            )
            
            # Verify database operations
            assert mock_db_session.add.call_count == 3  # User, org, member
            assert mock_db_session.commit.call_count == 3
            assert mock_db_session.refresh.call_count == 2  # User, org
            
            assert user == user_instance
            assert org == org_instance

    @patch('api.services.auth_simple.get_password_hash')
    @patch('api.core.config.settings')
    def test_register_user_success_b2b_mode(
        self, mock_settings, mock_hash_password, auth_service, mock_db_session
    ):
        """Test user registration with auto-organization creation in B2B mode."""
        # Setup mocks for B2B mode
        mock_settings.EMAIL_VERIFICATION_REQUIRED = False
        mock_settings.EMAIL_ENABLED = False
        mock_hash_password.return_value = "hashed_password_123"
        
        # Mock database queries
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing user
        mock_db_session.query.return_value = mock_query
        
        # Mock user and org creation
        user_id = uuid.uuid4()
        with patch('api.services.auth_simple.User') as mock_user_class, \
             patch('api.services.auth_simple.Organization') as mock_org_class, \
             patch('api.services.auth_simple.OrganizationMember') as mock_member_class:
            
            # Setup user mock
            user_instance = Mock()
            user_instance.id = user_id
            user_instance.email = "test@example.com"
            mock_user_class.return_value = user_instance
            
            # Setup org mock
            org_instance = Mock()
            org_instance.id = uuid.uuid4()
            org_instance.name = "Test User's Organization"
            mock_org_class.return_value = org_instance
            
            # Setup member mock
            member_instance = Mock()
            mock_member_class.return_value = member_instance
            
            # ✅ SUCCESS SCENARIO: User registration with personalized org in B2B mode
            user, org = auth_service.register_user(
                email="test@example.com",
                password="SecurePassword123",
                full_name="Test User",
                terms_accepted=True
            )
            
            # Verify organization creation (B2B mode creates personalized organization)
            mock_org_class.assert_called_once_with(
                name="Test User's Organization",
                slug=f"org_{user_id}",
                owner_id=user_id,
                is_active=True
            )
            
            # Verify database operations
            assert mock_db_session.add.call_count == 3  # User, org, member
            assert mock_db_session.commit.call_count == 3
            assert mock_db_session.refresh.call_count == 2  # User, org
            
            assert user == user_instance
            assert org == org_instance

    def test_register_user_existing_email_error(self, auth_service, mock_db_session):
        """Test user registration with existing email."""
        # Setup existing user mock
        existing_user = Mock()
        existing_user.email = "test@example.com"
        
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = existing_user  # User exists
        mock_db_session.query.return_value = mock_query
        
        # ❌ ERROR SCENARIO: Existing email should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            auth_service.register_user(
                email="test@example.com",
                password="SecurePassword123",
                terms_accepted=True
            )
        
        assert exc_info.value.status_code == 400
        assert "Email already exists" in str(exc_info.value.detail)

    def test_register_user_terms_not_accepted_error(self, auth_service):
        """Test user registration without accepting terms."""
        # ❌ ERROR SCENARIO: Terms not accepted should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            auth_service.register_user(
                email="test@example.com",
                password="SecurePassword123",
                terms_accepted=False
            )
        
        assert exc_info.value.status_code == 400
        assert "accept the terms" in str(exc_info.value.detail)

    @patch('api.services.auth_simple.verify_password')
    def test_authenticate_user_success(self, mock_verify_password, auth_service, mock_db_session):
        """Test user authentication with valid credentials."""
        # Setup valid user
        user = Mock()
        user.is_active = True
        user.hashed_password = "hashed_password_123"
        user.last_login = None
        
        mock_verify_password.return_value = True
        
        # Setup database query
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = user
        mock_db_session.query.return_value = mock_query
        
        with patch('api.services.auth_simple.func') as mock_func:
            mock_func.now.return_value = "2023-01-01 12:00:00"
            
            # ✅ SUCCESS SCENARIO: Valid credentials authenticate successfully
            result = auth_service.authenticate_user("test@example.com", "correct_password")
        
        # Verify password verification
        mock_verify_password.assert_called_once_with("correct_password", "hashed_password_123")
        
        # Verify last login update
        assert user.last_login == "2023-01-01 12:00:00"
        mock_db_session.commit.assert_called_once()
        
        assert result == user

    @patch('api.services.auth_simple.verify_password')
    def test_authenticate_user_invalid_password_error(
        self, mock_verify_password, auth_service, mock_db_session
    ):
        """Test user authentication with invalid password."""
        # Setup user with invalid password
        user = Mock()
        user.is_active = True
        user.hashed_password = "hashed_password_123"
        
        mock_verify_password.return_value = False
        
        # Setup database query
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = user
        mock_db_session.query.return_value = mock_query
        
        # ❌ ERROR SCENARIO: Invalid password should return None
        result = auth_service.authenticate_user("test@example.com", "wrong_password")
        
        mock_verify_password.assert_called_once_with("wrong_password", "hashed_password_123")
        assert result is None

    def test_authenticate_user_inactive_user_error(self, auth_service, mock_db_session):
        """Test user authentication with inactive user."""
        # Setup inactive user
        user = Mock()
        user.is_active = False
        
        # Setup database query
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = user
        mock_db_session.query.return_value = mock_query
        
        # ❌ ERROR SCENARIO: Inactive user should return None
        result = auth_service.authenticate_user("test@example.com", "password")
        
        assert result is None

    def test_authenticate_user_nonexistent_user_error(self, auth_service, mock_db_session):
        """Test user authentication with non-existent user."""
        # Setup database query to return None
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db_session.query.return_value = mock_query
        
        # ❌ ERROR SCENARIO: Non-existent user should return None
        result = auth_service.authenticate_user("nonexistent@example.com", "password")
        
        assert result is None

    @patch('api.services.auth_simple.create_access_token')
    @patch('api.services.auth_simple.create_refresh_token')
    def test_create_tokens_success(
        self, mock_create_refresh, mock_create_access, auth_service, mock_db_session
    ):
        """Test token creation with organization context."""
        # Setup user
        user = Mock()
        user.id = uuid.uuid4()
        user.email = "test@example.com"
        
        # Setup organization membership
        org_member = Mock()
        org_member.organization_id = uuid.uuid4()
        org_member.role = "owner"
        
        # Setup database query for membership
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = org_member
        mock_db_session.query.return_value = mock_query
        
        # Setup token creation mocks
        mock_create_access.return_value = "access_token_123"
        mock_create_refresh.return_value = "refresh_token_456"
        
        # ✅ SUCCESS SCENARIO: Token creation with org context works
        result = auth_service.create_tokens(user)
        
        # Verify token data
        expected_token_data = {
            "sub": str(user.id),
            "email": "test@example.com",
            "org_id": str(org_member.organization_id),
            "role": "owner"
        }
        
        mock_create_access.assert_called_once_with(data=expected_token_data)
        mock_create_refresh.assert_called_once_with(data=expected_token_data)
        
        # Verify response structure
        expected_response = {
            "access_token": "access_token_123",
            "refresh_token": "refresh_token_456",
            "token_type": "bearer"
        }
        
        assert result == expected_response

    @patch('api.services.auth_simple.create_access_token')
    @patch('api.services.auth_simple.create_refresh_token')
    def test_create_tokens_no_organization_success(
        self, mock_create_refresh, mock_create_access, auth_service, mock_db_session
    ):
        """Test token creation for user without organization."""
        # Setup user
        user = Mock()
        user.id = uuid.uuid4()
        user.email = "test@example.com"
        
        # Setup database query to return no membership
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No organization membership
        mock_db_session.query.return_value = mock_query
        
        # Setup token creation mocks
        mock_create_access.return_value = "access_token_123"
        mock_create_refresh.return_value = "refresh_token_456"
        
        # ✅ SUCCESS SCENARIO: Token creation without org works with defaults
        result = auth_service.create_tokens(user)
        
        # Verify token data with defaults
        expected_token_data = {
            "sub": str(user.id),
            "email": "test@example.com",
            "org_id": None,
            "role": "member"  # Default role
        }
        
        mock_create_access.assert_called_once_with(data=expected_token_data)
        mock_create_refresh.assert_called_once_with(data=expected_token_data)
        
        assert result["access_token"] == "access_token_123"
        assert result["refresh_token"] == "refresh_token_456"
        assert result["token_type"] == "bearer"

    def test_login_success(self, auth_service, mock_db_session):
        """Test user login with valid credentials."""
        # Mock user and organization
        user = Mock(spec=['id', 'email'])  # Only specify these attributes
        user.id = uuid.uuid4()
        user.email = "test@example.com"
        
        org_member = Mock()
        org_member.organization_id = uuid.uuid4()
        org_member.role = "owner"
        
        organization = Mock()
        organization.id = org_member.organization_id
        organization.name = "Test Organization"
        
        # Mock authenticate_user
        auth_service.authenticate_user = Mock(return_value=user)
        
        # Mock database queries for organization membership, organization, and 2FA
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        # Mock query responses: org_member, organization, 2FA check (None - no 2FA setup)
        mock_filter.first.side_effect = [org_member, organization, None]
        mock_db_session.query.return_value = mock_query
        
        # Mock create_tokens
        auth_service.create_tokens = Mock(return_value={
            "access_token": "token_123",
            "refresh_token": "refresh_456",
            "token_type": "bearer"
        })
        
        # ✅ SUCCESS SCENARIO: Login with valid credentials works
        result = auth_service.login("test@example.com", "correct_password")
        
        # Verify method calls
        auth_service.authenticate_user.assert_called_once_with("test@example.com", "correct_password")
        auth_service.create_tokens.assert_called_once_with(user)
        
        # Verify response includes user and organization
        assert result["access_token"] == "token_123"
        assert result["refresh_token"] == "refresh_456"
        assert result["token_type"] == "bearer"
        assert result["user"] == user
        assert result["organization"] == organization

    def test_login_invalid_credentials_error(self, auth_service):
        """Test user login with invalid credentials."""
        # Mock authenticate_user to return None
        auth_service.authenticate_user = Mock(return_value=None)
        
        # ❌ ERROR SCENARIO: Invalid credentials should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            auth_service.login("test@example.com", "wrong_password")
        
        assert exc_info.value.status_code == 401
        assert "Invalid credentials" in str(exc_info.value.detail)

    @patch('api.services.auth_simple.get_password_hash')
    @patch('api.core.config.settings')
    def test_register_user_with_email_verification_required(
        self, mock_settings, mock_hash_password, auth_service, mock_db_session
    ):
        """Test user registration when email verification is required."""
        # Setup mocks for email verification scenario
        mock_settings.EMAIL_VERIFICATION_REQUIRED = True
        mock_settings.EMAIL_ENABLED = True
        mock_hash_password.return_value = "hashed_password_123"
        
        # Mock database queries
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing user
        mock_db_session.query.return_value = mock_query
        
        # Mock user and org creation
        user_id = uuid.uuid4()
        with patch('api.services.auth_simple.User') as mock_user_class, \
             patch('api.services.auth_simple.Organization') as mock_org_class, \
             patch('api.services.auth_simple.OrganizationMember') as mock_member_class, \
             patch.object(auth_service, '_send_verification_email') as mock_send_email:
            
            # Setup mocks
            user_instance = Mock()
            user_instance.id = user_id
            mock_user_class.return_value = user_instance
            
            org_instance = Mock()
            org_instance.id = uuid.uuid4()
            mock_org_class.return_value = org_instance
            
            member_instance = Mock()
            mock_member_class.return_value = member_instance
            
            # ✅ SUCCESS SCENARIO: Registration with email verification works
            user, org = auth_service.register_user(
                email="test@example.com",
                password="SecurePassword123",
                full_name="Test User",
                terms_accepted=True
            )
            
            # Verify user creation with unverified status
            mock_user_class.assert_called_once_with(
                email="test@example.com",
                hashed_password="hashed_password_123",
                full_name="Test User",
                is_active=True,
                is_verified=False  # Should be False when verification required
            )
            
            # Verify verification email was sent
            mock_send_email.assert_called_once_with(user_instance)

    @patch('api.services.auth_simple.get_password_hash')
    @patch('api.core.config.settings')
    def test_register_user_organization_creation_failure(
        self, mock_settings, mock_hash_password, auth_service, mock_db_session
    ):
        """Test user registration when organization creation fails."""
        # Setup mocks
        mock_settings.EMAIL_VERIFICATION_REQUIRED = False
        mock_settings.EMAIL_ENABLED = False
        mock_hash_password.return_value = "hashed_password_123"
        
        # Mock database queries
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing user
        mock_db_session.query.return_value = mock_query
        
        # Mock user creation success but org creation failure
        user_id = uuid.uuid4()
        with patch('api.services.auth_simple.User') as mock_user_class, \
             patch('api.services.auth_simple.Organization') as mock_org_class:
            
            user_instance = Mock()
            user_instance.id = user_id
            mock_user_class.return_value = user_instance
            
            # Make organization creation fail
            mock_org_class.side_effect = Exception("Database error")
            
            # ❌ ERROR SCENARIO: Organization creation failure should rollback and raise
            with pytest.raises(HTTPException) as exc_info:
                auth_service.register_user(
                    email="test@example.com",
                    password="SecurePassword123",
                    terms_accepted=True
                )
            
            # Verify rollback was called
            mock_db_session.rollback.assert_called_once()
            
            # Verify error details
            assert exc_info.value.status_code == 500
            assert "Failed to create organization" in str(exc_info.value.detail)


class TestSaasModeRegistration:
    """Test registration behavior based on SAAS_MODE - FUNCTIONALITY FIRST."""

    @pytest.fixture
    def mock_db_session(self):
        """Create mock database session."""
        session = Mock()
        session.add = Mock()
        session.commit = Mock()
        session.refresh = Mock()
        session.rollback = Mock()
        session.query = Mock()
        return session

    @pytest.fixture
    def auth_service(self, mock_db_session):
        """Create auth service instance with mock session."""
        return SimpleAuthService(mock_db_session)


    @patch('api.services.auth_simple.get_password_hash')
    @patch('api.core.config.settings')
    def test_register_user_b2b_mode_organization_naming(
        self, mock_settings, mock_hash_password, auth_service, mock_db_session
    ):
        """Test user registration creates personalized organization in B2B mode."""
        # Setup B2B mode
        mock_settings.is_b2b_mode = True
        mock_settings.EMAIL_VERIFICATION_REQUIRED = False
        mock_settings.EMAIL_ENABLED = False
        mock_hash_password.return_value = "hashed_password_123"
        
        # Mock database queries
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing user
        mock_db_session.query.return_value = mock_query
        
        # Mock user and org creation
        user_id = uuid.uuid4()
        with patch('api.services.auth_simple.User') as mock_user_class, \
             patch('api.services.auth_simple.Organization') as mock_org_class, \
             patch('api.services.auth_simple.OrganizationMember') as mock_member_class:
            
            # Setup user mock
            user_instance = Mock()
            user_instance.id = user_id
            user_instance.email = "test@example.com"
            mock_user_class.return_value = user_instance
            
            # Setup org mock
            org_instance = Mock()
            org_instance.id = uuid.uuid4()
            org_instance.name = "Test User's Organization"
            mock_org_class.return_value = org_instance
            
            # Setup member mock
            member_instance = Mock()
            mock_member_class.return_value = member_instance
            
            # ✅ SUCCESS SCENARIO: B2B registration creates personalized organization
            user, org = auth_service.register_user(
                email="test@example.com",
                password="SecurePassword123",
                full_name="Test User",
                terms_accepted=True
            )
            
            # Verify organization creation with B2B naming
            mock_org_class.assert_called_once_with(
                name="Test User's Organization",  # B2B mode uses personalized name
                slug=f"org_{user_id}",
                owner_id=user_id,
                is_active=True
            )
            
            assert user == user_instance
            assert org == org_instance


    @patch('api.services.auth_simple.get_password_hash')
    @patch('api.core.config.settings')
    def test_register_user_b2b_mode_without_full_name_uses_email(
        self, mock_settings, mock_hash_password, auth_service, mock_db_session
    ):
        """Test B2B registration without full_name uses email prefix for organization."""
        # Setup B2B mode
        mock_settings.is_b2b_mode = True
        mock_settings.EMAIL_VERIFICATION_REQUIRED = False
        mock_settings.EMAIL_ENABLED = False
        mock_hash_password.return_value = "hashed_password_123"
        
        # Mock database queries
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing user
        mock_db_session.query.return_value = mock_query
        
        # Mock user and org creation
        user_id = uuid.uuid4()
        with patch('api.services.auth_simple.User') as mock_user_class, \
             patch('api.services.auth_simple.Organization') as mock_org_class, \
             patch('api.services.auth_simple.OrganizationMember') as mock_member_class:
            
            # Setup mocks
            user_instance = Mock()
            user_instance.id = user_id
            mock_user_class.return_value = user_instance
            
            org_instance = Mock()
            mock_org_class.return_value = org_instance
            
            member_instance = Mock()
            mock_member_class.return_value = member_instance
            
            # ✅ SUCCESS SCENARIO: B2B mode uses email prefix when no full_name
            user, org = auth_service.register_user(
                email="testuser@example.com",
                password="SecurePassword123",
                terms_accepted=True  # No full_name provided
            )
            
            # Verify organization name uses email prefix
            mock_org_class.assert_called_once_with(
                name="testuser's Organization",  # Uses email prefix in B2B mode
                slug=f"org_{user_id}",
                owner_id=user_id,
                is_active=True
            )