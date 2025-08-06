"""Billing schemas for API requests and responses."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PlanResponse(BaseModel):
    """Plan information response."""

    id: UUID
    name: str
    slug: str
    price_cents: int
    features: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # Computed properties
    @property
    def price_reais(self) -> float:
        """Price in reais (R$)."""
        return self.price_cents / 100.0

    @property
    def is_free(self) -> bool:
        """Check if plan is free."""
        return self.price_cents == 0

    class Config:
        """Pydantic configuration for PlanResponse."""

        from_attributes = True


class SubscriptionResponse(BaseModel):
    """Organization subscription response."""

    id: UUID
    organization_id: UUID
    plan: PlanResponse
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration for SubscriptionResponse."""

        from_attributes = True


class SubscriptionCreateRequest(BaseModel):
    """Request to create a new subscription."""

    plan_slug: str = Field(..., description="Plan slug (basic, professional, expert)")


class UpgradeRequest(BaseModel):
    """Request to upgrade to a new plan."""

    plan_slug: str = Field(..., description="Plan slug (basic, professional, expert)")
    success_url: Optional[str] = Field(None, description="URL to redirect after successful payment")
    cancel_url: Optional[str] = Field(None, description="URL to redirect after cancelled payment")


class DowngradeRequest(BaseModel):
    """Request to downgrade plan."""

    confirm: bool = Field(..., description="Confirmation that user wants to downgrade")
    reason: Optional[str] = Field(None, description="Reason for downgrading (optional)")


class CheckoutSessionResponse(BaseModel):
    """Stripe checkout session response."""

    checkout_url: str
    session_id: str


class FeaturesResponse(BaseModel):
    """Organization features response."""

    organization_id: UUID
    features: List[str]
    plan_name: Optional[str] = None
    plan_slug: Optional[str] = None


class PlanComparisonResponse(BaseModel):
    """Plan comparison data for frontend."""

    plans: List[PlanResponse]
    current_plan_slug: Optional[str] = None
    upgrade_available: bool = False
    downgrade_available: bool = False


class BillingStatsResponse(BaseModel):
    """Billing statistics response."""

    total_plans: int
    total_subscriptions: int
    free_subscriptions: int
    paid_subscriptions: int
    revenue_cents: int

    @property
    def revenue_reais(self) -> float:
        """Revenue in reais."""
        return self.revenue_cents / 100.0


class WebhookEventRequest(BaseModel):
    """Stripe webhook event request."""

    type: str
    data: dict


# Error schemas
class FeatureBlockedError(BaseModel):
    """Error response when feature is blocked."""

    detail: str
    feature_name: str
    current_plan: Optional[str] = None
    required_plans: List[str] = []
    upgrade_url: Optional[str] = None


class PlanNotFoundError(BaseModel):
    """Error response when plan is not found."""

    detail: str
    available_plans: List[str] = []


# Validation schemas
class PlanSlugValidator(BaseModel):
    """Validator for plan slugs."""

    plan_slug: str = Field(..., pattern="^(basic|professional|expert)$")


class FeatureNameValidator(BaseModel):
    """Validator for feature names."""

    feature_name: str = Field(..., min_length=1, max_length=100)
