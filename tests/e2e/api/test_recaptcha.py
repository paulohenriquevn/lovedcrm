"""
🤖 reCAPTCHA E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - reCAPTCHA working properly
PRIORITY 2: Validation scenarios (4XX/5XX) - Security validation
OBJECTIVE: Verify reCAPTCHA integration TRULY WORKS
"""
import pytest

from .conftest import (
    TEST_BASE_URL,
    TEST_RECAPTCHA_ENABLED,
    assert_successful_response,
    assert_error_response,
    get_recaptcha_login_data,
    get_recaptcha_forgot_password_data,
)


@pytest.mark.skipif(not TEST_RECAPTCHA_ENABLED, reason="reCAPTCHA tests require TEST_RECAPTCHA_ENABLED=true")
class TestRecaptchaSuccess:
    """PRIORITY 1: Test successful reCAPTCHA validation (2XX responses)."""

    def test_register_with_recaptcha_success(self, api_client, clean_database, test_user_data):
        """✅ Test successful registration with valid reCAPTCHA token returns 201."""
        # test_user_data fixture already includes reCAPTCHA token when enabled
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=test_user_data)
        
        assert_successful_response(response, 201)
        
        # Verify response structure
        data = response.json()
        assert "user" in data
        assert "organization" in data
        assert "access_token" in data

    def test_login_with_recaptcha_success(self, api_client, registered_user):
        """✅ Test successful login with valid reCAPTCHA token returns 200."""
        login_data = get_recaptcha_login_data(
            registered_user["email"], 
            registered_user["password"]
        )
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        
        assert_successful_response(response, 200)
        
        # Verify response structure
        data = response.json()
        assert "user" in data
        assert "organization" in data
        assert "access_token" in data
        assert "refresh_token" in data

    def test_forgot_password_with_recaptcha_success(self, api_client, registered_user):
        """✅ Test successful password reset request with valid reCAPTCHA token returns 200."""
        forgot_data = get_recaptcha_forgot_password_data(registered_user["email"])
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/forgot-password", json=forgot_data)
        
        assert_successful_response(response, 200)
        
        # Verify response message
        data = response.json()
        assert "message" in data


@pytest.mark.skipif(not TEST_RECAPTCHA_ENABLED, reason="reCAPTCHA tests require TEST_RECAPTCHA_ENABLED=true")
class TestRecaptchaValidation:
    """PRIORITY 2: Test reCAPTCHA validation scenarios (4XX/5XX responses)."""

    def test_register_missing_recaptcha_token(self, api_client, clean_database, recaptcha_test_data):
        """❌ Test registration without reCAPTCHA token returns 429."""
        register_data = {
            "email": "test_missing_recaptcha@example.com",
            "password": "TestPassword123!",
            "full_name": "Test User",
            "terms_accepted": True
            # Deliberately missing recaptcha_token
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        
        assert_error_response(response, 429)
        
        # Verify error message
        data = response.json()
        assert "reCAPTCHA" in data.get("detail", "").lower() or "required" in data.get("detail", "").lower()

    def test_register_invalid_recaptcha_token(self, api_client, clean_database, recaptcha_test_data):
        """❌ Test registration with invalid reCAPTCHA token returns 429."""
        register_data = {
            "email": "test_invalid_recaptcha@example.com",
            "password": "TestPassword123!",
            "full_name": "Test User",
            "terms_accepted": True,
            "recaptcha_token": recaptcha_test_data["invalid_token"]
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        
        assert_error_response(response, 429)
        
        # Verify error message
        data = response.json()
        assert "suspicious" in data.get("detail", "").lower() or "recaptcha" in data.get("detail", "").lower()

    def test_login_missing_recaptcha_token(self, api_client, registered_user, recaptcha_test_data):
        """❌ Test login without reCAPTCHA token returns 429."""
        login_data = {
            "email": registered_user["email"],
            "password": registered_user["password"]
            # Deliberately missing recaptcha_token
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        
        assert_error_response(response, 429)
        
        # Verify error message
        data = response.json()
        assert "reCAPTCHA" in data.get("detail", "").lower() or "required" in data.get("detail", "").lower()

    def test_login_invalid_recaptcha_token(self, api_client, registered_user, recaptcha_test_data):
        """❌ Test login with invalid reCAPTCHA token returns 429."""
        login_data = {
            "email": registered_user["email"],
            "password": registered_user["password"],
            "recaptcha_token": recaptcha_test_data["invalid_token"]
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        
        assert_error_response(response, 429)
        
        # Verify error message
        data = response.json()
        assert "suspicious" in data.get("detail", "").lower() or "recaptcha" in data.get("detail", "").lower()

    def test_forgot_password_missing_recaptcha_token(self, api_client, registered_user):
        """❌ Test forgot password without reCAPTCHA token returns 429."""
        forgot_data = {
            "email": registered_user["email"]
            # Deliberately missing recaptcha_token
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/forgot-password", json=forgot_data)
        
        assert_error_response(response, 429)
        
        # Verify error message
        data = response.json()
        assert "reCAPTCHA" in data.get("detail", "").lower() or "required" in data.get("detail", "").lower()

    def test_forgot_password_invalid_recaptcha_token(self, api_client, registered_user, recaptcha_test_data):
        """❌ Test forgot password with invalid reCAPTCHA token returns 429."""
        forgot_data = {
            "email": registered_user["email"],
            "recaptcha_token": recaptcha_test_data["invalid_token"]
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/forgot-password", json=forgot_data)
        
        assert_error_response(response, 429)
        
        # Verify error message
        data = response.json()
        assert "suspicious" in data.get("detail", "").lower() or "recaptcha" in data.get("detail", "").lower()


@pytest.mark.skipif(not TEST_RECAPTCHA_ENABLED, reason="reCAPTCHA tests require TEST_RECAPTCHA_ENABLED=true")
class TestRecaptchaEdgeCases:
    """Edge cases and boundary testing for reCAPTCHA integration."""

    def test_register_empty_recaptcha_token(self, api_client, clean_database, recaptcha_test_data):
        """❌ Test registration with empty reCAPTCHA token returns 429."""
        register_data = {
            "email": "test_empty_recaptcha@example.com",
            "password": "TestPassword123!",
            "full_name": "Test User",
            "terms_accepted": True,
            "recaptcha_token": recaptcha_test_data["empty_token"]
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        
        assert_error_response(response, 429)

    def test_login_with_expired_recaptcha_token(self, api_client, registered_user, recaptcha_test_data):
        """❌ Test login with expired reCAPTCHA token returns 429."""
        login_data = {
            "email": registered_user["email"],
            "password": registered_user["password"],
            "recaptcha_token": recaptcha_test_data["expired_token"]
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        
        assert_error_response(response, 429)

    def test_multiple_requests_with_same_recaptcha_token(self, api_client, clean_database, test_user_data):
        """❌ Test that same reCAPTCHA token cannot be reused (single-use validation)."""
        # First request should succeed
        response1 = api_client.post(f"{TEST_BASE_URL}/auth/register", json=test_user_data)
        assert_successful_response(response1, 201)
        
        # Second request with same token should fail due to rate limiting
        # Note: This depends on backend implementation of token tracking
        test_user_data["email"] = "another_user@example.com"  # Different email
        response2 = api_client.post(f"{TEST_BASE_URL}/auth/register", json=test_user_data)
        
        # Should return 429 (rate limited) for token reuse
        assert_error_response(response2, 429)


class TestRecaptchaDisabled:
    """Test behavior when reCAPTCHA is disabled (production bypass)."""

    @pytest.mark.skipif(TEST_RECAPTCHA_ENABLED, reason="This test requires reCAPTCHA to be disabled")
    def test_register_without_recaptcha_when_disabled(self, api_client, clean_database):
        """✅ Test registration works without reCAPTCHA when it's disabled."""
        register_data = {
            "email": "test_no_recaptcha@example.com",
            "password": "TestPassword123!",
            "full_name": "Test User",
            "terms_accepted": True
            # No recaptcha_token field
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        
        assert_successful_response(response, 201)
        
        # Verify response structure
        data = response.json()
        assert "user" in data
        assert "organization" in data

    @pytest.mark.skipif(TEST_RECAPTCHA_ENABLED, reason="This test requires reCAPTCHA to be disabled")
    def test_login_without_recaptcha_when_disabled(self, api_client, registered_user):
        """✅ Test login works without reCAPTCHA when it's disabled."""
        login_data = {
            "email": registered_user["email"],
            "password": registered_user["password"]
            # No recaptcha_token field
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        
        assert_successful_response(response, 200)
        
        # Verify response structure
        data = response.json()
        assert "user" in data
        assert "access_token" in data
