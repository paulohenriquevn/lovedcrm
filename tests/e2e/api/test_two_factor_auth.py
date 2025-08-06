"""
🔐 Two-Factor Authentication E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - Real functionality
PRIORITY 2: Validation scenarios (4XX) - Security and validation
OBJECTIVE: Verify 2FA system TRULY WORKS end-to-end

Test Coverage:
- 2FA Setup Flow (generate secret → confirm → enable)
- 2FA Login Flow (optional authentication)
- 2FA Management (disable, backup codes, status)
- Multi-tenant isolation
- Security validations
"""
import base64
import json
import re
from typing import Dict, Any

import pytest
import pyotp

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid,
)


@pytest.mark.two_factor_auth
class TestTwoFactorAuthSuccess:
    """PRIORITY 1: Test successful 2FA flows (2XX responses)."""

    def test_2fa_status_initial_disabled(self, api_client, authenticated_user):
        """✅ Test 2FA status returns disabled for new users."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        response = api_client.get(f"{TEST_BASE_URL}/users/me/2fa/status", headers=headers)
        
        assert_successful_response(response, 200)
        
        data = response.json()
        assert data["is_enabled"] is False
        assert data["is_confirmed"] is False
        assert data["backup_codes_remaining"] == 0
        assert data["last_used_at"] is None
        assert data["setup_date"] is None

    def test_2fa_setup_generates_secret_and_qr(self, api_client, authenticated_user):
        """✅ Test 2FA setup generates valid secret, QR code, and backup codes."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/setup", headers=headers)
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify secret key format (Base32)
        assert "secret_key" in data
        secret_key = data["secret_key"]
        assert len(secret_key) >= 16  # Minimum TOTP secret length
        assert re.match(r'^[A-Z2-7]+$', secret_key)  # Base32 format
        
        # Verify QR code is data URI
        assert "qr_code_data_uri" in data
        qr_code = data["qr_code_data_uri"]
        assert qr_code.startswith("data:image/png;base64,")
        
        # Verify backup codes
        assert "backup_codes" in data
        backup_codes = data["backup_codes"]
        assert len(backup_codes) == 8  # Default number of backup codes
        for code in backup_codes:
            assert len(code) == 8  # 8-digit backup codes
            assert code.isdigit()
        
        # Store secret for subsequent tests
        authenticated_user['2fa_secret'] = secret_key
        authenticated_user['backup_codes'] = backup_codes

    def test_2fa_confirm_with_valid_token(self, api_client, authenticated_user):
        """✅ Test 2FA confirmation with valid TOTP token enables 2FA."""
        # First setup 2FA to get secret
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        setup_response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/setup", headers=headers)
        assert_successful_response(setup_response, 200)
        
        setup_data = setup_response.json()
        secret_key = setup_data["secret_key"]
        
        # Generate valid TOTP token
        totp = pyotp.TOTP(secret_key)
        current_token = totp.now()
        
        # Confirm 2FA setup
        confirm_data = {"token": current_token}
        response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/confirm", json=confirm_data, headers=headers)
        
        assert_successful_response(response, 200)
        
        data = response.json()
        assert "message" in data
        assert "successfully enabled" in data["message"].lower()
        
        # Verify 2FA is now enabled
        status_response = api_client.get(f"{TEST_BASE_URL}/users/me/2fa/status", headers=headers)
        assert_successful_response(status_response, 200)
        
        status_data = status_response.json()
        assert status_data["is_enabled"] is True
        assert status_data["is_confirmed"] is True
        assert status_data["setup_date"] is not None

    def test_2fa_login_flow_optional(self, api_client, clean_database, test_user_data):
        """✅ Test complete 2FA login flow: normal login → setup 2FA → 2FA login."""
        # 1. Register and login user normally
        register_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=test_user_data)
        assert_successful_response(register_response, 201)
        
        register_data = register_response.json()
        user_email = register_data["user"]["email"]
        access_token = register_data["access_token"]
        org_id = register_data["organization"]["id"]
        
        # 2. Setup 2FA
        headers = {"Authorization": f"Bearer {access_token}", "X-Org-Id": org_id}
        setup_response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/setup", headers=headers)
        assert_successful_response(setup_response, 200)
        
        setup_data = setup_response.json()
        secret_key = setup_data["secret_key"]
        
        # 3. Confirm 2FA
        totp = pyotp.TOTP(secret_key)
        confirm_token = totp.now()
        confirm_data = {"token": confirm_token}
        confirm_response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/confirm", json=confirm_data, headers=headers)
        assert_successful_response(confirm_response, 200)
        
        # 4. Test login without 2FA token (should require 2FA)
        login_data = {
            "email": user_email,
            "password": test_user_data["password"],
            "recaptcha_token": "test_token"
        }
        
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        assert_successful_response(login_response, 200)
        
        login_result = login_response.json()
        assert login_result["requires_2fa"] is True
        assert "2FA token required" in login_result["message"]
        
        # 5. Test login with valid 2FA token (should succeed)
        totp_token = totp.now()
        login_data_with_2fa = {
            "email": user_email,
            "password": test_user_data["password"],
            "totp_token": totp_token,
            "recaptcha_token": "test_token"
        }
        
        login_with_2fa_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data_with_2fa)
        assert_successful_response(login_with_2fa_response, 200)
        
        login_with_2fa_result = login_with_2fa_response.json()
        assert "access_token" in login_with_2fa_result
        assert "user" in login_with_2fa_result
        assert login_with_2fa_result.get("requires_2fa", False) is False

    def test_2fa_backup_code_login(self, api_client, clean_database, test_user_data):
        """✅ Test login with backup code works correctly."""
        # Setup user with 2FA
        register_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=test_user_data)
        register_data = register_response.json()
        
        user_email = register_data["user"]["email"]
        access_token = register_data["access_token"]
        org_id = register_data["organization"]["id"]
        
        headers = {"Authorization": f"Bearer {access_token}", "X-Org-Id": org_id}
        
        # Setup and confirm 2FA
        setup_response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/setup", headers=headers)
        setup_data = setup_response.json()
        secret_key = setup_data["secret_key"]
        backup_codes = setup_data["backup_codes"]
        
        totp = pyotp.TOTP(secret_key)
        confirm_response = api_client.post(
            f"{TEST_BASE_URL}/users/me/2fa/confirm",
            json={"token": totp.now()},
            headers=headers
        )
        assert_successful_response(confirm_response, 200)
        
        # Test login with backup code
        login_data_with_backup = {
            "email": user_email,
            "password": test_user_data["password"],
            "backup_code": backup_codes[0],  # Use first backup code
            "recaptcha_token": "test_token"
        }
        
        backup_login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data_with_backup)
        assert_successful_response(backup_login_response, 200)
        
        backup_login_result = backup_login_response.json()
        assert "access_token" in backup_login_result
        assert backup_login_result.get("requires_2fa", False) is False

    def test_2fa_regenerate_backup_codes(self, api_client, authenticated_user_with_2fa):
        """✅ Test regenerating backup codes returns new codes."""
        headers = {
            "Authorization": f"Bearer {authenticated_user_with_2fa['tokens']['access_token']}",
            "X-Org-Id": authenticated_user_with_2fa['organization']['id']
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/backup-codes", headers=headers)
        
        assert_successful_response(response, 200)
        
        data = response.json()
        assert "backup_codes" in data
        assert "codes_count" in data
        assert data["codes_count"] == len(data["backup_codes"])
        assert data["codes_count"] == 8  # Default number
        
        # Verify all codes are 8-digit numbers
        for code in data["backup_codes"]:
            assert len(code) == 8
            assert code.isdigit()

    def test_2fa_disable_with_token(self, api_client, authenticated_user_with_2fa):
        """✅ Test disabling 2FA with TOTP token works."""
        headers = {
            "Authorization": f"Bearer {authenticated_user_with_2fa['tokens']['access_token']}",
            "X-Org-Id": authenticated_user_with_2fa['organization']['id']
        }
        
        # Generate valid TOTP token
        secret_key = authenticated_user_with_2fa['2fa_secret']
        totp = pyotp.TOTP(secret_key)
        current_token = totp.now()
        
        disable_data = {"token": current_token}
        response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/disable", json=disable_data, headers=headers)
        
        assert_successful_response(response, 200)
        
        data = response.json()
        assert "message" in data
        assert "successfully disabled" in data["message"].lower()
        
        # Verify 2FA is now disabled
        status_response = api_client.get(f"{TEST_BASE_URL}/users/me/2fa/status", headers=headers)
        status_data = status_response.json()
        assert status_data["is_enabled"] is False


@pytest.mark.two_factor_auth
class TestTwoFactorAuthValidation:
    """PRIORITY 2: Test 2FA validation and security (4XX responses)."""

    def test_2fa_setup_already_enabled_fails(self, api_client, authenticated_user_with_2fa):
        """❌ Test 2FA setup fails when already enabled."""
        headers = {
            "Authorization": f"Bearer {authenticated_user_with_2fa['tokens']['access_token']}",
            "X-Org-Id": authenticated_user_with_2fa['organization']['id']
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/setup", headers=headers)
        
        assert_error_response(response, 400)
        
        data = response.json()
        assert "already enabled" in data["detail"].lower()

    def test_2fa_confirm_invalid_token_fails(self, api_client, authenticated_user):
        """❌ Test 2FA confirmation fails with invalid token."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        # Setup 2FA first
        setup_response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/setup", headers=headers)
        assert_successful_response(setup_response, 200)
        
        # Try to confirm with invalid token
        invalid_token_data = {"token": "000000"}  # Invalid token
        response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/confirm", json=invalid_token_data, headers=headers)
        
        assert_error_response(response, 400)
        
        data = response.json()
        assert "invalid" in data["detail"].lower()

    def test_2fa_login_invalid_token_fails(self, api_client, authenticated_user_with_2fa):
        """❌ Test 2FA login fails with invalid token."""
        user_email = authenticated_user_with_2fa['user']['email'] 
        
        login_data = {
            "email": user_email,
            "password": "testpassword123",  # Default test password
            "totp_token": "000000",  # Invalid token
            "recaptcha_token": "test_token"
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        
        assert_error_response(response, 401)
        
        data = response.json()
        # Should be invalid 2FA token or invalid credentials (both are valid responses)
        assert "invalid" in data["detail"].lower()
        # Accept either 2FA-specific message or general invalid credentials
        assert ("2fa" in data["detail"].lower() or 
                "token" in data["detail"].lower() or 
                "credentials" in data["detail"].lower())

    def test_2fa_endpoints_require_authentication(self, api_client):
        """❌ Test all 2FA endpoints require authentication."""
        endpoints = [
            ("GET", "/users/me/2fa/status"),
            ("POST", "/users/me/2fa/setup"),
            ("POST", "/users/me/2fa/confirm"),
            ("POST", "/users/me/2fa/disable"),
            ("POST", "/users/me/2fa/backup-codes"),
        ]
        
        for method, endpoint in endpoints:
            if method == "GET":
                response = api_client.get(f"{TEST_BASE_URL}{endpoint}")
            else:
                response = api_client.post(f"{TEST_BASE_URL}{endpoint}", json={})
            
            # Accept either 401 (unauthorized) or 403 (forbidden) - both indicate auth required
            assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code} for {endpoint}"

    def test_2fa_token_format_validation(self, api_client, authenticated_user):
        """❌ Test TOTP token format validation."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        # Setup 2FA first
        setup_response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/setup", headers=headers)
        assert_successful_response(setup_response, 200)
        
        invalid_tokens = [
            "12345",      # Too short
            "1234567",    # Too long
            "abcdef",     # Non-numeric
            "12-34-56",   # Special characters
            "",           # Empty
        ]
        
        for invalid_token in invalid_tokens:
            confirm_data = {"token": invalid_token}
            response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/confirm", json=confirm_data, headers=headers)
            
            assert response.status_code == 422  # Validation error


@pytest.mark.two_factor_auth
class TestTwoFactorAuthMultiTenant:
    """Test 2FA multi-tenant isolation."""

    def test_2fa_organization_isolation(self, api_client, authenticated_user, other_organization):
        """🔒 Test 2FA operations respect organization boundaries."""
        # Try to access 2FA with wrong organization ID
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": other_organization['id']  # Wrong organization!
        }
        
        response = api_client.get(f"{TEST_BASE_URL}/users/me/2fa/status", headers=headers)
        
        assert_error_response(response, 403)
        
        data = response.json()
        assert "organization" in data["detail"].lower() or "access" in data["detail"].lower()


# =====================================================
# 🧪 FIXTURES FOR 2FA TESTING
# =====================================================

@pytest.fixture
def authenticated_user_with_2fa(api_client, authenticated_user):
    """Create user with 2FA already enabled for testing."""
    headers = {
        "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
        "X-Org-Id": authenticated_user['organization']['id']
    }
    
    # Setup 2FA
    setup_response = api_client.post(f"{TEST_BASE_URL}/users/me/2fa/setup", headers=headers)
    setup_data = setup_response.json()
    secret_key = setup_data["secret_key"]
    
    # Confirm 2FA
    totp = pyotp.TOTP(secret_key)
    confirm_data = {"token": totp.now()}
    api_client.post(f"{TEST_BASE_URL}/users/me/2fa/confirm", json=confirm_data, headers=headers)
    
    # Add 2FA data to user
    authenticated_user['2fa_secret'] = secret_key
    authenticated_user['backup_codes'] = setup_data["backup_codes"]
    
    return authenticated_user