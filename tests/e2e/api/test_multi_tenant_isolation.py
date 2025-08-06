"""
🏢 Multi-Tenant Data Isolation E2E Tests - CRITICAL SECURITY TESTS

GOLDEN RULE: FUNCTIONALITY FIRST
1. PRIORITY 1: Test successful multi-tenant operations (2XX)
2. PRIORITY 2: Test cross-organization security (403/404)
3. OBJECTIVE: Verify ZERO cross-organization data access

These tests are CRITICAL for multi-tenant security.
"""
import uuid
import pytest

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid
)


class TestMultiTenantDataIsolation:
    """CRITICAL: Test complete data isolation between organizations."""

    # ✅ PRIORITY 1: SUCCESS SCENARIOS - Multi-tenant operations work correctly
    
    def test_organization_data_completely_isolated_success(
        self, api_client, authenticated_user, second_organization_user
    ):
        """✅ Test organizations see only their own data."""
        org1_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        org2_headers = {
            'Authorization': f"Bearer {second_organization_user['tokens']['access_token']}",
            'X-Org-Id': second_organization_user['organization']['id']
        }
        
        # Test all major endpoints for data isolation
        endpoints_to_test = [
            '/organizations/current',
            '/organizations/members',
            '/billing/current-plan',
            '/billing/features',
            '/organizations/invites',
        ]
        
        for endpoint in endpoints_to_test:
            # Org1 should see their data
            response1 = api_client.get(f"{TEST_BASE_URL}{endpoint}", headers=org1_headers)
            if response1.status_code == 200:
                data1 = response1.json()
                
                # Org2 should see their own different data
                response2 = api_client.get(f"{TEST_BASE_URL}{endpoint}", headers=org2_headers)
                if response2.status_code == 200:
                    data2 = response2.json()
                    
                    # Data should be different (isolated)
                    if isinstance(data1, dict) and isinstance(data2, dict):
                        # For single objects, check organization_id
                        if 'organization_id' in data1 and 'organization_id' in data2:
                            assert data1['organization_id'] != data2['organization_id']
                        elif 'id' in data1 and 'id' in data2:
                            assert data1['id'] != data2['id']
                    elif isinstance(data1, list) and isinstance(data2, list):
                        # For lists, check they don't contain same items
                        if data1 and data2:
                            ids1 = {item.get('id', item.get('organization_id')) for item in data1 if isinstance(item, dict)}
                            ids2 = {item.get('id', item.get('organization_id')) for item in data2 if isinstance(item, dict)}
                            # Should have no overlap
                            assert not ids1.intersection(ids2), f"Data overlap found in {endpoint}"
    
    def test_user_can_access_own_organization_data_success(
        self, api_client, authenticated_user
    ):
        """✅ Test user can successfully access their own organization's data."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Test accessing organization data
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current", headers=headers)
        assert_successful_response(response, 200)
        
        data = response.json()
        assert data['id'] == authenticated_user['organization']['id']
        
        # Test accessing organization members
        response = api_client.get(f"{TEST_BASE_URL}/organizations/members", headers=headers)
        assert_successful_response(response, 200)
        
        members = response.json()
        assert isinstance(members, list)
        # User should see at least themselves as a member
        user_ids = [member['user_id'] for member in members]
        assert authenticated_user['user']['id'] in user_ids

    def test_cross_organization_member_invitation_isolation(
        self, api_client, authenticated_user, second_organization_user
    ):
        """✅ Test organization invitations don't leak between organizations."""
        org1_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        org2_headers = {
            'Authorization': f"Bearer {second_organization_user['tokens']['access_token']}",
            'X-Org-Id': second_organization_user['organization']['id']
        }
        
        # Create invitation in Org1
        invite_data = {
            "email": "test-invite@example.com",
            "role": "member",
            "message": "Join our team!"
        }
        
        create_response = api_client.post(
            f"{TEST_BASE_URL}/organizations/invites", 
            json=invite_data, 
            headers=org1_headers
        )
        
        if create_response.status_code == 201:
            # Org1 should see their invitation
            org1_invites = api_client.get(f"{TEST_BASE_URL}/organizations/invites", headers=org1_headers)
            assert_successful_response(org1_invites, 200)
            
            org1_invite_list = org1_invites.json()
            assert len(org1_invite_list) >= 1
            
            # Org2 should NOT see Org1's invitations
            org2_invites = api_client.get(f"{TEST_BASE_URL}/organizations/invites", headers=org2_headers)
            if org2_invites.status_code == 200:
                org2_invite_list = org2_invites.json()
                
                # Check no invitation overlap
                org1_invite_emails = {inv['email'] for inv in org1_invite_list}
                org2_invite_emails = {inv['email'] for inv in org2_invite_list}
                
                assert not org1_invite_emails.intersection(org2_invite_emails)

    # ❌ PRIORITY 2: SECURITY SCENARIOS - Cross-organization attacks

    def test_cross_organization_access_forbidden(
        self, api_client, authenticated_user, second_organization_user
    ):
        """❌ CRITICAL: Test user cannot access other organization's data."""
        # Try to access Org2's data with Org1's token but Org2's header
        malicious_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",  # Org1 token
            'X-Org-Id': second_organization_user['organization']['id']  # Org2 ID - ATTACK!
        }
        
        # All these should return 403 (organization mismatch)
        attack_endpoints = [
            '/organizations/current',
            '/organizations/members', 
            '/billing/current-plan',
            '/billing/features',
            '/organizations/invites',
        ]
        
        for endpoint in attack_endpoints:
            response = api_client.get(f"{TEST_BASE_URL}{endpoint}", headers=malicious_headers)
            assert_error_response(response, 403, "organization mismatch")

    def test_wrong_organization_header_attack(
        self, api_client, authenticated_user
    ):
        """❌ CRITICAL: Test completely fake organization ID is rejected."""
        fake_org_id = str(uuid.uuid4())  # Completely fake org ID
        
        attack_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': fake_org_id  # Fake org ID
        }
        
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current", headers=attack_headers)
        assert_error_response(response, 403, "organization mismatch")

    def test_malformed_organization_id_rejected(
        self, api_client, authenticated_user
    ):
        """❌ Test malformed organization ID is rejected."""
        malformed_ids = [
            "not-a-uuid",
            "123456",
            "",
            "null",
            "undefined"
        ]
        
        for malformed_id in malformed_ids:
            attack_headers = {
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': malformed_id
            }
            
            response = api_client.get(f"{TEST_BASE_URL}/organizations/current", headers=attack_headers)
            # Should return 400 for invalid UUID format
            assert_error_response(response, 400)

    def test_missing_organization_header_on_protected_endpoint(
        self, api_client, authenticated_user
    ):
        """❌ Test missing X-Org-Id header on protected endpoint."""
        # Clear all headers and set only Authorization (no X-Org-Id)
        api_client.headers.clear()
        headers_without_org = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            # Missing X-Org-Id header
        }
        
        response = api_client.get(f"{TEST_BASE_URL}/organizations/current", headers=headers_without_org)
        assert_error_response(response, 400, "Missing X-Org-Id header")

    def test_organization_switching_attack_prevention(
        self, api_client, authenticated_user, second_organization_user
    ):
        """❌ CRITICAL: Test organization switching attack is prevented."""
        # Simulate attacker trying to switch organizations mid-session
        
        # Step 1: Normal access to own organization
        own_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        response1 = api_client.get(f"{TEST_BASE_URL}/organizations/current", headers=own_headers)
        assert_successful_response(response1, 200)
        
        # Step 2: Try to switch to different organization (ATTACK)
        attack_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",  # Same token
            'X-Org-Id': second_organization_user['organization']['id']  # Different org
        }
        
        response2 = api_client.get(f"{TEST_BASE_URL}/organizations/current", headers=attack_headers)
        assert_error_response(response2, 403, "organization mismatch")
        
        # Step 3: Verify original access still works
        response3 = api_client.get(f"{TEST_BASE_URL}/organizations/current", headers=own_headers)
        assert_successful_response(response3, 200)


class TestMultiTenantRouteClassification:
    """Test that routes are properly classified for multi-tenancy."""
    
    def test_public_routes_no_auth_required(self, api_client):
        """✅ Test public routes work without authentication."""
        public_routes_to_test = [
            '/',
            '/health',
            '/billing/available-plans',
        ]
        
        for route in public_routes_to_test:
            # No headers at all - should work for public routes
            response = api_client.get(f"{TEST_BASE_URL}{route}")
            # Public routes should return 200 (success)
            assert_successful_response(response, 200)
            
            # Should NOT return auth errors
            assert response.status_code != 401
            assert response.status_code != 403

    def test_auth_only_routes_no_org_required(self, api_client, authenticated_user):
        """✅ Test auth-only routes work without X-Org-Id header."""
        auth_only_routes = [
            '/users/me',
            '/users/me/organizations',
            '/auth/me',
        ]
        
        headers_without_org = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            # No X-Org-Id header
        }
        
        for route in auth_only_routes:
            response = api_client.get(f"{TEST_BASE_URL}{route}", headers=headers_without_org)
            # Should work (not return 400 for missing org header)
            assert response.status_code != 400
            # Should return 200 or other success codes, not auth errors
            if response.status_code not in [200, 201, 204]:
                # If not success, should not be auth-related error
                assert response.status_code not in [401, 403]

    def test_protected_routes_require_org_header(self, api_client, authenticated_user):
        """❌ Test protected routes require X-Org-Id header."""
        protected_routes = [
            '/organizations/current',
            '/organizations/members',
            '/billing/current-plan',
            '/organizations/invites',
        ]
        
        # Clear all headers and set only Authorization (no X-Org-Id)
        api_client.headers.clear()
        headers_without_org = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            # Missing X-Org-Id header
        }
        
        for route in protected_routes:
            response = api_client.get(f"{TEST_BASE_URL}{route}", headers=headers_without_org)
            # Should return 400 for missing X-Org-Id header
            assert_error_response(response, 400, "Missing X-Org-Id header")

    def test_unknown_routes_return_403(self, api_client):
        """❌ Test unknown/non-existent routes return 403 (security-first: auth before routing)."""
        # These routes don't exist and should return 403 for missing auth
        unknown_routes = [
            '/new-feature/items',
            '/future-api/endpoint', 
            '/admin/secret-data',
            '/api/v2/something',
        ]
        
        for route in unknown_routes:
            # Non-existent routes return 403 (middleware enforces auth before routing check)
            # This is correct multi-tenant security behavior: authenticate first, then check routes
            response = api_client.get(f"{TEST_BASE_URL}{route}")
            assert response.status_code == 403, f"Non-existent route {route} should return 403 (auth required first)"

    def test_authenticated_unknown_routes_return_404(self, api_client, authenticated_user):
        """❌ Test authenticated users get 404 for truly non-existent routes."""
        # Proper auth headers
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # These routes don't exist and should return 404 after auth passes
        unknown_routes = [
            '/new-feature/items',
            '/future-api/endpoint', 
            '/admin/secret-data',
            '/api/v2/something',
        ]
        
        for route in unknown_routes:
            # With proper auth, non-existent routes should return 404 (FastAPI routing)
            response = api_client.get(f"{TEST_BASE_URL}{route}", headers=headers)
            assert response.status_code == 404, f"Authenticated request to non-existent route {route} should return 404"


class TestMultiTenantPerformance:
    """Test multi-tenant performance and scalability."""
    
    def test_organization_queries_are_indexed(
        self, api_client, authenticated_user
    ):
        """✅ Test organization-scoped queries perform well (use indexes)."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # These should be fast due to organization_id indexes
        performance_endpoints = [
            '/organizations/members',
            '/organizations/invites',
        ]
        
        import time
        for endpoint in performance_endpoints:
            start_time = time.time()
            response = api_client.get(f"{TEST_BASE_URL}{endpoint}", headers=headers)
            end_time = time.time()
            
            # Should respond quickly (under 1 second for indexed queries)
            duration = end_time - start_time
            assert duration < 1.0, f"Query {endpoint} took {duration:.2f}s (too slow - check indexes)"
            
            # Response should be successful
            if response.status_code == 200:
                assert_successful_response(response, 200)

    def test_concurrent_multi_tenant_access(
        self, api_client, authenticated_user, second_organization_user
    ):
        """✅ Test concurrent access from different organizations."""
        import threading
        import queue
        
        results = queue.Queue()
        
        def access_organization_data(user_data, org_name):
            try:
                headers = {
                    'Authorization': f"Bearer {user_data['tokens']['access_token']}",
                    'X-Org-Id': user_data['organization']['id']
                }
                
                response = api_client.get(f"{TEST_BASE_URL}/organizations/current", headers=headers)
                results.put((org_name, response.status_code, response.json() if response.status_code == 200 else None))
            except Exception as e:
                results.put((org_name, "error", str(e)))
        
        # Start concurrent threads
        thread1 = threading.Thread(target=access_organization_data, args=(authenticated_user, "org1"))
        thread2 = threading.Thread(target=access_organization_data, args=(second_organization_user, "org2"))
        
        thread1.start()
        thread2.start()
        
        thread1.join()
        thread2.join()
        
        # Collect results
        org1_result = results.get()
        org2_result = results.get()
        
        # Both should succeed
        assert org1_result[1] == 200, f"Org1 failed: {org1_result}"
        assert org2_result[1] == 200, f"Org2 failed: {org2_result}"
        
        # Should get different organization data
        if org1_result[2] and org2_result[2]:
            assert org1_result[2]['id'] != org2_result[2]['id'], "Organizations got same data (isolation failure)"


class TestMultiTenantBillingIsolation:
    """Test billing data isolation between organizations."""
    
    def test_billing_plans_isolated_per_organization(
        self, api_client, authenticated_user, second_organization_user
    ):
        """✅ Test billing plans are isolated per organization."""
        org1_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        org2_headers = {
            'Authorization': f"Bearer {second_organization_user['tokens']['access_token']}",
            'X-Org-Id': second_organization_user['organization']['id']
        }
        
        # Get current plans for both organizations
        org1_plan = api_client.get(f"{TEST_BASE_URL}/billing/current-plan", headers=org1_headers)
        org2_plan = api_client.get(f"{TEST_BASE_URL}/billing/current-plan", headers=org2_headers)
        
        if org1_plan.status_code == 200 and org2_plan.status_code == 200:
            plan1_data = org1_plan.json()
            plan2_data = org2_plan.json()
            
            # Plans should be for different organizations
            assert plan1_data['organization_id'] != plan2_data['organization_id']
            assert plan1_data['organization_id'] == authenticated_user['organization']['id']
            assert plan2_data['organization_id'] == second_organization_user['organization']['id']

    def test_billing_features_isolated_per_organization(
        self, api_client, authenticated_user, second_organization_user
    ):
        """✅ Test billing features are organization-specific."""
        org1_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        org2_headers = {
            'Authorization': f"Bearer {second_organization_user['tokens']['access_token']}",
            'X-Org-Id': second_organization_user['organization']['id']
        }
        
        # Get features for both organizations
        org1_features = api_client.get(f"{TEST_BASE_URL}/billing/features", headers=org1_headers)
        org2_features = api_client.get(f"{TEST_BASE_URL}/billing/features", headers=org2_headers)
        
        if org1_features.status_code == 200 and org2_features.status_code == 200:
            features1_data = org1_features.json()
            features2_data = org2_features.json()
            
            # Features should be for correct organizations
            assert features1_data['organization_id'] == authenticated_user['organization']['id']
            assert features2_data['organization_id'] == second_organization_user['organization']['id']
            assert features1_data['organization_id'] != features2_data['organization_id']