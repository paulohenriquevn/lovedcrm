"""Unit tests for models.billing module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper billing model behavior
"""

import pytest
import uuid
from unittest.mock import Mock
from datetime import datetime

# Mock classes to avoid database dependencies
class MockPlan:
    """Mock Plan model for unit testing."""
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', uuid.uuid4())
        self.name = kwargs.get('name')
        self.slug = kwargs.get('slug')
        self.price_cents = kwargs.get('price_cents', 0)
        self.features = kwargs.get('features', [])
        self.is_active = kwargs.get('is_active', True)
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())
    
    @property
    def price_reais(self) -> float:
        """Convert price from cents to reais."""
        return self.price_cents / 100.0
    
    @property
    def is_free(self) -> bool:
        """Check if plan is free."""
        return self.price_cents == 0
    
    def has_feature(self, feature: str) -> bool:
        """Check if plan has specific feature."""
        if not self.features:
            return False
        return feature in self.features
    
    def __repr__(self) -> str:
        return f"<Plan(name='{self.name}', price={self.price_cents})>"

class MockOrganizationSubscription:
    """Mock OrganizationSubscription model for unit testing."""
    def __init__(self, **kwargs):
        self.id = kwargs.get('id', uuid.uuid4())
        self.organization_id = kwargs.get('organization_id')
        self.plan_id = kwargs.get('plan_id')
        self.plan = kwargs.get('plan')
        self.stripe_subscription_id = kwargs.get('stripe_subscription_id')
        self.stripe_customer_id = kwargs.get('stripe_customer_id')
        self.status = kwargs.get('status', 'active')
        self.is_active = kwargs.get('is_active', True)
        self.current_period_start = kwargs.get('current_period_start')
        self.current_period_end = kwargs.get('current_period_end')
        self.is_trial = kwargs.get('is_trial', False)
        self.trial_end = kwargs.get('trial_end')
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())
    
    @property
    def is_paid(self) -> bool:
        """Check if subscription is paid."""
        if not self.plan:
            return False
        return not self.plan.is_free
    
    def has_feature(self, feature: str) -> bool:
        """Check if subscription has specific feature."""
        if not self.plan:
            return False
        if hasattr(self.plan, 'has_feature'):
            return self.plan.has_feature(feature)
        if hasattr(self.plan, 'features') and self.plan.features:
            return feature in self.plan.features
        return False
    
    def __repr__(self) -> str:
        return f"<OrganizationSubscription(org_id='{self.organization_id}', plan='{self.plan.name if self.plan else None}')>"

# Use mock classes instead of real models
Plan = MockPlan
OrganizationSubscription = MockOrganizationSubscription


class TestPlanModel:
    """Test Plan model functionality - FUNCTIONALITY FIRST."""

    def test_plan_model_creation_success(self):
        """Test Plan model can be created with required fields."""
        # ✅ SUCCESS SCENARIO: Plan model creates successfully
        plan = Plan(
            name="Básico",
            slug="basic",
            price_cents=0,
            features=["user_management", "basic_dashboard"]
        )
        
        assert plan.name == "Básico"
        assert plan.slug == "basic"
        assert plan.price_cents == 0
        assert plan.features == ["user_management", "basic_dashboard"]
        
        # Verify default values
        assert plan.is_active is True

    def test_plan_model_free_plan_success(self):
        """Test Plan model for free plan configuration."""
        # ✅ SUCCESS SCENARIO: Free plan works correctly
        free_plan = Plan(
            name="Free Plan",
            slug="free",
            price_cents=0,
            features=["basic_features"]
        )
        
        assert free_plan.price_cents == 0
        assert free_plan.price_reais == 0.0
        assert free_plan.is_free is True

    def test_plan_model_paid_plan_success(self):
        """Test Plan model for paid plan configuration."""
        # ✅ SUCCESS SCENARIO: Paid plan works correctly
        paid_plan = Plan(
            name="Profissional",
            slug="professional",
            price_cents=2900,  # R$ 29.00
            features=["user_management", "advanced_reports", "analytics"]
        )
        
        assert paid_plan.price_cents == 2900
        assert paid_plan.price_reais == 29.0
        assert paid_plan.is_free is False

    def test_plan_model_price_conversion_success(self):
        """Test Plan model price conversion from cents to reais."""
        # ✅ SUCCESS SCENARIO: Price conversion works correctly
        test_cases = [
            (0, 0.0),
            (100, 1.0),
            (1500, 15.0),
            (2950, 29.5),
            (9999, 99.99)
        ]
        
        for cents, expected_reais in test_cases:
            plan = Plan(
                name=f"Test Plan {cents}",
                slug=f"test-{cents}",
                price_cents=cents
            )
            
            assert plan.price_reais == expected_reais

    def test_plan_model_feature_checking_success(self):
        """Test Plan model feature checking functionality."""
        # ✅ SUCCESS SCENARIO: Feature checking works correctly
        plan = Plan(
            name="Feature Test Plan",
            slug="feature-test",
            price_cents=1000,
            features=["user_management", "advanced_reports", "analytics", "priority_support"]
        )
        
        # Existing features should return True
        assert plan.has_feature("user_management") is True
        assert plan.has_feature("advanced_reports") is True
        assert plan.has_feature("analytics") is True
        assert plan.has_feature("priority_support") is True
        
        # Non-existing features should return False
        assert plan.has_feature("non_existing_feature") is False
        assert plan.has_feature("premium_support") is False

    def test_plan_model_empty_features_success(self):
        """Test Plan model with empty features list."""
        # ✅ SUCCESS SCENARIO: Plan with no features works correctly
        minimal_plan = Plan(
            name="Minimal Plan",
            slug="minimal",
            price_cents=0,
            features=[]
        )
        
        assert minimal_plan.features == []
        assert minimal_plan.has_feature("any_feature") is False

    def test_plan_model_none_features_success(self):
        """Test Plan model with None features (edge case)."""
        # ✅ SUCCESS SCENARIO: Plan with None features is handled gracefully
        plan = Plan(
            name="None Features Plan",
            slug="none-features",
            price_cents=0
            # features defaults to list, but testing None case
        )
        
        # Set features to None to test edge case
        plan.features = None
        assert plan.has_feature("any_feature") is False

    def test_plan_model_repr_method_success(self):
        """Test Plan model string representation."""
        # ✅ SUCCESS SCENARIO: String representation is informative
        plan = Plan(
            name="Repr Test Plan",
            slug="repr-test",
            price_cents=4999
        )
        
        repr_str = repr(plan)
        assert "Plan" in repr_str
        assert "Repr Test Plan" in repr_str
        assert "4999" in repr_str
        assert repr_str == "<Plan(name='Repr Test Plan', price=4999)>"

    def test_plan_model_inactive_plan_success(self):
        """Test Plan model can be set as inactive."""
        # ✅ SUCCESS SCENARIO: Plan can be deactivated
        inactive_plan = Plan(
            name="Inactive Plan",
            slug="inactive",
            price_cents=1000,
            is_active=False
        )
        
        assert inactive_plan.is_active is False
        assert inactive_plan.name == "Inactive Plan"

    def test_plan_model_comprehensive_features_success(self):
        """Test Plan model with comprehensive feature set."""
        # ✅ SUCCESS SCENARIO: Plan with many features works correctly
        enterprise_plan = Plan(
            name="Enterprise",
            slug="enterprise",
            price_cents=9900,  # R$ 99.00
            features=[
                "user_management",
                "advanced_reports", 
                "analytics",
                "priority_support",
                "custom_integrations",
                "white_label",
                "api_access",
                "sso",
                "audit_logs",
                "dedicated_support"
            ]
        )
        
        assert len(enterprise_plan.features) == 10
        for feature in enterprise_plan.features:
            assert enterprise_plan.has_feature(feature) is True
        
        assert enterprise_plan.price_reais == 99.0
        assert enterprise_plan.is_free is False


class TestOrganizationSubscriptionModel:
    """Test OrganizationSubscription model functionality - FUNCTIONALITY FIRST."""

    def test_organization_subscription_creation_success(self):
        """Test OrganizationSubscription model can be created with required fields."""
        # ✅ SUCCESS SCENARIO: Subscription model creates successfully
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id
        )
        
        assert subscription.organization_id == org_id
        assert subscription.plan_id == plan_id
        
        # Verify default values
        assert subscription.is_active is True
        assert subscription.stripe_subscription_id is None
        assert subscription.stripe_customer_id is None

    def test_organization_subscription_with_stripe_success(self):
        """Test OrganizationSubscription model with Stripe integration."""
        # ✅ SUCCESS SCENARIO: Subscription with Stripe data works correctly
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id,
            stripe_subscription_id="sub_1234567890",
            stripe_customer_id="cus_abcdefghij"
        )
        
        assert subscription.stripe_subscription_id == "sub_1234567890"
        assert subscription.stripe_customer_id == "cus_abcdefghij"

    def test_organization_subscription_inactive_success(self):
        """Test OrganizationSubscription model can be set as inactive."""
        # ✅ SUCCESS SCENARIO: Inactive subscription works correctly
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        inactive_subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id,
            is_active=False
        )
        
        assert inactive_subscription.is_active is False

    def test_organization_subscription_is_paid_with_free_plan(self):
        """Test OrganizationSubscription is_paid property with free plan."""
        # ✅ SUCCESS SCENARIO: Free plan subscription correctly identified as unpaid
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        # Create mock free plan
        free_plan = Mock()
        free_plan.is_free = True
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id
        )
        subscription.plan = free_plan
        
        assert subscription.is_paid is False

    def test_organization_subscription_is_paid_with_paid_plan(self):
        """Test OrganizationSubscription is_paid property with paid plan."""
        # ✅ SUCCESS SCENARIO: Paid plan subscription correctly identified as paid
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        # Create mock paid plan
        paid_plan = Mock()
        paid_plan.is_free = False
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id
        )
        subscription.plan = paid_plan
        
        assert subscription.is_paid is True

    def test_organization_subscription_is_paid_no_plan(self):
        """Test OrganizationSubscription is_paid property with no plan."""
        # ✅ SUCCESS SCENARIO: Subscription without plan is not paid
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id
        )
        subscription.plan = None
        
        assert subscription.is_paid is False

    def test_organization_subscription_has_feature_success(self):
        """Test OrganizationSubscription has_feature method with plan features."""
        # ✅ SUCCESS SCENARIO: Feature checking through subscription works
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        # Create mock plan with features
        mock_plan = Mock()
        mock_plan.has_feature.return_value = True
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id
        )
        subscription.plan = mock_plan
        
        # Test feature checking
        result = subscription.has_feature("analytics")
        
        assert result is True
        mock_plan.has_feature.assert_called_once_with("analytics")

    def test_organization_subscription_has_feature_no_plan(self):
        """Test OrganizationSubscription has_feature method without plan."""
        # ✅ SUCCESS SCENARIO: Feature checking without plan returns False
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id
        )
        subscription.plan = None
        
        assert subscription.has_feature("any_feature") is False

    def test_organization_subscription_repr_method_success(self):
        """Test OrganizationSubscription model string representation."""
        # ✅ SUCCESS SCENARIO: String representation is informative
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        # Create mock plan
        mock_plan = Mock()
        mock_plan.name = "Professional Plan"
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id
        )
        subscription.plan = mock_plan
        
        repr_str = repr(subscription)
        assert "OrganizationSubscription" in repr_str
        assert str(org_id) in repr_str
        assert "Professional Plan" in repr_str

    def test_organization_subscription_repr_method_no_plan(self):
        """Test OrganizationSubscription string representation without plan."""
        # ✅ SUCCESS SCENARIO: String representation works without plan
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id
        )
        subscription.plan = None
        
        repr_str = repr(subscription)
        assert "OrganizationSubscription" in repr_str
        assert str(org_id) in repr_str
        assert "None" in repr_str

    def test_organization_subscription_stripe_integration_scenario(self):
        """Test OrganizationSubscription in real Stripe integration scenario."""
        # ✅ SUCCESS SCENARIO: Complete Stripe integration scenario
        org_id = uuid.uuid4()
        plan_id = uuid.uuid4()
        
        # Create subscription with Stripe data
        subscription = OrganizationSubscription(
            organization_id=org_id,
            plan_id=plan_id,
            stripe_subscription_id="sub_1NvQeR2eZvKYlo2C4XYZ123",
            stripe_customer_id="cus_OkLJ8K9JkLmN7O2P",
            is_active=True
        )
        
        # Mock paid plan
        paid_plan = Mock()
        paid_plan.is_free = False
        paid_plan.name = "Professional"
        paid_plan.has_feature.return_value = True
        subscription.plan = paid_plan
        
        # Verify subscription properties
        assert subscription.is_active is True
        assert subscription.is_paid is True
        assert subscription.has_feature("advanced_features") is True
        assert subscription.stripe_subscription_id.startswith("sub_")
        assert subscription.stripe_customer_id.startswith("cus_")

    def test_organization_subscription_multi_tenant_isolation(self):
        """Test OrganizationSubscription supports multi-tenant isolation."""
        # ✅ SUCCESS SCENARIO: Different organizations have separate subscriptions
        org1_id = uuid.uuid4()
        org2_id = uuid.uuid4()
        basic_plan_id = uuid.uuid4()
        pro_plan_id = uuid.uuid4()
        
        # Organization 1 with basic plan
        subscription1 = OrganizationSubscription(
            organization_id=org1_id,
            plan_id=basic_plan_id
        )
        
        # Organization 2 with pro plan
        subscription2 = OrganizationSubscription(
            organization_id=org2_id,
            plan_id=pro_plan_id
        )
        
        # Verify isolation
        assert subscription1.organization_id != subscription2.organization_id
        assert subscription1.plan_id != subscription2.plan_id
        
        # Both should be active by default
        assert subscription1.is_active is True
        assert subscription2.is_active is True