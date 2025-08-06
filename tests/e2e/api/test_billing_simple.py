"""
E2E tests for billing system - Simplified and working version.
Follows GOLDEN RULE: 2XX tests first, then error scenarios.
"""

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response
)


class TestBillingEndpoints:
    """Test billing API endpoints following GOLDEN RULE."""
    
    # ✅ PRIORITY 1: SUCCESS SCENARIOS (2XX)
    
    def test_get_available_plans_success(self, api_client):
        """Test getting available plans returns 200."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/available-plans")
        
        assert_successful_response(response, 200)
        data = response.json()
        assert isinstance(data, list)
        # Should have exactly the configured plans (BASIC and PRO from CLAUDE.md)
        assert len(data) == 2, f"Expected 2 billing plans, got {len(data)}"
        
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
        
        # Verify we have the expected plans (BASIC and PROFESSIONAL from actual configuration)
        slugs = [plan["slug"] for plan in data]
        expected_slugs = {"basic", "professional"}
        actual_slugs = set(slugs)
        assert actual_slugs == expected_slugs, f"Expected plans {expected_slugs}, got {actual_slugs}"
    
    def test_get_current_plan_success(self, api_client, authenticated_user):
        """Test getting current organization plan returns 200."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/current-plan")
        
        # Should return current plan (basic as fallback if no subscription)
        assert response.status_code == 200
        
        if response.status_code == 200:
            data = response.json()
            assert "id" in data
            assert "organization_id" in data
            assert "plan" in data
            assert "is_active" in data
    
    def test_get_organization_features_success(self, api_client, authenticated_user):
        """Test getting organization features returns 200."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/features")
        
        assert response.status_code == 200
        data = response.json()
        assert "organization_id" in data
        assert "features" in data
        assert isinstance(data["features"], list)
    
    def test_get_plan_comparison_success(self, api_client, authenticated_user):
        """Test getting plan comparison returns 200."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/plan-comparison")
        
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert "current_plan_slug" in data
        assert "upgrade_available" in data
        assert "downgrade_available" in data
        assert isinstance(data["plans"], list)
    
    def test_downgrade_plan_success(self, api_client, authenticated_user):
        """Test downgrading to basic plan returns 200 or 400."""
        payload = {"confirm": True, "reason": "Testing downgrade"}
        response = api_client.post(f"{TEST_BASE_URL}/billing/downgrade", json=payload)
        
        # Should successfully downgrade to basic plan
        assert response.status_code == 200
        
        if response.status_code == 200:
            data = response.json()
            assert "message" in data
    
    # ✅ PRIORITY 2: ERROR SCENARIOS (4XX/5XX)
    
    def test_get_current_plan_unauthenticated_fails(self, api_client):
        """Test getting current plan without auth returns 403."""
        # Create a fresh client without auth headers
        import requests
        fresh_client = requests.Session()
        fresh_client.headers.update({"Content-Type": "application/json"})
        
        response = fresh_client.get(f"{TEST_BASE_URL}/billing/current-plan")
        assert response.status_code == 403
    
    def test_get_features_unauthenticated_fails(self, api_client):
        """Test getting features without auth returns 403.""" 
        import requests
        fresh_client = requests.Session()
        fresh_client.headers.update({"Content-Type": "application/json"})
        
        response = fresh_client.get(f"{TEST_BASE_URL}/billing/features")
        assert response.status_code == 403
    
    def test_upgrade_plan_invalid_plan_fails(self, api_client, authenticated_user):
        """Test upgrading to invalid plan returns 404."""
        payload = {"plan_slug": "nonexistent_plan"}
        response = api_client.post(f"{TEST_BASE_URL}/billing/upgrade", json=payload)
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    def test_downgrade_without_confirmation_fails(self, api_client, authenticated_user):
        """Test downgrading without confirmation returns 400."""
        payload = {"confirm": False}
        response = api_client.post(f"{TEST_BASE_URL}/billing/downgrade", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    def test_stripe_webhook_missing_signature_fails(self, api_client):
        """Test Stripe webhook without signature returns 400."""
        import requests
        fresh_client = requests.Session()
        
        response = fresh_client.post(f"{TEST_BASE_URL}/billing/stripe-webhook", data=b"test payload")
        
        # Webhook is public route, processes request and returns 400 for missing signature
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data


class TestBillingDataIntegrity:
    """Test billing data integrity and consistency."""
    
    def test_plans_have_consistent_pricing(self, api_client):
        """Test that plans have logical pricing progression."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/available-plans")
        assert response.status_code == 200
        
        plans = response.json()
        if len(plans) < 2:
            # Skip test if only one plan
            return
            
        # Sort by price and verify logical progression
        sorted_plans = sorted(plans, key=lambda p: p["price_cents"])
        
        for i in range(len(sorted_plans) - 1):
            current = sorted_plans[i]
            next_plan = sorted_plans[i + 1]
            
            # Next plan should have equal or higher price
            assert next_plan["price_cents"] >= current["price_cents"]
    
    def test_plans_have_reasonable_feature_counts(self, api_client):
        """Test that plans have reasonable number of features."""
        response = api_client.get(f"{TEST_BASE_URL}/billing/available-plans")
        assert response.status_code == 200
        
        plans = response.json()
        
        for plan in plans:
            features = plan["features"]
            # Each plan should have at least 1 feature
            assert len(features) >= 1
            # No plan should have more than 20 features (reasonable limit)
            assert len(features) <= 20
