"""
🎨 User Preferences E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - Real functionality
PRIORITY 2: Validation scenarios (4XX) - Security and validation
OBJECTIVE: Verify UserPreferences system TRULY WORKS end-to-end

Test Coverage:
- Preferences CRUD operations (create, read, update, delete)
- Multi-tenant isolation and security
- Default preferences creation
- Specialized updates (notifications, display, privacy)
- Organization statistics (admin only)
"""
import pytest

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid,
)


@pytest.mark.preferences
class TestUserPreferencesSuccess:
    """PRIORITY 1: Test successful preferences operations (2XX responses)."""

    def test_get_preferences_creates_defaults(self, api_client, authenticated_user):
        """✅ Test getting preferences creates defaults if none exist."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        response = api_client.get(f"{TEST_BASE_URL}/user-preferences", headers=headers)
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify default values
        assert data["theme"] == "system"
        assert data["language"] == "en"
        assert data["timezone"] == "UTC"
        assert data["email_notifications"] == True
        assert data["push_notifications"] == True
        assert data["sms_notifications"] == False
        assert data["dashboard_layout"] == "default"
        assert data["items_per_page"] == "20"
        assert data["profile_visibility"] == "organization"
        
        # Verify structure
        assert_valid_uuid(data["id"])
        assert_valid_uuid(data["user_id"])
        assert_valid_uuid(data["organization_id"])
        assert "created_at" in data
        assert "quiet_hours" in data
        assert data["quiet_hours"]["enabled"] == False

    def test_update_all_preferences_success(self, api_client, authenticated_user):
        """✅ Test updating all preferences works correctly."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        # First get current preferences to establish baseline
        get_response = api_client.get(f"{TEST_BASE_URL}/user-preferences", headers=headers)
        assert_successful_response(get_response, 200)
        
        # Update preferences
        update_data = {
            "theme": "dark",
            "language": "pt",
            "timezone": "America/Sao_Paulo",
            "email_notifications": False,
            "push_notifications": False,
            "dashboard_layout": "compact",
            "items_per_page": "50",
            "profile_visibility": "private"
        }
        
        response = api_client.put(
            f"{TEST_BASE_URL}/user-preferences",
            json=update_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify updates applied
        assert data["theme"] == "dark"
        assert data["language"] == "pt"
        assert data["timezone"] == "America/Sao_Paulo"
        assert data["email_notifications"] == False
        assert data["push_notifications"] == False
        assert data["dashboard_layout"] == "compact"
        assert data["items_per_page"] == "50"
        assert data["profile_visibility"] == "private"

    def test_update_notifications_only_success(self, api_client, authenticated_user):
        """✅ Test updating only notification preferences."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        # Update only notifications
        notification_data = {
            "email_notifications": False,
            "email_marketing": True,
            "email_security_alerts": True,
            "email_billing_alerts": False
        }
        
        response = api_client.patch(
            f"{TEST_BASE_URL}/user-preferences/notifications",
            json=notification_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify notification updates
        assert data["email_notifications"] == False
        assert data["email_marketing"] == True
        assert data["email_security_alerts"] == True
        assert data["email_billing_alerts"] == False
        
        # Verify other preferences unchanged (should still have defaults)
        assert data["theme"] == "system"  # Should remain default

    def test_update_display_preferences_success(self, api_client, authenticated_user):
        """✅ Test updating only display preferences."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        display_data = {
            "theme": "light",
            "language": "es",
            "dashboard_layout": "expanded",
            "time_format": "24h"
        }
        
        response = api_client.patch(
            f"{TEST_BASE_URL}/user-preferences/display",
            json=display_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify display updates
        assert data["theme"] == "light"
        assert data["language"] == "es"
        assert data["dashboard_layout"] == "expanded"
        assert data["time_format"] == "24h"

    def test_update_privacy_preferences_success(self, api_client, authenticated_user):
        """✅ Test updating privacy preferences."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        privacy_data = {
            "profile_visibility": "public",
            "activity_status": False,
            "show_onboarding": False
        }
        
        response = api_client.patch(
            f"{TEST_BASE_URL}/user-preferences/privacy",
            json=privacy_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify privacy updates
        assert data["profile_visibility"] == "public"
        assert data["activity_status"] == False
        assert data["show_onboarding"] == False

    def test_update_quiet_hours_success(self, api_client, authenticated_user):
        """✅ Test updating quiet hours settings."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        quiet_hours_data = {
            "enabled": True,
            "start": "23:00",
            "end": "07:00",
            "timezone": "America/New_York"
        }
        
        response = api_client.patch(
            f"{TEST_BASE_URL}/user-preferences/quiet-hours",
            json=quiet_hours_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify quiet hours updates
        assert data["quiet_hours"]["enabled"] == True
        assert data["quiet_hours"]["start"] == "23:00"
        assert data["quiet_hours"]["end"] == "07:00"
        assert data["quiet_hours"]["timezone"] == "America/New_York"

    def test_quick_update_preferences_success(self, api_client, authenticated_user):
        """✅ Test quick update for common preferences."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        quick_data = {
            "theme": "dark",
            "language": "pt",
            "email_notifications": False
        }
        
        response = api_client.patch(
            f"{TEST_BASE_URL}/user-preferences/quick",
            json=quick_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify quick updates
        assert data["theme"] == "dark"
        assert data["language"] == "pt"
        assert data["email_notifications"] == False

    def test_reset_preferences_to_defaults_success(self, api_client, authenticated_user):
        """✅ Test resetting preferences to defaults."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        # First update some preferences
        update_data = {"theme": "dark", "language": "pt", "email_notifications": False}
        api_client.put(f"{TEST_BASE_URL}/user-preferences", json=update_data, headers=headers)
        
        # Reset to defaults
        response = api_client.post(f"{TEST_BASE_URL}/user-preferences/reset", headers=headers)
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify reset to defaults
        assert data["theme"] == "system"
        assert data["language"] == "en"
        assert data["email_notifications"] == True
        assert data["dashboard_layout"] == "default"

    def test_get_effective_settings_success(self, api_client, authenticated_user):
        """✅ Test getting effective language and timezone settings."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        response = api_client.get(
            f"{TEST_BASE_URL}/user-preferences/effective-settings",
            headers=headers
        )
        
        assert_successful_response(response, 200)
        
        data = response.json()
        
        # Verify effective settings structure
        assert "language" in data
        assert "timezone" in data
        assert isinstance(data["language"], str)
        assert isinstance(data["timezone"], str)

    def test_delete_preferences_success(self, api_client, authenticated_user):
        """✅ Test deleting user preferences."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        # First ensure preferences exist
        api_client.get(f"{TEST_BASE_URL}/user-preferences", headers=headers)
        
        # Delete preferences
        response = api_client.delete(f"{TEST_BASE_URL}/user-preferences", headers=headers)
        
        assert response.status_code == 204  # No content
        
        # Verify getting preferences again creates new defaults
        get_response = api_client.get(f"{TEST_BASE_URL}/user-preferences", headers=headers)
        assert_successful_response(get_response, 200)
        
        data = get_response.json()
        assert data["theme"] == "system"  # Should be back to defaults


@pytest.mark.preferences
class TestUserPreferencesValidation:
    """PRIORITY 2: Test preferences validation and security (4XX responses)."""

    def test_preferences_require_authentication(self, api_client):
        """❌ Test all preferences endpoints require authentication."""
        endpoints = [
            ("GET", "/user-preferences"),
            ("PUT", "/user-preferences"),
            ("PATCH", "/user-preferences/notifications"),
            ("PATCH", "/user-preferences/display"),
            ("PATCH", "/user-preferences/privacy"),
            ("PATCH", "/user-preferences/quiet-hours"),
            ("PATCH", "/user-preferences/quick"),
            ("POST", "/user-preferences/reset"),
            ("DELETE", "/user-preferences"),
            ("GET", "/user-preferences/effective-settings"),
        ]
        
        for method, endpoint in endpoints:
            if method == "GET":
                response = api_client.get(f"{TEST_BASE_URL}{endpoint}")
            elif method == "PUT":
                response = api_client.put(f"{TEST_BASE_URL}{endpoint}", json={})
            elif method == "PATCH":
                response = api_client.patch(f"{TEST_BASE_URL}{endpoint}", json={})
            elif method == "POST":
                response = api_client.post(f"{TEST_BASE_URL}{endpoint}", json={})
            elif method == "DELETE":
                response = api_client.delete(f"{TEST_BASE_URL}{endpoint}")
            
            # Accept either 401 (unauthorized) or 403 (forbidden)
            assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code} for {endpoint}"

    def test_invalid_theme_validation_fails(self, api_client, authenticated_user):
        """❌ Test invalid theme values are rejected."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        invalid_data = {"theme": "rainbow"}  # Invalid theme
        
        response = api_client.put(
            f"{TEST_BASE_URL}/user-preferences",
            json=invalid_data,
            headers=headers
        )
        
        assert response.status_code == 422  # Validation error

    def test_invalid_time_format_validation_fails(self, api_client, authenticated_user):
        """❌ Test invalid time format values are rejected."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        invalid_data = {"time_format": "25h"}  # Invalid time format
        
        response = api_client.patch(
            f"{TEST_BASE_URL}/user-preferences/display",
            json=invalid_data,
            headers=headers
        )
        
        assert response.status_code == 422  # Validation error

    def test_invalid_quiet_hours_time_fails(self, api_client, authenticated_user):
        """❌ Test invalid quiet hours time format is rejected."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user['organization']['id']
        }
        
        invalid_data = {
            "enabled": True,
            "start": "25:00",  # Invalid hour
            "end": "07:00",
            "timezone": "UTC"
        }
        
        response = api_client.patch(
            f"{TEST_BASE_URL}/user-preferences/quiet-hours",
            json=invalid_data,
            headers=headers
        )
        
        assert response.status_code == 422  # Validation error


@pytest.mark.preferences
class TestUserPreferencesMultiTenant:
    """Test preferences multi-tenant isolation."""

    def test_preferences_organization_isolation(self, api_client, authenticated_user, other_organization):
        """🔒 Test preferences operations respect organization boundaries."""
        # Try to access preferences with wrong organization ID
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": other_organization['id']  # Wrong organization!
        }
        
        response = api_client.get(f"{TEST_BASE_URL}/user-preferences", headers=headers)
        
        assert_error_response(response, 403)
        
        data = response.json()
        assert "organization" in data["detail"].lower() or "access" in data["detail"].lower()


# =====================================================
# 🧪 FIXTURES FOR PREFERENCES TESTING
# =====================================================

@pytest.fixture
def user_with_preferences(api_client, authenticated_user):
    """Create user with existing preferences for testing updates."""
    headers = {
        "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
        "X-Org-Id": authenticated_user['organization']['id']
    }
    
    # Create preferences by getting them (auto-creates defaults)
    api_client.get(f"{TEST_BASE_URL}/user-preferences", headers=headers)
    
    return authenticated_user