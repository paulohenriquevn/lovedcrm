"""Billing models for plan and subscription management.

Simple models following KISS principle.
"""
import uuid

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class Plan(Base):
    """Plan model - represents available subscription plans.

    Simple structure with configurable features.
    """

    __tablename__ = "plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)  # "Básico", "Profissional", "Expert"
    slug = Column(String(50), unique=True, nullable=False)  # "basic", "professional", "expert"
    price_cents = Column(Integer, nullable=False, default=0)  # Preço em centavos
    features = Column(JSON, nullable=False, default=list)  # Lista de features
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    subscriptions = relationship("OrganizationSubscription", back_populates="plan")

    def __repr__(self) -> str:
        """String representation of Plan."""
        return f"<Plan(name='{self.name}', price={self.price_cents})>"

    @property
    def price_reais(self) -> float:
        """Convert price from cents to reais."""
        return self.price_cents / 100.0

    @property
    def is_free(self) -> bool:
        """Check if plan is free."""
        return self.price_cents == 0

    def has_feature(self, feature_name: str) -> bool:
        """Check if plan has a specific feature."""
        return feature_name in (self.features or [])


class OrganizationSubscription(Base):
    """Organization subscription model.

    Links organizations to their current plan.
    """

    __tablename__ = "organization_subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)

    # Stripe integration (optional)
    stripe_subscription_id = Column(String(255), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization")
    plan = relationship("Plan", back_populates="subscriptions")

    def __repr__(self) -> str:
        """String representation of OrganizationSubscription."""
        return f"<OrganizationSubscription(org_id='{self.organization_id}', plan='{self.plan.name if self.plan else None}')>"

    @property
    def is_paid(self) -> bool:
        """Check if subscription is paid."""
        return self.plan and not self.plan.is_free

    def has_feature(self, feature_name: str) -> bool:
        """Check if subscription plan has a specific feature."""
        return self.plan and self.plan.has_feature(feature_name)
