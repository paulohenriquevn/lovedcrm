"""
🏢 Organizations E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - Real functionality
PRIORITY 2: Validation scenarios (4XX) - Security and validation
OBJECTIVE: Verify organization management TRULY WORKS

Updated for header-based multi-tenancy where users get auto-created organizations.
"""
from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid
)


class TestOrganizationsSuccess:
    """PRIORITY 1: Test successful organization operations (2XX responses)."""

    def test_get_current_organization_success(self, api_client, authenticated_user):
        """✅ Test getting current organization returns 200 with organization data."""
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current")
        
        assert_successful_response(response, 200)
        
        # Verify organization data
        data = response.json()
        assert_valid_uuid(data["id"])
        assert data["id"] == authenticated_user["organization"]["id"]
        assert "name" in data
        assert "slug" in data
        assert data["is_active"] is True
        assert data["owner_id"] == authenticated_user["user"]["id"]
        assert "created_at" in data

    def test_update_current_organization_success(self, api_client, authenticated_user):
        """✅ Test updating current organization returns 200 with updated data."""
        # First get current organization
        get_response = api_client.get(f"{TEST_BASE_URL}/organizations/current")
        assert_successful_response(get_response, 200)
        original_data = get_response.json()
        
        # Update organization
        update_data = {
            "name": "Updated Organization Name",
            "description": "Updated description for testing"
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/organizations/current", json=update_data)
        
        assert_successful_response(response, 200)
        
        # Verify updated data
        data = response.json()
        assert data["id"] == original_data["id"]  # ID should not change
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["slug"] == original_data["slug"]  # Slug should not change

    def test_list_organization_members_success(self, api_client, authenticated_user):
        """✅ Test listing organization members returns 200 with member list."""
        response = api_client.get(f"{TEST_BASE_URL}/organizations/members")
        
        assert_successful_response(response, 200)
        
        # Verify response is a list with at least the owner
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # At least the owner should be present
        
        # Find the owner in the members list
        owner_found = False
        for member in data:
            if member["user_id"] == authenticated_user["user"]["id"]:
                assert member["role"] == "owner"
                assert member["is_active"] is True
                owner_found = True
                break
        assert owner_found, "Owner should be in the members list"


class TestOrganizationsValidation:
    """PRIORITY 2: Test validation and error scenarios (4XX responses)."""

    def test_get_current_organization_unauthenticated_fails(self, api_client):
        """❌ Test getting current organization without auth returns 403."""
        # Remove authorization header
        if "Authorization" in api_client.headers:
            del api_client.headers["Authorization"]
        if "X-Org-Id" in api_client.headers:
            del api_client.headers["X-Org-Id"]
            
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current")
        
        assert_error_response(response, 403)  # Focus on status code, not exact message

    def test_get_current_organization_without_org_header_fails(self, api_client, authenticated_user):
        """❌ Test getting current organization without X-Org-Id header returns 400."""
        # Remove X-Org-Id header but keep Authorization
        if "X-Org-Id" in api_client.headers:
            del api_client.headers["X-Org-Id"]
            
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current")
        
        assert_error_response(response, 400, "Missing X-Org-Id header")

    def test_get_current_organization_with_wrong_org_id_fails(self, api_client, authenticated_user):
        """❌ Test getting current organization with wrong X-Org-Id returns 403."""
        # Set wrong X-Org-Id header
        api_client.headers.update({"X-Org-Id": "00000000-0000-0000-0000-000000000000"})
        
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current")
        
        assert_error_response(response, 403, "organization mismatch")

    def test_update_organization_invalid_data_fails(self, api_client, authenticated_user):
        """❌ Test updating organization with invalid data returns 422."""
        invalid_data = {
            "name": "",  # Empty name should fail
            "description": "Valid description"
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/organizations/current", json=invalid_data)
        
        assert_error_response(response, 422)

    def test_list_members_unauthenticated_fails(self, api_client):
        """❌ Test listing members without auth returns 403."""
        # Remove authorization header
        if "Authorization" in api_client.headers:
            del api_client.headers["Authorization"]
        if "X-Org-Id" in api_client.headers:
            del api_client.headers["X-Org-Id"]
            
        response = api_client.get(f"{TEST_BASE_URL}/organizations/members")
        
        assert_error_response(response, 403)  # Focus on status code, not exact message


class TestOrganizationsEdgeCases:
    """PRIORITY 3: Test edge cases and special scenarios."""

    def test_organization_data_structure_completeness(self, api_client, authenticated_user):
        """🔍 Test that organization data contains all expected fields."""
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current")
        
        assert_successful_response(response, 200)
        
        data = response.json()
        required_fields = ["id", "name", "slug", "is_active", "created_at", "updated_at", "owner_id"]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
            assert data[field] is not None, f"Field {field} should not be None"

    def test_organization_member_structure_completeness(self, api_client, authenticated_user):
        """🔍 Test that member data contains all expected fields."""
        response = api_client.get(f"{TEST_BASE_URL}/organizations/members")
        
        assert_successful_response(response, 200)
        
        data = response.json()
        assert len(data) > 0, "Should have at least one member (the owner)"
        
        member = data[0]
        required_fields = ["user_id", "role", "is_active", "created_at"]
        
        for field in required_fields:
            assert field in member, f"Missing required field in member: {field}"

    def test_update_organization_partial_data_success(self, api_client, authenticated_user):
        """✅ Test updating organization with partial data works."""
        # Update only name
        update_data = {"name": "Partially Updated Name"}
        
        response = api_client.put(f"{TEST_BASE_URL}/organizations/current", json=update_data)
        
        assert_successful_response(response, 200)
        
        data = response.json()
        assert data["name"] == update_data["name"]
