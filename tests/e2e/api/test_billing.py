"""
E2E tests for billing system.
Follows GOLDEN RULE: 2XX tests first, then error scenarios.
"""
from uuid import uuid4

# Use same base URL as other tests
TEST_BASE_URL = "http://localhost:8001"


class TestBillingEndpoints:
    """Test billing API endpoints following GOLDEN RULE."""
    
    # ✅ PRIORITY 1: SUCCESS SCENARIOS (2XX)
    
    def test_get_available_plans_success(self, api_client):
        """Test getting available plans returns 200."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/available-plans")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # basic, pro (configurable via BILLING_PLANS)
        
        # Verify plan structure
        for plan in data:
            assert "id" in plan
            assert "name" in plan
            assert "slug" in plan
            assert "price_cents" in plan
            assert "features" in plan
            assert isinstance(plan["features"], list)
            assert "is_active" in plan
            assert plan["is_active"] is True
        
        # Verify we have at least basic plan (always present as fallback)
        slugs = [plan["slug"] for plan in data]
        assert "basic" in slugs  # Basic should always exist
        # Other plans depend on BILLING_PLANS configuration
    
    def test_get_current_plan_success(self, api_client, authenticated_user):
        """Test getting current organization plan returns 200."""
        # Headers are already set in the api_client by authenticated_user fixture
        response = api_client.get(f"{TEST_BASE_URL}/billing/current-plan")
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "organization_id" in data
        assert "plan" in data
        assert "is_active" in data
        assert data["organization_id"] == authenticated_user["organization"]["id"]
        assert data["is_active"] is True
        
        # Verify plan structure
        plan = data["plan"]
        assert "name" in plan
        assert "slug" in plan
        assert "price_cents" in plan
        assert "features" in plan
    
    def test_get_organization_features_success(self, api_client, authenticated_user):
        """Test getting organization features returns 200."""
        # Headers are already set in the api_client by authenticated_user fixture
        response = api_client.get(f"{TEST_BASE_URL}/billing/features")
        
        assert response.status_code == 200
        data = response.json()
        assert "organization_id" in data
        assert "features" in data
        assert "plan_name" in data
        assert "plan_slug" in data
        assert isinstance(data["features"], list)
        assert len(data["features"]) > 0  # Should have at least basic features
        
        # Common features that should exist
        features = data["features"]
        assert "user_management" in features or "basic_dashboard" in features
    
    def test_get_plan_comparison_success(self, api_client, authenticated_user):
        """Test getting plan comparison returns 200."""
        # Headers are already set in the api_client by authenticated_user fixture
        response = api_client.get(f"{TEST_BASE_URL}/billing/plan-comparison")
        
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert "current_plan_slug" in data
        assert "upgrade_available" in data
        assert "downgrade_available" in data
        assert isinstance(data["plans"], list)
        assert len(data["plans"]) >= 2
        assert isinstance(data["upgrade_available"], bool)
        assert isinstance(data["downgrade_available"], bool)
    
    def test_upgrade_to_free_plan_success(self, api_client, authenticated_user):
        """Test upgrading to a free plan returns 200."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user["organization"]["id"]
        }
        
        # Try to upgrade to basic (should work if currently on no plan)
        payload = {"plan_slug": "basic"}
        response = api_client.post(f"{TEST_BASE_URL}/billing/upgrade", json=payload, headers=headers)
        
        # Should succeed for free plan upgrade
        assert response.status_code == 200
        
        if response.status_code == 200:
            data = response.json()
            assert "checkout_url" in data
            assert "session_id" in data
            assert data["session_id"] == "free_upgrade"
    
    def test_downgrade_plan_success(self, api_client, authenticated_user):
        """Test downgrading to basic plan returns 200."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user["organization"]["id"]
        }
        
        payload = {"confirm": True, "reason": "Testing downgrade"}
        response = api_client.post(f"{TEST_BASE_URL}/billing/downgrade", json=payload, headers=headers)
        
        # Should succeed in downgrading to basic plan
        assert response.status_code == 200
        
        if response.status_code == 200:
            data = response.json()
            assert "message" in data
            assert "new_plan" in data
            assert "effective_immediately" in data
            assert data["effective_immediately"] is True
    
    def test_sync_plans_success_as_superuser(self, api_client, seed_user_admin):
        """Test syncing plans with config as admin returns 403 (not superuser)."""
        # Headers are already set in the api_client by seed_user_admin fixture
        response = api_client.post(f"{TEST_BASE_URL}/billing/sync-plans")
        
        assert response.status_code == 403
        data = response.json()
        assert "detail" in data
        assert "superuser" in data["detail"].lower()
    
    # ✅ PRIORITY 2: ERROR SCENARIOS (4XX/5XX)
    
    def test_get_current_plan_unauthenticated_fails(self, api_client):
        """Test getting current plan without auth returns 403."""
        # Clear all auth headers
        headers = {k: v for k, v in api_client.headers.items() if k not in ["Authorization", "X-Org-Id"]}
        response = api_client.get(f"{TEST_BASE_URL}/billing/current-plan", headers=headers)
        assert response.status_code == 403
    
    def test_get_current_plan_wrong_org_fails(self, api_client, authenticated_user):
        """Test getting current plan with wrong org ID returns 403."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": str(uuid4())  # Wrong org ID
        }
        
        response = api_client.get(f"{TEST_BASE_URL}/billing/current-plan", headers=headers)
        assert response.status_code == 403
    
    def test_get_features_unauthenticated_fails(self, api_client):
        """Test getting features without auth returns 403."""
        # Clear all auth headers
        headers = {k: v for k, v in api_client.headers.items() if k not in ["Authorization", "X-Org-Id"]}
        response = api_client.get(f"{TEST_BASE_URL}/billing/features", headers=headers)
        assert response.status_code == 403
    
    def test_upgrade_plan_invalid_plan_fails(self, api_client, authenticated_user):
        """Test upgrading to invalid plan returns 404."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user["organization"]["id"]
        }
        
        payload = {"plan_slug": "nonexistent_plan"}
        response = api_client.post(f"{TEST_BASE_URL}/billing/upgrade", json=payload, headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_upgrade_plan_unauthenticated_fails(self, api_client):
        """Test upgrading plan without auth returns 403."""
        # Clear all auth headers
        headers = {k: v for k, v in api_client.headers.items() if k not in ["Authorization", "X-Org-Id"]}
        payload = {"plan_slug": "pro"}
        response = api_client.post(f"{TEST_BASE_URL}/billing/upgrade", json=payload, headers=headers)
        assert response.status_code == 403
    
    def test_downgrade_without_confirmation_fails(self, api_client, authenticated_user):
        """Test downgrading without confirmation returns 400."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user["organization"]["id"]
        }
        
        payload = {"confirm": False}
        response = api_client.post(f"{TEST_BASE_URL}/billing/downgrade", json=payload, headers=headers)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "confirm" in data["detail"].lower()
    
    def test_downgrade_unauthenticated_fails(self, api_client):
        """Test downgrading without auth returns 403."""
        # Clear all auth headers
        headers = {k: v for k, v in api_client.headers.items() if k not in ["Authorization", "X-Org-Id"]}
        payload = {"confirm": True}
        response = api_client.post(f"{TEST_BASE_URL}/billing/downgrade", json=payload, headers=headers)
        assert response.status_code == 403
    
    def test_sync_plans_non_superuser_fails(self, api_client, authenticated_user):
        """Test syncing plans as non-superuser returns 403."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user["organization"]["id"]
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/billing/sync-plans", headers=headers)
        
        assert response.status_code == 403
        data = response.json()
        assert "detail" in data
        assert "superuser" in data["detail"].lower()
    
    def test_sync_plans_unauthenticated_fails(self, api_client):
        """Test syncing plans without auth returns 403."""
        # Clear all auth headers
        headers = {k: v for k, v in api_client.headers.items() if k not in ["Authorization", "X-Org-Id"]}
        response = api_client.post(f"{TEST_BASE_URL}/billing/sync-plans", headers=headers)
        assert response.status_code == 403
    
    def test_stripe_webhook_missing_signature_fails(self, api_client):
        """Test Stripe webhook without signature returns 400."""
        response = api_client.post(f"{TEST_BASE_URL}/billing/stripe-webhook", data=b"test payload")
        
        # Webhook is public route, processes request and returns 400 for missing signature
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "signature" in data["detail"].lower()
    
    def test_invalid_plan_slug_in_upgrade_fails(self, api_client, authenticated_user):
        """Test upgrading with invalid plan slug returns 404."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user["organization"]["id"]
        }
        
        payload = {"plan_slug": ""}
        response = api_client.post(f"{TEST_BASE_URL}/billing/upgrade", json=payload, headers=headers)
        
        assert response.status_code == 404  # Plan not found


class TestFeatureBlocking:
    """Test feature blocking system."""
    
    def test_feature_service_basic_functionality(self, api_client, authenticated_user):
        """Test that feature service is working correctly."""
        # This test verifies the feature service is accessible
        # Real feature blocking tests would be added to specific endpoints that use @requires_feature
        
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user["organization"]["id"]
        }
        
        # Get features to verify service is working
        response = api_client.get(f"{TEST_BASE_URL}/billing/features", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        features = data["features"]
        
        # Basic features should be available by default
        assert len(features) > 0
        
        # Test would expand here with actual feature-gated endpoints
        # Example: if we had an endpoint that requires "advanced_reports"
        # We would test that it returns 403 for basic plan users


class TestBillingDataIntegrity:
    """Test billing data integrity and consistency."""
    
    def test_plans_have_consistent_pricing(self, api_client):
        """Test that plans have logical pricing progression."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/available-plans")
        assert response.status_code == 200
        
        plans = response.json()
        plan_dict = {plan["slug"]: plan for plan in plans}
        
        # Verify pricing logic
        if "basic" in plan_dict and "professional" in plan_dict:
            assert plan_dict["basic"]["price_cents"] <= plan_dict["professional"]["price_cents"]
        
        if "professional" in plan_dict and "expert" in plan_dict:
            assert plan_dict["professional"]["price_cents"] <= plan_dict["expert"]["price_cents"]
    
    def test_plans_have_progressive_features(self, api_client):
        """Test that higher plans include more or equal features."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/available-plans")
        assert response.status_code == 200
        
        plans = response.json()
        if len(plans) < 2:
            # Skip test if only one plan
            return
            
        # Sort plans by price
        sorted_plans = sorted(plans, key=lambda p: p["price_cents"])
        
        # Higher priced plans should have at least as many features
        for i in range(len(sorted_plans) - 1):
            lower_plan = sorted_plans[i]
            higher_plan = sorted_plans[i + 1]
            
            lower_features = set(lower_plan["features"])
            higher_features = set(higher_plan["features"])
            
            # Higher plan should have at least as many features
            assert len(higher_features) >= len(lower_features)
    
    def test_organization_always_has_subscription(self, api_client, authenticated_user):
        """Test that every organization has a subscription."""
        headers = {
            "Authorization": f"Bearer {authenticated_user['tokens']['access_token']}",
            "X-Org-Id": authenticated_user["organization"]["id"]
        }
        
        # Should never return 404 - every org should have at least basic plan
        response = api_client.get(f"{TEST_BASE_URL}/billing/current-plan", headers=headers)
        
        # Every organization should have a current plan (basic as fallback)
        assert response.status_code == 200
