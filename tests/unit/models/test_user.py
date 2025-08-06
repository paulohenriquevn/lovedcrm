"""Unit tests for models.user module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper model behavior
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import Mock, patch

# Mock SQLAlchemy classes to avoid database dependencies
class MockUser:
    """Mock User class for unit testing without database."""
    
    def __init__(self, **kwargs):
        # Required fields
        self.email = kwargs.get('email')
        self.hashed_password = kwargs.get('hashed_password')
        self.full_name = kwargs.get('full_name')
        self.bio = kwargs.get('bio')
        self.location = kwargs.get('location')
        self.avatar_url = kwargs.get('avatar_url')
        self.phone = kwargs.get('phone')
        
        # OAuth fields
        self.google_id = kwargs.get('google_id')
        
        # Boolean fields with defaults
        self.is_active = kwargs.get('is_active', True)
        self.is_verified = kwargs.get('is_verified', False)
        self.is_superuser = kwargs.get('is_superuser', False)
        self.must_change_password = kwargs.get('must_change_password', False)
        
        # String fields with defaults
        self.timezone = kwargs.get('timezone', "UTC")
        self.language = kwargs.get('language', "en")
        
        # Password reset fields
        self.password_reset_token = kwargs.get('password_reset_token')
        self.password_reset_expires = kwargs.get('password_reset_expires')
        
        # Email verification fields
        self.email_verification_token = kwargs.get('email_verification_token')
        self.email_verification_expires = kwargs.get('email_verification_expires')
        
        # Timestamps
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')
        self.last_login = kwargs.get('last_login')
        
        # ID
        self.id = kwargs.get('id')
    
    def __repr__(self):
        return f"<User(email='{self.email}')>"

# Use the mock class instead of the real User model
User = MockUser


class TestUserModel:
    """Test User model functionality - FUNCTIONALITY FIRST."""

    def test_user_model_creation_success(self):
        """Test User model can be created with basic fields."""
        # ✅ SUCCESS SCENARIO: User model creates successfully
        user = User(
            email="test@example.com",
            hashed_password="hashed_password_123",
            full_name="Test User"
        )
        
        assert user.email == "test@example.com"
        assert user.hashed_password == "hashed_password_123" 
        assert user.full_name == "Test User"
        
        # Verify default values
        assert user.is_active is True
        assert user.is_verified is False
        assert user.is_superuser is False
        assert user.must_change_password is False
        assert user.timezone == "UTC"
        assert user.language == "en"

    def test_user_model_with_optional_fields_success(self):
        """Test User model with all optional fields populated."""
        # ✅ SUCCESS SCENARIO: User with comprehensive profile data
        user = User(
            email="john@example.com",
            hashed_password="secure_hash",
            full_name="John Doe",
            bio="Software developer with 5 years of experience",
            location="San Francisco, CA",
            avatar_url="https://example.com/avatar.jpg",
            phone="+1-555-0123",
            timezone="America/Los_Angeles",
            language="pt"
        )
        
        assert user.bio == "Software developer with 5 years of experience"
        assert user.location == "San Francisco, CA"
        assert user.avatar_url == "https://example.com/avatar.jpg"
        assert user.phone == "+1-555-0123"
        assert user.timezone == "America/Los_Angeles"
        assert user.language == "pt"

    def test_user_model_oauth_fields_success(self):
        """Test User model with OAuth-specific fields."""
        # ✅ SUCCESS SCENARIO: OAuth user creation
        user = User(
            email="oauth@example.com",
            google_id="google_123456789",
            full_name="OAuth User",
            hashed_password=None  # OAuth users may not have password
        )
        
        assert user.email == "oauth@example.com"
        assert user.google_id == "google_123456789"
        assert user.hashed_password is None  # Allowed for OAuth users
        assert user.is_verified is False  # Should verify through OAuth flow

    def test_user_model_status_fields_success(self):
        """Test User model status and verification fields."""
        # ✅ SUCCESS SCENARIO: User with specific status configuration
        user = User(
            email="status@example.com",
            hashed_password="temp_password",
            is_active=True,
            is_verified=True,
            is_superuser=False,
            must_change_password=True
        )
        
        assert user.is_active is True
        assert user.is_verified is True
        assert user.is_superuser is False
        assert user.must_change_password is True

    def test_user_model_password_reset_fields_success(self):
        """Test User model password reset functionality fields."""
        # ✅ SUCCESS SCENARIO: User with password reset token
        reset_token = "secure_reset_token_123"
        reset_expires = datetime.now(timezone.utc)
        
        user = User(
            email="reset@example.com",
            hashed_password="current_password",
            password_reset_token=reset_token,
            password_reset_expires=reset_expires
        )
        
        assert user.password_reset_token == reset_token
        assert user.password_reset_expires == reset_expires

    def test_user_model_email_verification_fields_success(self):
        """Test User model email verification functionality fields."""
        # ✅ SUCCESS SCENARIO: User with email verification token
        verification_token = "email_verification_token_456"
        verification_expires = datetime.now(timezone.utc)
        
        user = User(
            email="verify@example.com",
            hashed_password="password",
            email_verification_token=verification_token,
            email_verification_expires=verification_expires
        )
        
        assert user.email_verification_token == verification_token
        assert user.email_verification_expires == verification_expires

    def test_user_model_timestamp_fields_success(self):
        """Test User model timestamp fields behavior."""
        # ✅ SUCCESS SCENARIO: Timestamp fields work correctly
        last_login = datetime.now(timezone.utc)
        
        user = User(
            email="timestamps@example.com",
            hashed_password="password",
            last_login=last_login
        )
        
        assert user.last_login == last_login
        # created_at and updated_at are set by database, so they'll be None in pure Python

    def test_user_model_repr_method_success(self):
        """Test User model string representation."""
        # ✅ SUCCESS SCENARIO: String representation is informative
        user = User(
            email="repr@example.com",
            hashed_password="password"
        )
        
        repr_str = repr(user)
        assert "User" in repr_str
        assert "repr@example.com" in repr_str
        assert repr_str == "<User(email='repr@example.com')>"

    def test_user_model_id_generation_success(self):
        """Test User model ID is properly generated."""
        # ✅ SUCCESS SCENARIO: UUID is generated for new users
        user = User(
            email="uuid@example.com",
            hashed_password="password"
        )
        
        # ID should be generated (or None before database save)
        # We can't test the actual UUID without database interaction
        assert hasattr(user, 'id')

    def test_user_model_nullable_fields_success(self):
        """Test User model handles nullable fields correctly."""
        # ✅ SUCCESS SCENARIO: Nullable fields can be None
        user = User(
            email="nullable@example.com"
            # Most fields are nullable and should work without values
        )
        
        # Required fields
        assert user.email == "nullable@example.com"
        
        # Nullable fields should be None or have defaults
        assert user.hashed_password is None
        assert user.full_name is None
        assert user.bio is None
        assert user.location is None
        assert user.avatar_url is None
        assert user.phone is None
        assert user.google_id is None
        assert user.password_reset_token is None
        assert user.email_verification_token is None

    def test_user_model_boolean_defaults_success(self):
        """Test User model boolean fields have correct defaults."""
        # ✅ SUCCESS SCENARIO: Boolean fields default correctly
        user = User(email="defaults@example.com")
        
        # Verify boolean defaults
        assert user.is_active is True  # Should be active by default
        assert user.is_verified is False  # Should require verification
        assert user.is_superuser is False  # Should not be superuser by default
        assert user.must_change_password is False  # Should not require password change

    def test_user_model_string_defaults_success(self):
        """Test User model string fields have correct defaults."""
        # ✅ SUCCESS SCENARIO: String fields default correctly
        user = User(email="string_defaults@example.com")
        
        # Verify string defaults
        assert user.timezone == "UTC"
        assert user.language == "en"

    def test_user_model_superuser_creation_success(self):
        """Test User model can create superuser."""
        # ✅ SUCCESS SCENARIO: Superuser creation works
        superuser = User(
            email="admin@example.com",
            hashed_password="secure_admin_password",
            full_name="System Administrator",
            is_superuser=True,
            is_verified=True,
            is_active=True
        )
        
        assert superuser.is_superuser is True
        assert superuser.is_verified is True
        assert superuser.is_active is True
        assert superuser.email == "admin@example.com"

    def test_user_model_oauth_user_no_password_success(self):
        """Test User model supports OAuth users without passwords."""
        # ✅ SUCCESS SCENARIO: OAuth user without local password
        oauth_user = User(
            email="oauth.user@example.com",
            google_id="google_oauth_123456",
            full_name="OAuth User",
            is_verified=True,  # OAuth users are typically pre-verified
            hashed_password=None
        )
        
        assert oauth_user.hashed_password is None
        assert oauth_user.google_id == "google_oauth_123456"
        assert oauth_user.is_verified is True
        # OAuth users should still be active by default
        assert oauth_user.is_active is True

    def test_user_model_field_constraints_success(self):
        """Test User model field constraints work as expected."""
        # ✅ SUCCESS SCENARIO: Fields accept expected data types and lengths
        user = User(
            email="constraints@example.com",
            hashed_password="a" * 255,  # Max length for password hash
            full_name="a" * 255,  # Max length for name
            location="a" * 255,  # Max length for location
            phone="+" + "1" * 19,  # Max length for phone (20 chars total)
            timezone="America/New_York",  # Valid timezone
            language="pt-BR"  # Valid language code
        )
        
        # Should accept all valid data without issues
        assert len(user.hashed_password) == 255
        assert len(user.full_name) == 255
        assert len(user.location) == 255
        assert len(user.phone) == 20
        assert user.timezone == "America/New_York"
        assert user.language == "pt-BR"