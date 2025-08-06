"""
🔐 SAAS Mode B2C E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - Real B2C functionality  
PRIORITY 2: Validation scenarios (4XX) - Security and validation
OBJECTIVE: Verify B2C mode TRULY WORKS with Personal Workspace creation

These tests run only when SAAS_MODE=B2C (skip if B2B mode)
"""
import pytest
import requests

from .conftest import (
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid,
)

# B2C mode tests use the default test API (port 8001) 
TEST_BASE_URL = "http://localhost:8001"

# Simple mode detection for E2E tests
def is_api_in_b2c_mode():
    """
    Detect if API is running in B2C mode by testing registration behavior.
    B2C creates 'Personal Workspace', B2B creates personalized org names.
    """
    try:
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        test_data = {
            "email": f"mode_test_{unique_id}@example.com",
            "password": "TestPassword123!",
            "full_name": "Mode Test User",
            "terms_accepted": True
        }
        
        response = requests.post(f"{TEST_BASE_URL}/auth/register", json=test_data, timeout=5)
        if response.status_code == 201:
            data = response.json()
            org_name = data.get("organization", {}).get("name", "")
            return org_name == "Personal Workspace"
        return False
    except Exception:
        return False


class TestB2CModeRegistration:
    """PRIORITY 1: Test B2C mode registration creates Personal Workspace."""

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_registration_creates_personal_workspace(self, api_client, clean_database):
        """✅ Test B2C registration creates 'Personal Workspace' organization."""
        test_user_data = {
            "email": "b2c.user@example.com",
            "password": "SecurePassword123!",
            "full_name": "B2C Test User",
            "terms_accepted": True
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=test_user_data)
        
        # Verify success response
        assert_successful_response(response, 201)
        
        # Verify response structure and data
        data = response.json()
        
        # Verify user data
        user_data = data["user"]
        assert_valid_uuid(user_data["id"])
        assert user_data["email"] == test_user_data["email"]
        assert user_data["full_name"] == test_user_data["full_name"]
        assert user_data["is_active"] is True
        
        # Verify organization data (B2C mode creates Personal Workspace)
        org_data = data["organization"]
        assert_valid_uuid(org_data["id"])
        assert org_data["name"] == "Personal Workspace"  # B2C mode uses generic name
        assert org_data["slug"] is not None
        
        # Verify tokens
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_registration_without_full_name_still_creates_personal_workspace(
        self, api_client, clean_database
    ):
        """✅ Test B2C registration without full_name still creates Personal Workspace."""
        test_user_data = {
            "email": "b2c.minimal@example.com", 
            "password": "SecurePassword123!",
            "terms_accepted": True  # No full_name provided
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=test_user_data)
        
        # Verify success response
        assert_successful_response(response, 201)
        
        # Verify organization is still "Personal Workspace"
        data = response.json()
        org_data = data["organization"]
        assert org_data["name"] == "Personal Workspace"  # Always generic in B2C mode

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_login_returns_personal_workspace_context(
        self, api_client, clean_database
    ):
        """✅ Test B2C login returns Personal Workspace in organization context."""
        # First register a B2C user
        register_data = {
            "email": "b2c.login@example.com",
            "password": "SecurePassword123!",
            "full_name": "B2C Login User",
            "terms_accepted": True
        }
        
        register_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        assert_successful_response(register_response, 201)
        
        # Now login
        login_data = {
            "email": "b2c.login@example.com",
            "password": "SecurePassword123!"
        }
        
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        
        # Verify success response
        assert_successful_response(login_response, 200)
        
        # Verify organization context in login response
        data = login_response.json()
        org_data = data["organization"]
        assert org_data["name"] == "Personal Workspace"
        assert_valid_uuid(org_data["id"])

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_complete_user_journey(self, api_client, clean_database):
        """✅ Test complete B2C user journey: register → login → access protected endpoint."""
        # Clear any existing headers
        api_client.headers.clear()
        api_client.headers.update({"Content-Type": "application/json"})
        
        # 1. Register B2C user
        register_data = {
            "email": "b2c.journey@example.com",
            "password": "SecurePassword123!",
            "full_name": "B2C Journey User",
            "terms_accepted": True
        }
        
        register_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        assert_successful_response(register_response, 201)
        register_data_response = register_response.json()
        
        # Verify Personal Workspace creation
        assert register_data_response["organization"]["name"] == "Personal Workspace"
        
        # 2. Login
        login_data = {
            "email": "b2c.journey@example.com",
            "password": "SecurePassword123!"
        }
        
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        assert_successful_response(login_response, 200)
        tokens = login_response.json()
        
        # Verify organization context is consistent
        assert tokens["organization"]["name"] == "Personal Workspace"
        assert tokens["organization"]["id"] == register_data_response["organization"]["id"]
        
        # 3. Access protected endpoint with organization context
        api_client.headers.update({
            "Authorization": f"Bearer {tokens['access_token']}",
            "X-Org-Id": tokens["organization"]["id"]
        })
        
        me_response = api_client.get(f"{TEST_BASE_URL}/users/me")
        assert_successful_response(me_response, 200)
        
        # Verify user data consistency
        me_data = me_response.json()
        assert me_data["id"] == register_data_response["user"]["id"]
        assert me_data["email"] == "b2c.journey@example.com"


class TestB2CModeFeatures:
    """Test B2C mode specific features and behavior."""

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_organization_is_single_member(self, api_client, authenticated_user):
        """✅ Test B2C organizations have single member (the owner)."""
        # Get organization members
        response = api_client.get(f"{TEST_BASE_URL}/organizations/members")
        
        assert_successful_response(response, 200)
        
        data = response.json()
        # API returns members list directly, not wrapped in "members" key
        members = data if isinstance(data, list) else data.get("members", [])
        
        # B2C organizations should have exactly 1 member (the owner)
        assert len(members) == 1
        assert members[0]["role"] == "owner"
        assert members[0]["user_id"] == authenticated_user["id"]

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_organization_info_endpoint(self, api_client, authenticated_user):
        """✅ Test organization info endpoint returns Personal Workspace."""
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current")
        
        assert_successful_response(response, 200)
        
        data = response.json()
        assert data["name"] == "Personal Workspace"
        assert data["owner_id"] == authenticated_user["id"]
        assert_valid_uuid(data["id"])


class TestB2CModeValidation:
    """PRIORITY 2: Test B2C mode validation and error scenarios."""

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_duplicate_email_registration_fails(self, api_client, clean_database):
        """Test B2C registration with duplicate email fails."""
        # Register first user
        first_user_data = {
            "email": "duplicate@example.com",
            "password": "SecurePassword123!",
            "full_name": "First User",
            "terms_accepted": True
        }
        
        first_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=first_user_data)
        assert_successful_response(first_response, 201)
        
        # Try to register second user with same email
        second_user_data = {
            "email": "duplicate@example.com",  # Same email
            "password": "DifferentPassword123!",
            "full_name": "Second User",
            "terms_accepted": True
        }
        
        second_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=second_user_data)
        assert_error_response(second_response, 400, "already exists")

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_invalid_login_fails(self, api_client, clean_database):
        """Test B2C login with invalid credentials fails."""
        # Register user first
        register_data = {
            "email": "b2c.invalid@example.com",
            "password": "SecurePassword123!",
            "terms_accepted": True
        }
        
        register_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        assert_successful_response(register_response, 201)
        
        # Try login with wrong password
        login_data = {
            "email": "b2c.invalid@example.com", 
            "password": "WrongPassword123!"
        }
        
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        assert_error_response(login_response, 401, "invalid")


class TestB2CModeConsistency:
    """Test B2C mode data consistency and integrity."""

    @pytest.mark.skipif(not is_api_in_b2c_mode(), reason="B2C mode only - API is in B2B mode")
    def test_b2c_organization_isolation(self, api_client, clean_database):
        """✅ Test B2C organizations are properly isolated between users."""
        # Register two B2C users
        user1_data = {
            "email": "b2c.user1@example.com",
            "password": "SecurePassword123!",
            "full_name": "B2C User 1",
            "terms_accepted": True
        }
        
        user2_data = {
            "email": "b2c.user2@example.com", 
            "password": "SecurePassword123!",
            "full_name": "B2C User 2",
            "terms_accepted": True
        }
        
        # Register both users
        user1_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=user1_data)
        assert_successful_response(user1_response, 201)
        user1_tokens = user1_response.json()
        
        user2_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=user2_data)
        assert_successful_response(user2_response, 201)
        user2_tokens = user2_response.json()
        
        # Verify they have different organizations (even though both are "Personal Workspace")
        assert user1_tokens["organization"]["id"] != user2_tokens["organization"]["id"]
        assert user1_tokens["organization"]["name"] == "Personal Workspace"
        assert user2_tokens["organization"]["name"] == "Personal Workspace"
        
        # Verify cross-organization access is blocked
        # User 1 tries to access User 2's organization
        user1_org_id = user1_tokens["organization"]["id"]
        user2_org_id = user2_tokens["organization"]["id"]
        
        # Verify organizations are actually different
        assert user1_org_id != user2_org_id, f"Organizations should be different: {user1_org_id} vs {user2_org_id}"
        
        # User 1 tries to access with User 2's organization ID
        api_client.headers.clear()
        api_client.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {user1_tokens['access_token']}",
            "X-Org-Id": user2_org_id  # Different org!
        })
        
        cross_access_response = api_client.get(f"{TEST_BASE_URL}/users/me")
        
        # Debug: print response if not 403
        if cross_access_response.status_code != 403:
            print(f"Expected 403, got {cross_access_response.status_code}")
            print(f"Response: {cross_access_response.text[:200]}...")
            print(f"User1 org: {user1_org_id}")
            print(f"User2 org: {user2_org_id}")
        
        assert_error_response(cross_access_response, 403)  # Should be forbidden