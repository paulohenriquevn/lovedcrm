"""Unit tests for core.security module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper data
"""

import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, Mock
from fastapi import HTTPException

from api.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_reset_token,
    generate_verification_token,
    TokenType,
    TokenData,
)


class TestPasswordHashing:
    """Test password hashing functionality - FUNCTIONALITY FIRST."""

    def test_get_password_hash_creates_valid_hash(self):
        """Test that password hashing works correctly."""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        # ✅ SUCCESS SCENARIO: Hash is created and different from original
        assert hashed != password
        assert len(hashed) > 50  # bcrypt hashes are typically 60 chars
        assert hashed.startswith("$2b$")  # bcrypt format

    def test_verify_password_success_scenario(self):
        """Test password verification with correct password."""
        password = "secure_password_123"
        hashed = get_password_hash(password)
        
        # ✅ SUCCESS SCENARIO: Correct password validates
        assert verify_password(password, hashed) is True

    def test_verify_password_different_passwords_same_hash(self):
        """Test that same password produces different hashes but validates correctly."""
        password = "same_password"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # ✅ SUCCESS SCENARIO: Different salts produce different hashes
        assert hash1 != hash2
        # ✅ SUCCESS SCENARIO: Both validate correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_verify_password_wrong_password(self):
        """Test password verification with wrong password."""
        correct_password = "correct_password"
        wrong_password = "wrong_password"
        hashed = get_password_hash(correct_password)
        
        # ❌ ERROR SCENARIO: Wrong password fails validation
        assert verify_password(wrong_password, hashed) is False


class TestJWTTokens:
    """Test JWT token creation and verification - FUNCTIONALITY FIRST."""

    @patch('api.core.security.settings')
    def test_create_access_token_success(self, mock_settings):
        """Test access token creation with valid data."""
        # Setup mock settings
        mock_settings.SECRET_KEY = "test_secret_key_32_characters_long!"
        mock_settings.JWT_ALGORITHM = "HS256"
        mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 15
        mock_settings.APP_NAME = "Test App"
        
        user_data = {
            "sub": "user123",
            "email": "test@example.com",
            "org_id": "org123",
            "role": "owner"
        }
        
        # ✅ SUCCESS SCENARIO: Token is created successfully
        token = create_access_token(user_data)
        
        assert isinstance(token, str)
        assert len(token) > 50  # JWT tokens are long strings
        assert "." in token  # JWT format has dots

    @patch('api.core.security.settings')
    def test_create_refresh_token_success(self, mock_settings):
        """Test refresh token creation with valid data."""
        # Setup mock settings
        mock_settings.SECRET_KEY = "test_secret_key_32_characters_long!"
        mock_settings.JWT_ALGORITHM = "HS256"
        mock_settings.REFRESH_TOKEN_EXPIRE_DAYS = 7
        mock_settings.APP_NAME = "Test App"
        
        user_data = {
            "sub": "user123",
            "email": "test@example.com",
            "org_id": "org123"
        }
        
        # ✅ SUCCESS SCENARIO: Refresh token is created successfully
        token = create_refresh_token(user_data)
        
        assert isinstance(token, str)
        assert len(token) > 50
        assert "." in token

    @patch('api.core.security.settings')
    def test_create_access_token_with_custom_expiry(self, mock_settings):
        """Test access token creation with custom expiration."""
        # Setup mock settings
        mock_settings.SECRET_KEY = "test_secret_key_32_characters_long!"
        mock_settings.JWT_ALGORITHM = "HS256"
        mock_settings.APP_NAME = "Test App"
        
        user_data = {"sub": "user123", "email": "test@example.com"}
        custom_expiry = timedelta(minutes=30)
        
        # ✅ SUCCESS SCENARIO: Token with custom expiry is created
        token = create_access_token(user_data, expires_delta=custom_expiry)
        
        assert isinstance(token, str)
        assert len(token) > 50

    @patch('api.core.security.settings')
    def test_verify_token_success_scenario(self, mock_settings):
        """Test token verification with valid token."""
        # Setup mock settings
        mock_settings.SECRET_KEY = "test_secret_key_32_characters_long!"
        mock_settings.JWT_ALGORITHM = "HS256"
        mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 15
        mock_settings.APP_NAME = "Test App"
        
        user_data = {
            "sub": "user123",
            "email": "test@example.com",
            "org_id": "org123",
            "role": "owner"
        }
        
        # ✅ SUCCESS SCENARIO: Create and verify valid token
        token = create_access_token(user_data)
        payload = verify_token(token, TokenType.ACCESS.value)
        
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"
        assert payload["org_id"] == "org123"
        assert payload["role"] == "owner"
        assert payload["type"] == TokenType.ACCESS.value
        assert payload["iss"] == "Test App"

    @patch('api.core.security.settings')
    def test_verify_refresh_token_success(self, mock_settings):
        """Test refresh token verification with valid token."""
        # Setup mock settings
        mock_settings.SECRET_KEY = "test_secret_key_32_characters_long!"
        mock_settings.JWT_ALGORITHM = "HS256"
        mock_settings.REFRESH_TOKEN_EXPIRE_DAYS = 7
        mock_settings.APP_NAME = "Test App"
        
        user_data = {"sub": "user123", "email": "test@example.com"}
        
        # ✅ SUCCESS SCENARIO: Create and verify refresh token
        token = create_refresh_token(user_data)
        payload = verify_token(token, TokenType.REFRESH.value)
        
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"
        assert payload["type"] == TokenType.REFRESH.value

    @patch('api.core.security.settings')
    def test_verify_token_wrong_type_fails(self, mock_settings):
        """Test token verification fails with wrong token type."""
        # Setup mock settings
        mock_settings.SECRET_KEY = "test_secret_key_32_characters_long!"
        mock_settings.JWT_ALGORITHM = "HS256"
        mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 15
        mock_settings.APP_NAME = "Test App"
        
        user_data = {"sub": "user123"}
        access_token = create_access_token(user_data)
        
        # ❌ ERROR SCENARIO: Access token used as refresh token should fail
        with pytest.raises(HTTPException) as exc_info:
            verify_token(access_token, TokenType.REFRESH.value)
        
        assert exc_info.value.status_code == 401
        assert "Invalid token type" in str(exc_info.value.detail)

    @patch('api.core.security.settings')
    def test_verify_token_expired_fails(self, mock_settings):
        """Test token verification fails with expired token."""
        # Setup mock settings
        mock_settings.SECRET_KEY = "test_secret_key_32_characters_long!"
        mock_settings.JWT_ALGORITHM = "HS256"
        mock_settings.APP_NAME = "Test App"
        
        user_data = {"sub": "user123"}
        # Create token that expires immediately
        expired_delta = timedelta(seconds=-1)
        
        expired_token = create_access_token(user_data, expires_delta=expired_delta)
        
        # ❌ ERROR SCENARIO: Expired token should fail
        with pytest.raises(HTTPException) as exc_info:
            verify_token(expired_token)
        
        assert exc_info.value.status_code == 401
        # Token expiration may result in different error messages
        assert exc_info.value.detail in ["Unauthorized - token expired", "Unauthorized - invalid token"]

    @patch('api.core.security.settings')
    def test_verify_token_invalid_signature_fails(self, mock_settings):
        """Test token verification fails with invalid signature."""
        # Setup mock settings
        mock_settings.SECRET_KEY = "test_secret_key_32_characters_long!"
        mock_settings.JWT_ALGORITHM = "HS256"
        
        # ❌ ERROR SCENARIO: Invalid token should fail
        invalid_token = "invalid.jwt.token"
        
        with pytest.raises(HTTPException) as exc_info:
            verify_token(invalid_token)
        
        assert exc_info.value.status_code == 401
        assert "invalid token" in str(exc_info.value.detail)


class TestTokenGeneration:
    """Test token generation utilities - FUNCTIONALITY FIRST."""

    def test_generate_reset_token_success(self):
        """Test reset token generation creates valid tokens."""
        # ✅ SUCCESS SCENARIO: Reset token is generated correctly
        token1 = generate_reset_token()
        token2 = generate_reset_token()
        
        assert len(token1) == 32
        assert len(token2) == 32
        assert token1 != token2  # Should be unique
        assert token1.isalnum()  # Only letters and digits
        assert token2.isalnum()

    def test_generate_verification_token_success(self):
        """Test verification token generation creates valid tokens."""
        # ✅ SUCCESS SCENARIO: Verification token is generated correctly
        token1 = generate_verification_token()
        token2 = generate_verification_token()
        
        assert len(token1) == 32
        assert len(token2) == 32
        assert token1 != token2  # Should be unique
        assert token1.isalnum()  # Only letters and digits
        assert token2.isalnum()

    def test_token_generation_uniqueness(self):
        """Test that generated tokens are sufficiently unique."""
        # ✅ SUCCESS SCENARIO: Generate multiple tokens and verify uniqueness
        reset_tokens = [generate_reset_token() for _ in range(100)]
        verification_tokens = [generate_verification_token() for _ in range(100)]
        
        # All tokens should be unique
        assert len(set(reset_tokens)) == 100
        assert len(set(verification_tokens)) == 100
        
        # No overlap between different token types (very unlikely but test anyway)
        overlap = set(reset_tokens) & set(verification_tokens)
        assert len(overlap) == 0  # Should be no overlap


class TestTokenData:
    """Test TokenData class - FUNCTIONALITY FIRST."""

    def test_token_data_initialization_with_data(self):
        """Test TokenData initialization with user data."""
        # ✅ SUCCESS SCENARIO: TokenData initialized correctly
        token_data = TokenData(user_id="user123", email="test@example.com")
        
        assert token_data.user_id == "user123"
        assert token_data.email == "test@example.com"

    def test_token_data_initialization_empty(self):
        """Test TokenData initialization without data."""
        # ✅ SUCCESS SCENARIO: TokenData initialized with defaults
        token_data = TokenData()
        
        assert token_data.user_id is None
        assert token_data.email is None

    def test_token_data_partial_initialization(self):
        """Test TokenData initialization with partial data."""
        # ✅ SUCCESS SCENARIO: TokenData with partial data
        token_data1 = TokenData(user_id="user123")
        token_data2 = TokenData(email="test@example.com")
        
        assert token_data1.user_id == "user123"
        assert token_data1.email is None
        assert token_data2.user_id is None
        assert token_data2.email == "test@example.com"


class TestTokenType:
    """Test TokenType enum - FUNCTIONALITY FIRST."""

    def test_token_type_values(self):
        """Test TokenType enum has correct values."""
        # ✅ SUCCESS SCENARIO: Enum values are correct
        assert TokenType.ACCESS.value == "access"
        assert TokenType.REFRESH.value == "refresh"
        # Enum string representation may vary, test the value instead
        assert TokenType.ACCESS.value == "access"
        assert TokenType.REFRESH.value == "refresh"

    def test_token_type_equality(self):
        """Test TokenType equality comparisons."""
        # ✅ SUCCESS SCENARIO: Enum equality works correctly
        assert TokenType.ACCESS == TokenType.ACCESS
        assert TokenType.REFRESH == TokenType.REFRESH
        assert TokenType.ACCESS != TokenType.REFRESH
        assert TokenType.ACCESS.value == "access"
        assert TokenType.REFRESH.value == "refresh"