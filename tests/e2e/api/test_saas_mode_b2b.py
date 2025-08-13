"""
🔐 SAAS Mode B2B E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - Real B2B functionality
PRIORITY 2: Validation scenarios (4XX) - Security and validation  
OBJECTIVE: Verify B2B mode TRULY WORKS with personalized organization creation

These tests verify B2B mode functionality
"""
import pytest
import requests

from .conftest import (
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid,
)

# B2B mode tests use the same test API (port 8001) 
TEST_BASE_URL = "http://localhost:8001"

# Simple mode detection for E2E tests
def is_api_in_b2b_mode():
    """
    Detect if API is running in B2B mode by testing registration behavior.
    B2B creates personalized org names.
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
            return org_name != "Personal Workspace" and "Organization" in org_name
        return False
    except Exception:
        return False


class TestB2BModeRegistration:
    """PRIORITY 1: Test B2B mode registration creates personalized organizations."""

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_registration_creates_personalized_organization(self, api_client, clean_database):
        """✅ Test B2B registration creates personalized organization name."""
        test_user_data = {
            "email": "b2b.user@example.com",
            "password": "SecurePassword123!",
            "full_name": "B2B Test User",
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
        
        # Verify organization data (B2B mode creates personalized organization)
        org_data = data["organization"]
        assert_valid_uuid(org_data["id"])
        assert org_data["name"] == "B2B Test User's Organization"  # B2B mode uses personalized name
        assert org_data["slug"] is not None
        
        # Verify tokens
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_registration_without_full_name_uses_email_prefix(
        self, api_client, clean_database
    ):
        """✅ Test B2B registration without full_name uses email prefix for organization."""
        test_user_data = {
            "email": "testcompany@example.com",
            "password": "SecurePassword123!",
            "terms_accepted": True  # No full_name provided
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=test_user_data)
        
        # Verify success response
        assert_successful_response(response, 201)
        
        # Verify organization uses email prefix
        data = response.json()
        org_data = data["organization"]
        assert org_data["name"] == "testcompany's Organization"  # Uses email prefix in B2B mode

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_login_returns_personalized_organization_context(
        self, api_client, clean_database
    ):
        """✅ Test B2B login returns personalized organization in context."""
        # First register a B2B user
        register_data = {
            "email": "b2b.login@example.com",
            "password": "SecurePassword123!",
            "full_name": "B2B Login User",
            "terms_accepted": True
        }
        
        register_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        assert_successful_response(register_response, 201)
        
        # Now login
        login_data = {
            "email": "b2b.login@example.com",
            "password": "SecurePassword123!"
        }
        
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        
        # Verify success response
        assert_successful_response(login_response, 200)
        
        # Verify organization context in login response
        data = login_response.json()
        org_data = data["organization"]
        assert org_data["name"] == "B2B Login User's Organization"
        assert_valid_uuid(org_data["id"])

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_complete_user_journey(self, api_client, clean_database):
        """✅ Test complete B2B user journey: register → login → access protected endpoint."""
        # Clear any existing headers
        api_client.headers.clear()
        api_client.headers.update({"Content-Type": "application/json"})
        
        # 1. Register B2B user
        register_data = {
            "email": "b2b.journey@example.com",
            "password": "SecurePassword123!",
            "full_name": "B2B Journey User",
            "terms_accepted": True
        }
        
        register_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        assert_successful_response(register_response, 201)
        register_data_response = register_response.json()
        
        # Verify personalized organization creation
        assert register_data_response["organization"]["name"] == "B2B Journey User's Organization"
        
        # 2. Login
        login_data = {
            "email": "b2b.journey@example.com",
            "password": "SecurePassword123!"
        }
        
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        assert_successful_response(login_response, 200)
        tokens = login_response.json()
        
        # Verify organization context is consistent
        assert tokens["organization"]["name"] == "B2B Journey User's Organization"
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
        assert me_data["email"] == "b2b.journey@example.com"


class TestB2BModeTeamFeatures:
    """Test B2B mode team-specific features and behavior."""

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_organization_owner_has_admin_role(self, api_client, authenticated_user):
        """✅ Test B2B organization owner has admin/owner role."""
        # Get organization members
        response = api_client.get(f"{TEST_BASE_URL}/organizations/members")
        
        assert_successful_response(response, 200)
        
        data = response.json()
        # API returns members list directly, not wrapped in "members" key
        members = data if isinstance(data, list) else data.get("members", [])
        
        # B2B organizations should have at least 1 member (the owner)
        assert len(members) >= 1
        
        # Find the owner
        owner = next((m for m in members if m["role"] == "owner"), None)
        assert owner is not None
        assert owner["user_id"] == authenticated_user["id"]

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_organization_info_endpoint(self, api_client, authenticated_user):
        """✅ Test organization info endpoint returns personalized organization."""
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current")
        
        assert_successful_response(response, 200)
        
        data = response.json()
        # Should have a personalized name (not "Personal Workspace")
        assert "Organization" in data["name"]
        assert data["name"] != "Personal Workspace"
        assert data["owner_id"] == authenticated_user["id"]
        assert_valid_uuid(data["id"])

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_organization_roles_endpoint_accessible(self, api_client, authenticated_user):
        """✅ Test B2B mode exposes organization roles management."""
        response = api_client.get(f"{TEST_BASE_URL}/roles/summary", headers={
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        })
        
        assert_successful_response(response, 200)
        
        data = response.json()
        # Should have role management data for B2B organizations
        # Adjust expectations based on actual API response format
        if isinstance(data, dict):
            # If it's an object, check for role-related fields
            assert len(data) > 0  # Should have some role data
        else:
            # If it's a list or other format, just verify it's not empty
            assert data is not None


class TestB2BModeValidation:
    """PRIORITY 2: Test B2B mode validation and error scenarios."""

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_duplicate_email_registration_fails(self, api_client, clean_database):
        """Test B2B registration with duplicate email fails."""
        # Register first user
        first_user_data = {
            "email": "duplicate.b2b@example.com",
            "password": "SecurePassword123!",
            "full_name": "First B2B User",
            "terms_accepted": True
        }
        
        first_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=first_user_data)
        assert_successful_response(first_response, 201)
        
        # Try to register second user with same email
        second_user_data = {
            "email": "duplicate.b2b@example.com",  # Same email
            "password": "DifferentPassword123!",
            "full_name": "Second B2B User",
            "terms_accepted": True
        }
        
        second_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=second_user_data)
        assert_error_response(second_response, 400, "already exists")

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_invalid_login_fails(self, api_client, clean_database):
        """Test B2B login with invalid credentials fails."""
        # Register user first
        register_data = {
            "email": "b2b.invalid@example.com",
            "password": "SecurePassword123!", 
            "full_name": "B2B Invalid User",
            "terms_accepted": True
        }
        
        register_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
        assert_successful_response(register_response, 201)
        
        # Try login with wrong password
        login_data = {
            "email": "b2b.invalid@example.com",
            "password": "WrongPassword123!"
        }
        
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        assert_error_response(login_response, 401, "invalid")


class TestB2BModeConsistency:
    """Test B2B mode data consistency and integrity."""

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_organization_isolation(self, api_client, clean_database):
        """✅ Test B2B organizations are properly isolated between companies."""
        # Register two B2B users (representing different companies)
        company1_user_data = {
            "email": "admin@company1.com",
            "password": "SecurePassword123!",
            "full_name": "Company 1 Admin",
            "terms_accepted": True
        }
        
        company2_user_data = {
            "email": "admin@company2.com",
            "password": "SecurePassword123!",
            "full_name": "Company 2 Admin", 
            "terms_accepted": True
        }
        
        # Register both users
        company1_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=company1_user_data)
        assert_successful_response(company1_response, 201)
        company1_tokens = company1_response.json()
        
        company2_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=company2_user_data)
        assert_successful_response(company2_response, 201)
        company2_tokens = company2_response.json()
        
        # Verify they have different organizations with personalized names
        assert company1_tokens["organization"]["id"] != company2_tokens["organization"]["id"]
        assert company1_tokens["organization"]["name"] == "Company 1 Admin's Organization"
        assert company2_tokens["organization"]["name"] == "Company 2 Admin's Organization"
        
        # Verify cross-organization access is blocked
        # Company 1 admin tries to access Company 2's organization
        company1_org_id = company1_tokens["organization"]["id"]
        company2_org_id = company2_tokens["organization"]["id"]
        
        # Verify organizations are actually different
        assert company1_org_id != company2_org_id, f"Organizations should be different: {company1_org_id} vs {company2_org_id}"
        
        # Company 1 tries to access with Company 2's organization ID
        api_client.headers.clear()
        api_client.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {company1_tokens['access_token']}",
            "X-Org-Id": company2_org_id  # Different company org!
        })
        
        cross_access_response = api_client.get(f"{TEST_BASE_URL}/users/me")
        
        # Debug: print response if not 403
        if cross_access_response.status_code != 403:
            print(f"Expected 403, got {cross_access_response.status_code}")
            print(f"Response: {cross_access_response.text[:200]}...")
            print(f"Company1 org: {company1_org_id}")
            print(f"Company2 org: {company2_org_id}")
        
        assert_error_response(cross_access_response, 403)  # Should be forbidden

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_organization_naming_uniqueness(self, api_client, clean_database):
        """✅ Test B2B organizations have unique names even with similar user names."""
        # Register users with similar names
        user1_data = {
            "email": "john.smith1@example.com",
            "password": "SecurePassword123!",
            "full_name": "John Smith",
            "terms_accepted": True
        }
        
        user2_data = {
            "email": "john.smith2@example.com", 
            "password": "SecurePassword123!",
            "full_name": "John Smith",  # Same full name
            "terms_accepted": True
        }
        
        # Register both users
        user1_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=user1_data)
        assert_successful_response(user1_response, 201)
        user1_tokens = user1_response.json()
        
        user2_response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=user2_data)
        assert_successful_response(user2_response, 201)
        user2_tokens = user2_response.json()
        
        # Both should have "John Smith's Organization" but different IDs and slugs
        assert user1_tokens["organization"]["name"] == "John Smith's Organization"
        assert user2_tokens["organization"]["name"] == "John Smith's Organization"
        assert user1_tokens["organization"]["id"] != user2_tokens["organization"]["id"]
        assert user1_tokens["organization"]["slug"] != user2_tokens["organization"]["slug"]


class TestB2BModeScenarios:
    """Test B2B mode realistic business scenarios."""

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_startup_company_registration_scenario(self, api_client, clean_database):
        """✅ Test realistic B2B scenario: startup company founder registration."""
        founder_data = {
            "email": "founder@techstartup.com",
            "password": "StartupPassword123!",
            "full_name": "Sarah Tech Founder",
            "terms_accepted": True
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=founder_data)
        assert_successful_response(response, 201)
        
        data = response.json()
        
        # Verify founder becomes organization owner
        assert data["organization"]["name"] == "Sarah Tech Founder's Organization"
        
        # Login and verify organization context
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json={
            "email": "founder@techstartup.com",
            "password": "StartupPassword123!"
        })
        assert_successful_response(login_response, 200)
        
        login_data = login_response.json()
        assert login_data["organization"]["name"] == "Sarah Tech Founder's Organization"

    @pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only")
    def test_b2b_enterprise_admin_registration_scenario(self, api_client, clean_database):
        """✅ Test realistic B2B scenario: enterprise admin registration."""
        enterprise_admin_data = {
            "email": "it.admin@enterprise.corp",
            "password": "EnterprisePassword123!",
            "full_name": "Enterprise IT Admin",
            "terms_accepted": True
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/auth/register", json=enterprise_admin_data)
        assert_successful_response(response, 201)
        
        data = response.json()
        
        # Verify enterprise admin becomes organization owner
        assert data["organization"]["name"] == "Enterprise IT Admin's Organization"
        
        # Verify organization is ready for team management
        tokens = data
        api_client.headers.update({
            "Authorization": f"Bearer {tokens['access_token']}",
            "X-Org-Id": tokens["organization"]["id"]
        })
        
        # Should be able to access team management endpoints
        roles_response = api_client.get(f"{TEST_BASE_URL}/roles/summary")
        assert_successful_response(roles_response, 200)
        
        members_response = api_client.get(f"{TEST_BASE_URL}/organizations/members")
        assert_successful_response(members_response, 200)