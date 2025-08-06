"""Basic Stripe service for payment processing.

Simple implementation following KISS principle.
"""
import logging
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.billing import OrganizationSubscription, Plan
from ..models.organization import Organization
from ..services.feature_service import get_feature_service

logger = logging.getLogger(__name__)

# Only import stripe if configured
try:
    import stripe

    if settings.STRIPE_SECRET_KEY:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        STRIPE_AVAILABLE = True
    else:
        STRIPE_AVAILABLE = False
        logger.warning("STRIPE_SECRET_KEY not configured - Stripe features disabled")
except ImportError:
    STRIPE_AVAILABLE = False
    logger.warning("Stripe library not installed - pip install stripe")


class StripeService:
    """Basic Stripe integration service."""

    def __init__(self, db: Session):
        """Initialize Stripe service with database session."""
        self.db = db

        if not STRIPE_AVAILABLE:
            logger.info("StripeService initialized but Stripe is not available")

    def is_stripe_configured(self) -> bool:
        """Check if Stripe is properly configured."""
        return STRIPE_AVAILABLE and bool(settings.STRIPE_SECRET_KEY)

    def create_checkout_session(
        self, organization: Organization, plan: Plan, success_url: str, cancel_url: str
    ) -> dict:
        """Create Stripe checkout session for plan upgrade."""
        if not self.is_stripe_configured():
            logger.warning("Stripe checkout requested but not configured")
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Payment processing not configured. Please contact support.",
            )

        try:
            # Create checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "brl",
                            "product_data": {
                                "name": f"Plano {plan.name}",
                                "description": f"Assinatura mensal - {len(plan.features)} recursos incluídos",
                            },
                            "unit_amount": plan.price_cents,
                            "recurring": {"interval": "month"} if plan.price_cents > 0 else None,
                        },
                        "quantity": 1,
                    }
                ],
                mode="subscription" if plan.price_cents > 0 else "payment",
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=str(organization.id),
                metadata={
                    "organization_id": str(organization.id),
                    "organization_name": organization.name,
                    "plan_id": str(plan.id),
                    "plan_slug": plan.slug,
                    "plan_name": plan.name,
                },
                customer_email=None,  # Will be filled by Stripe
                allow_promotion_codes=True,
                billing_address_collection="required",
            )

            logger.info(
                f"Stripe checkout session created: {session.id} for org {organization.id} -> plan {plan.slug}",
                extra={
                    "organization_id": str(organization.id),
                    "plan_slug": plan.slug,
                    "session_id": session.id,
                    "amount_cents": plan.price_cents,
                },
            )

            return {"checkout_url": session.url, "session_id": session.id}

        except Exception as e:
            logger.error(f"Stripe error creating checkout session: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment session. Please try again later.",
            )

    def _validate_webhook_configuration(self):
        """Validate webhook configuration."""
        if not self.is_stripe_configured():
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Webhook processing not configured",
            )

        if not settings.STRIPE_WEBHOOK_SECRET:
            logger.error("STRIPE_WEBHOOK_SECRET not configured")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Webhook secret not configured",
            )

    def _construct_webhook_event(self, payload: bytes, signature: str):
        """Construct and validate webhook event from Stripe."""
        try:
            return stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            logger.error(f"Invalid webhook payload: {e}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid webhook signature: {e}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    def _process_webhook_event(self, event):
        """Process webhook event based on type."""
        event_type = event["type"]
        event_data = event["data"]["object"]

        logger.info(f"Processing Stripe webhook: {event_type}")

        event_handlers = {
            "checkout.session.completed": self._handle_checkout_completed,
            "invoice.payment_succeeded": self._handle_payment_succeeded,
            "customer.subscription.deleted": self._handle_subscription_cancelled,
            "invoice.payment_failed": self._handle_payment_failed,
        }

        handler = event_handlers.get(event_type)
        if handler:
            handler(event_data)
        else:
            logger.info(f"Unhandled webhook event type: {event_type}")

    def handle_webhook(self, payload: bytes, signature: str) -> dict:
        """Handle Stripe webhook events."""
        self._validate_webhook_configuration()

        try:
            event = self._construct_webhook_event(payload, signature)
            self._process_webhook_event(event)
            return {"status": "success", "event_type": event["type"]}

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error processing webhook: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Webhook processing failed",
            )

    def _handle_checkout_completed(self, session):
        """Handle successful checkout completion."""
        try:
            organization_id = UUID(session["metadata"]["organization_id"])
            UUID(session["metadata"]["plan_id"])
            plan_slug = session["metadata"]["plan_slug"]

            logger.info(f"Processing checkout completion: org={organization_id}, plan={plan_slug}")

            # Update organization subscription
            feature_service = get_feature_service(self.db)
            subscription = feature_service.upgrade_subscription(
                organization_id, plan_slug, session.get("subscription")
            )

            # Update Stripe customer ID if available
            if session.get("customer"):
                subscription.stripe_customer_id = session["customer"]
                self.db.commit()

            logger.info(
                f"Subscription updated after checkout: org={organization_id}, plan={plan_slug}",
                extra={
                    "organization_id": str(organization_id),
                    "plan_slug": plan_slug,
                    "stripe_subscription_id": session.get("subscription"),
                    "stripe_customer_id": session.get("customer"),
                },
            )

        except Exception as e:
            logger.error(f"Error handling checkout completion: {e}")
            # Don't raise - webhook should return 200 to Stripe

    def _handle_payment_succeeded(self, invoice):
        """Handle successful payment."""
        try:
            subscription_id = invoice.get("subscription")
            if subscription_id:
                logger.info(f"Payment succeeded for subscription: {subscription_id}")

                # Optionally update subscription status or send notifications
                # For now, just log the successful payment

        except Exception as e:
            logger.error(f"Error handling payment success: {e}")

    def _handle_subscription_cancelled(self, subscription):
        """Handle subscription cancellation - downgrade to basic."""
        try:
            stripe_subscription_id = subscription["id"]

            # Find organization by stripe subscription ID
            org_subscription = (
                self.db.query(OrganizationSubscription)
                .filter(OrganizationSubscription.stripe_subscription_id == stripe_subscription_id)
                .first()
            )

            if org_subscription:
                logger.info(
                    f"Processing subscription cancellation: org={org_subscription.organization_id}"
                )

                # Downgrade to basic plan
                feature_service = get_feature_service(self.db)
                feature_service.downgrade_to_basic(org_subscription.organization_id)

                logger.info(
                    f"Organization {org_subscription.organization_id} downgraded to basic after subscription cancellation"
                )
            else:
                logger.warning(
                    f"No organization found for cancelled Stripe subscription: {stripe_subscription_id}"
                )

        except Exception as e:
            logger.error(f"Error handling subscription cancellation: {e}")

    def _handle_payment_failed(self, invoice):
        """Handle failed payment."""
        try:
            subscription_id = invoice.get("subscription")
            if subscription_id:
                logger.warning(f"Payment failed for subscription: {subscription_id}")

                # Optionally implement grace period or notification logic
                # For now, just log the failed payment

        except Exception as e:
            logger.error(f"Error handling payment failure: {e}")

    def create_customer(self, organization: Organization, email: str) -> Optional[str]:
        """Create Stripe customer for organization."""
        if not self.is_stripe_configured():
            return None

        try:
            customer = stripe.Customer.create(
                email=email,
                name=organization.name,
                metadata={
                    "organization_id": str(organization.id),
                    "organization_name": organization.name,
                },
            )

            logger.info(f"Created Stripe customer: {customer.id} for org {organization.id}")
            return customer.id

        except Exception as e:
            logger.error(f"Error creating Stripe customer: {e}")
            return None

    def cancel_subscription(self, stripe_subscription_id: str) -> bool:
        """Cancel Stripe subscription."""
        if not self.is_stripe_configured():
            return False

        try:
            stripe.Subscription.delete(stripe_subscription_id)
            logger.info(f"Cancelled Stripe subscription: {stripe_subscription_id}")
            return True

        except Exception as e:
            logger.error(f"Error cancelling Stripe subscription {stripe_subscription_id}: {e}")
            return False


def get_stripe_service(db: Session) -> StripeService:
    """Get Stripe service instance."""
    return StripeService(db)
