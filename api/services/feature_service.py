"""Simple feature service for plan-based feature blocking.

Follows KISS principle - basic functionality only.
"""
import logging
from typing import List, Optional, Set
from uuid import UUID

from sqlalchemy import and_
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.billing import OrganizationSubscription, Plan

logger = logging.getLogger(__name__)


class FeatureService:
    """Simple service for checking organization features based on subscription plan."""

    def __init__(self, db: Session):
        """Initialize feature service with database session."""
        self.db = db

    def check_organization_has_feature(self, org_id: UUID, feature_name: str) -> bool:
        """Check if organization has access to a specific feature.

        Args:
            org_id: Organization UUID
            feature_name: Feature name (e.g., "advanced_reports")

        Returns:
            bool: True if organization has access to feature, False otherwise
        """
        try:
            # Get organization's active subscription
            subscription = (
                self.db.query(OrganizationSubscription)
                .join(Plan)
                .filter(
                    and_(
                        OrganizationSubscription.organization_id == org_id,
                        OrganizationSubscription.is_active.is_(True),
                        Plan.is_active.is_(True),
                    )
                )
                .first()
            )

            if not subscription:
                logger.warning(f"No active subscription found for organization {org_id}")
                # Fallback: if no subscription, assume basic plan features
                basic_features = settings.PLAN_BASIC_FEATURES.split(",")
                has_feature = feature_name in basic_features
                logger.debug(
                    f"Using fallback basic features for org {org_id}: {feature_name} = {has_feature}"
                )
                return has_feature

            # Check if feature is in plan's features list
            plan_features = subscription.plan.features or []
            has_feature = feature_name in plan_features

            logger.debug(
                f"Organization {org_id} feature check: {feature_name} = {has_feature} (plan: {subscription.plan.name})"
            )
            return has_feature

        except Exception as e:
            logger.error(f"Error checking feature {feature_name} for org {org_id}: {e}")
            # Fail-safe: return False on error to block access
            return False

    def get_organization_features(self, org_id: UUID) -> Set[str]:
        """Get all features available for an organization."""
        try:
            subscription = (
                self.db.query(OrganizationSubscription)
                .join(Plan)
                .filter(
                    and_(
                        OrganizationSubscription.organization_id == org_id,
                        OrganizationSubscription.is_active.is_(True),
                        Plan.is_active.is_(True),
                    )
                )
                .first()
            )

            if not subscription:
                # Return basic plan features as fallback
                basic_features = settings.PLAN_BASIC_FEATURES.split(",")
                return {f.strip() for f in basic_features if f.strip()}

            return set(subscription.plan.features or [])

        except Exception as e:
            logger.error(f"Error getting features for org {org_id}: {e}")
            # Rollback failed transaction and return basic features
            self.db.rollback()
            try:
                basic_features = settings.PLAN_BASIC_FEATURES.split(",")
                return {f.strip() for f in basic_features if f.strip()}
            except Exception:
                return set()

    def get_organization_plan(self, org_id: UUID) -> Optional[Plan]:
        """Get organization's current plan."""
        try:
            subscription = (
                self.db.query(OrganizationSubscription)
                .join(Plan)
                .filter(
                    and_(
                        OrganizationSubscription.organization_id == org_id,
                        OrganizationSubscription.is_active.is_(True),
                        Plan.is_active.is_(True),
                    )
                )
                .first()
            )

            return subscription.plan if subscription else None

        except Exception as e:
            logger.error(f"Error getting plan for org {org_id}: {e}")
            return None

    def get_organization_subscription(self, org_id: UUID) -> Optional[OrganizationSubscription]:
        """Get organization's active subscription."""
        try:
            subscription = (
                self.db.query(OrganizationSubscription)
                .filter(
                    and_(
                        OrganizationSubscription.organization_id == org_id,
                        OrganizationSubscription.is_active.is_(True),
                    )
                )
                .first()
            )

            return subscription

        except Exception as e:
            logger.error(f"Error getting subscription for org {org_id}: {e}")
            return None

    def create_subscription(self, org_id: UUID, plan_slug: str) -> OrganizationSubscription:
        """Create a new subscription for an organization."""
        try:
            # Get the plan
            plan = (
                self.db.query(Plan)
                .filter(and_(Plan.slug == plan_slug, Plan.is_active.is_(True)))
                .first()
            )

            if not plan:
                raise ValueError(f"Plan '{plan_slug}' not found or inactive")

            # Deactivate existing subscription
            existing = (
                self.db.query(OrganizationSubscription)
                .filter(
                    and_(
                        OrganizationSubscription.organization_id == org_id,
                        OrganizationSubscription.is_active.is_(True),
                    )
                )
                .first()
            )

            if existing:
                existing.is_active = False
                logger.info(f"Deactivated existing subscription for org {org_id}")

            # Create new subscription
            subscription = OrganizationSubscription(
                organization_id=org_id, plan_id=plan.id, is_active=True
            )

            self.db.add(subscription)
            self.db.commit()
            self.db.refresh(subscription)

            logger.info(f"Created subscription: org={org_id}, plan={plan_slug}")
            return subscription

        except Exception as e:
            logger.error(f"Error creating subscription for org {org_id}: {e}")
            self.db.rollback()
            raise

    def upgrade_subscription(
        self, org_id: UUID, new_plan_slug: str, stripe_subscription_id: Optional[str] = None
    ) -> OrganizationSubscription:
        """Upgrade organization to a new plan."""
        try:
            # Get the new plan
            new_plan = (
                self.db.query(Plan)
                .filter(and_(Plan.slug == new_plan_slug, Plan.is_active.is_(True)))
                .first()
            )

            if not new_plan:
                raise ValueError(f"Plan '{new_plan_slug}' not found")

            # Get current subscription
            current_subscription = self.get_organization_subscription(org_id)

            if current_subscription:
                # Update existing subscription
                current_subscription.plan_id = new_plan.id
                if stripe_subscription_id:
                    current_subscription.stripe_subscription_id = stripe_subscription_id
                self.db.commit()
                self.db.refresh(current_subscription)

                logger.info(f"Upgraded subscription: org={org_id}, plan={new_plan_slug}")
                return current_subscription
            else:
                # Create new subscription
                return self.create_subscription(org_id, new_plan_slug)

        except Exception as e:
            logger.error(f"Error upgrading subscription for org {org_id}: {e}")
            self.db.rollback()
            raise

    def downgrade_to_basic(self, org_id: UUID) -> OrganizationSubscription:
        """Downgrade organization to basic (free) plan."""
        return self.upgrade_subscription(org_id, "basic")

    def get_all_plans(self) -> List[Plan]:
        """Get all available plans."""
        try:
            return (
                self.db.query(Plan)
                .filter(Plan.is_active.is_(True))
                .order_by(Plan.price_cents)
                .all()
            )
        except Exception as e:
            logger.error(f"Error getting all plans: {e}")
            return []

    def sync_plans_with_config(self) -> None:
        """Sync database plans with configuration settings."""
        try:
            config_plans = settings.available_plans

            for slug, config in config_plans.items():
                plan = self.db.query(Plan).filter(Plan.slug == slug).first()

                if plan:
                    # Update existing plan
                    plan.name = config["name"]
                    plan.price_cents = config["price"]
                    plan.features = config["features"]
                    logger.debug(f"Updated plan {slug} from config")
                else:
                    # Create new plan
                    plan = Plan(
                        name=config["name"],
                        slug=slug,
                        price_cents=config["price"],
                        features=config["features"],
                        is_active=True,
                    )
                    self.db.add(plan)
                    logger.info(f"Created new plan {slug} from config")

            self.db.commit()
            logger.info("Plans synced with configuration")

        except Exception as e:
            logger.error(f"Error syncing plans with config: {e}")
            self.db.rollback()
            raise


# Singleton service getter
def get_feature_service(db: Session) -> FeatureService:
    """Get feature service instance."""
    return FeatureService(db)
