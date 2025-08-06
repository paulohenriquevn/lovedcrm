"""Billing router - simple endpoints for plan management.

Follows existing patterns and multi-tenant architecture.
"""
import logging
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import get_current_organization, get_current_user
from ..models.billing import Plan
from ..models.organization import Organization
from ..models.user import User
from ..schemas.billing import (
    CheckoutSessionResponse,
    DowngradeRequest,
    FeaturesResponse,
    PlanComparisonResponse,
    PlanResponse,
    SubscriptionResponse,
    UpgradeRequest,
)
from ..services.feature_service import get_feature_service

router = APIRouter(prefix="/billing", tags=["billing"])
logger = logging.getLogger(__name__)


@router.get("/available-plans", response_model=List[PlanResponse])
async def get_available_plans(db: Session = Depends(get_db)):
    """Get all available plans."""
    try:
        feature_service = get_feature_service(db)
        plans = feature_service.get_all_plans()

        logger.info(f"Retrieved {len(plans)} available plans")
        return plans

    except Exception as e:
        logger.error(f"Error retrieving available plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve available plans",
        )


@router.get("/current-plan", response_model=SubscriptionResponse)
async def get_current_plan(
    organization: Organization = Depends(get_current_organization), db: Session = Depends(get_db)
):
    """Get organization's current subscription plan."""
    try:
        feature_service = get_feature_service(db)
        subscription = feature_service.get_organization_subscription(UUID(str(organization.id)))

        if not subscription:
            logger.info(
                f"No subscription found for organization {UUID(str(organization.id))}, using basic plan fallback"
            )
            # Rollback any failed transaction before continuing
            db.rollback()
            # Return basic plan as fallback (no subscription needed)
            basic_plan = db.query(Plan).filter(Plan.slug == "basic").first()
            if not basic_plan:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Basic plan not found in system",
                )

            # Create a temporary subscription-like response
            import uuid
            from datetime import datetime

            subscription_data = {
                "id": uuid.uuid4(),
                "organization_id": UUID(str(organization.id)),
                "plan": basic_plan,
                "stripe_subscription_id": None,
                "stripe_customer_id": None,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

            # Return as dict since SubscriptionResponse expects this structure
            return subscription_data

        logger.info(
            f"Retrieved current plan for organization {UUID(str(organization.id))}: {subscription.plan.name}"
        )
        return subscription

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error retrieving current plan for organization {UUID(str(organization.id))}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve current plan",
        )


@router.get("/features", response_model=FeaturesResponse)
async def get_organization_features(
    organization: Organization = Depends(get_current_organization), db: Session = Depends(get_db)
):
    """Get features available for current organization."""
    try:
        feature_service = get_feature_service(db)
        features = feature_service.get_organization_features(UUID(str(organization.id)))
        plan = feature_service.get_organization_plan(UUID(str(organization.id)))

        response = FeaturesResponse(
            organization_id=UUID(str(organization.id)),
            features=list(features),
            plan_name=str(plan.name) if plan else None,
            plan_slug=str(plan.slug) if plan else None,
        )

        logger.info(
            f"Retrieved {len(features)} features for organization {UUID(str(organization.id))}"
        )
        return response

    except Exception as e:
        logger.error(
            f"Error retrieving features for organization {UUID(str(organization.id))}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve organization features",
        )


@router.get("/plan-comparison", response_model=PlanComparisonResponse)
async def get_plan_comparison(
    organization: Organization = Depends(get_current_organization), db: Session = Depends(get_db)
):
    """Get plan comparison data for the organization."""
    try:
        feature_service = get_feature_service(db)
        all_plans = feature_service.get_all_plans()
        current_subscription = feature_service.get_organization_subscription(
            UUID(str(organization.id))
        )

        current_plan_slug = current_subscription.plan.slug if current_subscription else "basic"

        # Determine if upgrades/downgrades are available
        current_plan = next((p for p in all_plans if p.slug == current_plan_slug), None)
        current_price = current_plan.price_cents if current_plan else 0

        upgrade_available = any(p.price_cents > current_price for p in all_plans)
        downgrade_available = any(p.price_cents < current_price for p in all_plans)

        response = PlanComparisonResponse(
            plans=[PlanResponse.model_validate(plan) for plan in all_plans],
            current_plan_slug=current_plan_slug,
            upgrade_available=upgrade_available,
            downgrade_available=downgrade_available,
        )

        logger.info(f"Retrieved plan comparison for organization {UUID(str(organization.id))}")
        return response

    except Exception as e:
        logger.error(f"Error retrieving plan comparison: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve plan comparison",
        )


@router.post("/upgrade", response_model=CheckoutSessionResponse)
async def upgrade_plan(
    request: UpgradeRequest,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upgrade organization to a new plan."""
    try:
        feature_service = get_feature_service(db)

        # Validate plan exists
        all_plans = feature_service.get_all_plans()
        target_plan = next((p for p in all_plans if p.slug == request.plan_slug), None)

        if not target_plan:
            available_slugs = [p.slug for p in all_plans]
            logger.warning(f"Plan '{request.plan_slug}' not found. Available: {available_slugs}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plan '{request.plan_slug}' not found",
            )

        # Check if it's actually an upgrade
        current_subscription = feature_service.get_organization_subscription(
            UUID(str(organization.id))
        )
        current_price = 0  # Default to free (basic plan) if no subscription
        if current_subscription:
            current_price = current_subscription.plan.price_cents
            if current_price >= target_plan.price_cents:
                logger.warning(
                    f"Invalid upgrade attempt: {current_subscription.plan.slug} -> {request.plan_slug}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot upgrade to a plan with equal or lower price. Use downgrade endpoint instead.",
                )

        # For free plans (basic), upgrade immediately
        if target_plan.is_free:
            # Basic plan doesn't need subscription - it's the default fallback
            logger.info(
                f"Free upgrade to basic plan: org={UUID(str(organization.id))}, plan={request.plan_slug}"
            )

            return CheckoutSessionResponse(
                checkout_url=f"success?plan={request.plan_slug}", session_id="free_upgrade"
            )

        # For paid plans, create checkout session (mock for now)
        logger.info(
            f"Paid upgrade requested: org={UUID(str(organization.id))}, plan={request.plan_slug}"
        )

        # TODO: Implement actual Stripe checkout session creation
        return CheckoutSessionResponse(
            checkout_url=f"https://checkout.stripe.com/pay/{target_plan.id}",
            session_id=f"cs_mock_{target_plan.slug}",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error upgrading plan for organization {UUID(str(organization.id))}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process plan upgrade",
        )


@router.post("/downgrade")
async def downgrade_plan(
    request: DowngradeRequest,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Downgrade organization to basic (free) plan."""
    try:
        if not request.confirm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Downgrade must be confirmed by setting 'confirm' to true",
            )

        feature_service = get_feature_service(db)

        # Check current plan
        current_subscription = feature_service.get_organization_subscription(
            UUID(str(organization.id))
        )
        if not current_subscription:
            # No subscription means already on basic plan (free)
            return {
                "message": "Already on basic plan - no subscription to downgrade",
                "new_plan": "basic",
                "effective_immediately": True,
            }

        if current_subscription.plan.slug == "basic":
            return {
                "message": "Already on basic plan",
                "new_plan": "basic",
                "effective_immediately": True,
            }

        # Perform downgrade
        subscription = feature_service.downgrade_to_basic(UUID(str(organization.id)))

        logger.info(
            f"Downgrade completed: org={UUID(str(organization.id))} -> basic plan. Reason: {request.reason}"
        )

        return {
            "message": "Successfully downgraded to basic plan",
            "new_plan": subscription.plan.name,
            "effective_immediately": True,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downgrading plan for organization {UUID(str(organization.id))}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process plan downgrade",
        )


@router.post("/sync-plans")
async def sync_plans_with_config(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Sync database plans with configuration (admin only)."""
    try:
        # Only superusers can sync plans
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only superusers can sync plans with configuration",
            )

        feature_service = get_feature_service(db)
        feature_service.sync_plans_with_config()

        logger.info(f"Plans synced with configuration by user {current_user.id}")

        return {
            "message": "Plans successfully synced with configuration",
            "updated_by": current_user.email,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error syncing plans with config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync plans with configuration",
        )


# TODO: Implement Stripe webhook endpoint
@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events (placeholder)."""
    try:
        payload = await request.body()
        signature = request.headers.get("stripe-signature")

        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Missing stripe-signature header"
            )

        logger.info(f"Received Stripe webhook (payload size: {len(payload)} bytes)")

        # TODO: Implement actual Stripe webhook processing
        return {
            "status": "received",
            "processed": False,
            "note": "Webhook processing not yet implemented",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing Stripe webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process webhook"
        )
