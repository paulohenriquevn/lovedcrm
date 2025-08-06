"""
👤 Users E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - Real functionality
PRIORITY 2: Validation scenarios (4XX) - Security and validation
OBJECTIVE: Verify user management TRULY WORKS
"""
import pytest

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid,
    assert_valid_email,
    generate_invalid_emails
)


class TestUsersSuccess:
    """PRIORITY 1: Test successful user operations (2XX responses)."""

    def test_get_current_user_profile_success(self, api_client, authenticated_user):
        """✅ Test getting current user profile returns 200 with complete data."""
        response = api_client.get(f"{TEST_BASE_URL}/users/me")
        
        assert_successful_response(response, 200)
        
        # Verify user profile data
        data = response.json()
        assert_valid_uuid(data["id"])
        assert_valid_email(data["email"])
        assert data["email"] == authenticated_user["email"]
        assert data["full_name"] == authenticated_user["full_name"]
        assert data["is_active"] is True
        assert data["is_verified"] is True
        assert "created_at" in data
        assert "updated_at" in data
        
        # Security: sensitive fields should not be exposed
        assert "hashed_password" not in data
        assert "password" not in data

    def test_update_user_profile_success(self, api_client, authenticated_user):
        """✅ Test updating user profile returns 200 with updated data."""
        update_data = {
            "full_name": "Updated Full Name",
            "bio": "Updated bio description",
            "location": "Updated Location",
            "phone": "+1234567890",
            "timezone": "America/New_York",
            "language": "en"
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
        
        assert_successful_response(response, 200)
        
        # Verify updated data
        data = response.json()
        assert data["full_name"] == update_data["full_name"]
        assert data["bio"] == update_data["bio"]
        assert data["location"] == update_data["location"]
        assert data["phone"] == update_data["phone"]
        assert data["timezone"] == update_data["timezone"]
        assert data["language"] == update_data["language"]
        
        # Verify unchanged fields
        assert data["id"] == authenticated_user["id"]
        assert data["email"] == authenticated_user["email"]

    def test_update_user_partial_success(self, api_client, authenticated_user):
        """✅ Test partial user profile update returns 200."""
        update_data = {"full_name": "Partially Updated Name"}
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
        
        assert_successful_response(response, 200)
        
        # Verify only specified field was updated
        data = response.json()
        assert data["full_name"] == update_data["full_name"]
        assert data["email"] == authenticated_user["email"]  # Unchanged

    def test_change_password_success(self, api_client, authenticated_user):
        """✅ Test password change returns 200 and new password works."""
        password_data = {
            "current_password": authenticated_user["password"],
            "new_password": "NewSecurePassword123!"
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me/password", json=password_data)
        
        assert_successful_response(response, 204)
        
        # 204 No Content response has no body
        assert response.text == ""
        
        # Verify new password works by logging in
        api_client.headers.pop("Authorization", None)  # Remove old token
        login_data = {
            "email": authenticated_user["email"],
            "password": password_data["new_password"]
        }
        
        login_response = api_client.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
        assert_successful_response(login_response, 200)

    def test_get_user_organizations_empty_success(self, api_client, authenticated_user):
        """✅ Test getting user organizations returns 200 (may be empty)."""
        response = api_client.get(f"{TEST_BASE_URL}/users/me/organizations")
        
        assert_successful_response(response, 200)
        
        # Verify organizations list structure
        data = response.json()
        assert isinstance(data, list)
        # May be empty if no organizations auto-created

    def test_get_user_organizations_success(self, api_client, user_with_organization):
        """✅ Test getting user organizations returns 200 with organization list."""
        response = api_client.get(f"{TEST_BASE_URL}/users/me/organizations")
        
        assert_successful_response(response, 200)
        
        # Verify organizations list
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # At least the created organization
        
        # Verify organization structure
        org = data[0]
        assert_valid_uuid(org["id"])
        assert org["name"] == user_with_organization["organization"]["name"]
        assert org["slug"] == user_with_organization["organization"]["slug"]
        assert org["is_active"] is True
        assert "created_at" in org

    def test_update_user_settings_success(self, api_client, authenticated_user):
        """✅ Test updating user settings (timezone, language) returns 200."""
        settings_data = {
            "timezone": "Europe/London",
            "language": "pt"
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=settings_data)
        
        assert_successful_response(response, 200)
        
        # Verify settings updated
        data = response.json()
        assert data["timezone"] == settings_data["timezone"]
        assert data["language"] == settings_data["language"]


class TestUsersValidation:
    """PRIORITY 2: Test validation and error scenarios (4XX responses)."""

    def test_get_profile_unauthenticated_fails(self, api_client, clean_database):
        """Test getting profile without authentication returns 403."""
        # Clear any auth headers
        headers = {k: v for k, v in api_client.headers.items() if k != "Authorization"}
        response = api_client.get(f"{TEST_BASE_URL}/users/me", headers=headers)
        assert_error_response(response, 403)  # Not authenticated

    def test_update_profile_unauthenticated_fails(self, api_client, clean_database):
        """Test updating profile without authentication returns 403."""
        update_data = {"full_name": "Should Fail"}
        # Clear any auth headers
        headers = {k: v for k, v in api_client.headers.items() if k != "Authorization"}
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data, headers=headers)
        assert_error_response(response, 403)  # Not authenticated

    @pytest.mark.parametrize("invalid_email", generate_invalid_emails())
    def test_update_profile_invalid_email_fails(self, api_client, authenticated_user, invalid_email):
        """Test updating profile with invalid email returns 422."""
        update_data = {"email": invalid_email}
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
        assert_error_response(response, 422)

    def test_update_profile_too_long_fields_fails(self, api_client, authenticated_user):
        """Test updating profile with too long fields returns 422."""
        update_data = {
            "full_name": "x" * 500,  # Too long
            "bio": "x" * 2000,       # Too long
            "location": "x" * 500    # Too long
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
        assert_error_response(response, 422)

    def test_change_password_wrong_current_fails(self, api_client, authenticated_user):
        """Test password change with wrong current password returns 400."""
        password_data = {
            "current_password": "WrongCurrentPassword",
            "new_password": "NewSecurePassword123!"
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me/password", json=password_data)
        assert_error_response(response, 400, "current password")

    def test_change_password_weak_new_fails(self, api_client, authenticated_user):
        """Test password change with weak new password returns 422."""
        password_data = {
            "current_password": authenticated_user["password"],
            "new_password": "weak"
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me/password", json=password_data)
        assert_error_response(response, 422)

    def test_change_password_same_as_current_fails(self, api_client, authenticated_user):
        """Test password change with same password returns 400."""
        password_data = {
            "current_password": authenticated_user["password"],
            "new_password": authenticated_user["password"]
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me/password", json=password_data)
        assert_error_response(response, 400, "same")

    def test_change_password_missing_fields_fails(self, api_client, authenticated_user):
        """Test password change with missing fields returns 422."""
        # Missing current_password
        response = api_client.put(
            f"{TEST_BASE_URL}/users/me/password",
            json={"new_password": "NewSecurePassword123!"}
        )
        assert_error_response(response, 422)
        
        # Missing new_password
        response = api_client.put(
            f"{TEST_BASE_URL}/users/me/password",
            json={"current_password": authenticated_user["password"]}
        )
        assert_error_response(response, 422)

    def test_update_profile_invalid_timezone_fails(self, api_client, authenticated_user):
        """Test updating profile with invalid timezone returns 422."""
        update_data = {"timezone": "Invalid/Timezone"}
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
        assert_error_response(response, 422)

    def test_update_profile_invalid_language_fails(self, api_client, authenticated_user):
        """Test updating profile with invalid language code returns 422."""
        update_data = {"language": "invalid_lang_code"}
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
        assert_error_response(response, 422)

    def test_update_profile_invalid_phone_fails(self, api_client, authenticated_user):
        """Test updating profile with invalid phone number returns 422."""
        invalid_phones = [
            "not-a-phone",
            "123",
            "+" * 50,
            "123-456-7890-1234-5678"  # Too long
        ]
        
        for invalid_phone in invalid_phones:
            update_data = {"phone": invalid_phone}
            response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
            assert_error_response(response, 422)


class TestUsersEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_update_profile_empty_optional_fields(self, api_client, authenticated_user):
        """Test updating profile with empty optional fields (should clear them)."""
        update_data = {
            "bio": "",
            "location": "",
            "phone": ""
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
        assert_successful_response(response, 200)
        
        # Verify fields were cleared
        data = response.json()
        assert data["bio"] == "" or data["bio"] is None
        assert data["location"] == "" or data["location"] is None
        assert data["phone"] == "" or data["phone"] is None

    def test_update_profile_unicode_characters(self, api_client, authenticated_user):
        """Test updating profile with unicode characters."""
        update_data = {
            "full_name": "José María González 中文 🌟",
            "bio": "Bio with émojis 🚀 and àccénts",
            "location": "São Paulo, Brasil 🇧🇷"
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
        assert_successful_response(response, 200)
        
        # Verify unicode characters preserved
        data = response.json()
        assert data["full_name"] == update_data["full_name"]
        assert data["bio"] == update_data["bio"]
        assert data["location"] == update_data["location"]

    def test_update_profile_boundary_lengths(self, api_client, authenticated_user):
        """Test updating profile with boundary length values."""
        # Test maximum allowed lengths (adjust based on your actual limits)
        update_data = {
            "full_name": "A" * 255,  # Maximum typical length
            "bio": "B" * 1000,       # Maximum bio length
            "location": "C" * 255    # Maximum location length
        }
        
        # Set proper auth headers
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data, headers=headers)
        # API currently accepts very long field values - this reveals missing field length validation
        assert_successful_response(response, 200)
        
        # TODO: Add proper field length validation to user update endpoint
        # Current behavior allows unlimited length fields which could cause database issues
        data = response.json()
        assert len(data["full_name"]) == 255  # Verify the long data was actually stored
        assert len(data["bio"]) == 1000
        assert len(data["location"]) == 255

    def test_concurrent_profile_updates(self, api_client, authenticated_user):
        """Test concurrent profile updates."""
        import threading
        
        results = []
        
        def update_profile(name_suffix):
            try:
                update_data = {"full_name": f"Concurrent Update {name_suffix}"}
                response = api_client.put(f"{TEST_BASE_URL}/users/me", json=update_data)
                results.append((name_suffix, response.status_code))
            except Exception as e:
                results.append((name_suffix, f"error: {e}"))
        
        # Start concurrent update threads
        threads = []
        for i in range(3):
            thread = threading.Thread(target=update_profile, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads
        for thread in threads:
            thread.join()
        
        # At least one should succeed
        success_count = sum(1 for _, status in results if status == 200)
        assert success_count >= 1, f"At least one update should succeed. Results: {results}"
