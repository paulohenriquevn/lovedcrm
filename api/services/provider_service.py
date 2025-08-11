"""Provider Service for Multi-Provider Management.

Service layer for managing multiple providers per type with hot-swap capability.
Follows clean architecture pattern and multi-tenancy requirements.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from api.models.crm_organization_integration import (
    IntegrationProvider,
    IntegrationStatus,
    OrganizationIntegration,
)


class ProviderService:
    """Service for managing multi-provider functionality.

    Provides hot-swap capability and cost comparison features
    using existing OrganizationIntegration infrastructure.
    """

    def __init__(self, db: Session):
        """Initialize provider service.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db

    async def get_primary_provider(
        self, org_id: UUID, provider_type: IntegrationProvider
    ) -> Optional[OrganizationIntegration]:
        """Get active primary provider for organization and type.

        Args:
            org_id: Organization UUID
            provider_type: Provider type enum

        Returns:
            Primary provider or None if not found
        """
        return OrganizationIntegration.get_primary_provider(self.db, org_id, provider_type)

    async def get_all_providers(
        self, org_id: UUID, provider_type: IntegrationProvider
    ) -> List[OrganizationIntegration]:
        """Get all providers for organization and type.

        Args:
            org_id: Organization UUID
            provider_type: Provider type enum

        Returns:
            List of providers ordered by priority (desc) then created_at
        """
        return OrganizationIntegration.get_all_providers(self.db, org_id, provider_type)

    async def switch_primary_provider(
        self, org_id: UUID, provider_type: IntegrationProvider, new_provider_id: UUID
    ) -> bool:
        """Atomic provider switching with zero downtime.

        Args:
            org_id: Organization UUID
            provider_type: Provider type enum
            new_provider_id: UUID of provider to make primary

        Returns:
            bool: True if switch was successful

        Raises:
            ValueError: If provider not found or not owned by organization
            Exception: If atomic operation fails
        """
        # Get target provider with validation
        new_provider = (
            self.db.query(OrganizationIntegration)
            .filter(
                OrganizationIntegration.id == new_provider_id,
                OrganizationIntegration.organization_id == org_id,
                OrganizationIntegration.provider == provider_type,
            )
            .first()
        )

        if not new_provider:
            raise ValueError(f"Provider {new_provider_id} not found for organization {org_id}")

        # Use model's atomic switch method
        return await new_provider.switch_to_primary(self.db)

    async def get_cost_comparison(
        self, org_id: UUID, provider_type: IntegrationProvider
    ) -> Dict[str, Any]:
        """Calculate cost comparison between available providers.

        Args:
            org_id: Organization UUID
            provider_type: Provider type enum

        Returns:
            Dict with cost comparison data
        """
        providers = await self.get_all_providers(org_id, provider_type)

        # Calculate cost comparison based on metadata
        provider_costs = []
        for provider in providers:
            metadata = provider.integration_metadata or {}

            cost_info = {
                "id": str(provider.id),
                "name": provider.provider_name,
                "provider_type": provider.provider.value,
                "is_primary": provider.is_primary,
                "status": provider.status.value,
                "priority": provider.priority,
                "cost_per_message": metadata.get("cost_per_message", 0.0),
                "monthly_cost": metadata.get("monthly_cost", 0.0),
                "setup_cost": metadata.get("setup_cost", 0.0),
                "features": metadata.get("features", []),
                "limits": metadata.get("limits", {}),
                "created_at": provider.created_at.isoformat(),
                "last_sync_at": provider.last_sync_at.isoformat()
                if provider.last_sync_at
                else None,
            }
            provider_costs.append(cost_info)

        # Calculate savings vs most expensive provider
        if provider_costs:
            max_monthly = max(p["monthly_cost"] for p in provider_costs)
            for provider in provider_costs:
                monthly_cost = provider["monthly_cost"]
                provider["potential_savings"] = max_monthly - monthly_cost
                if max_monthly > 0:
                    provider["savings_percentage"] = (
                        (max_monthly - monthly_cost) / max_monthly
                    ) * 100
                else:
                    provider["savings_percentage"] = 0

        return {
            "provider_type": provider_type.value,
            "total_providers": len(provider_costs),
            "providers": provider_costs,
            "recommendations": self._generate_cost_recommendations(provider_costs),
        }

    def _generate_cost_recommendations(self, providers: List[Dict[str, Any]]) -> List[str]:
        """Generate cost optimization recommendations.

        Args:
            providers: List of provider cost data

        Returns:
            List of recommendation strings
        """
        recommendations = []

        if not providers:
            return ["No providers configured"]

        # Find cheapest and most expensive
        cheapest = min(providers, key=lambda p: p["monthly_cost"])
        most_expensive = max(providers, key=lambda p: p["monthly_cost"])
        primary = next((p for p in providers if p["is_primary"]), None)

        if cheapest["monthly_cost"] < most_expensive["monthly_cost"]:
            savings = most_expensive["monthly_cost"] - cheapest["monthly_cost"]
            recommendations.append(
                f"Switch to {cheapest['name']} to save ${savings:.2f}/month "
                f"({cheapest['savings_percentage']:.1f}% savings)"
            )

        if primary and primary["id"] != cheapest["id"]:
            primary_cost = primary["monthly_cost"]
            cheapest_cost = cheapest["monthly_cost"]
            if cheapest_cost < primary_cost:
                monthly_savings = primary_cost - cheapest_cost
                recommendations.append(
                    f"Current primary ({primary['name']}) costs ${monthly_savings:.2f}/month "
                    f"more than cheapest option ({cheapest['name']})"
                )

        # Volume-based recommendations
        high_volume_threshold = 5000  # messages/month
        for provider in providers:
            limits = provider.get("limits", {})
            if (
                "max_messages_monthly" in limits
                and limits["max_messages_monthly"] > high_volume_threshold
            ):
                recommendations.append(
                    f"{provider['name']} recommended for high volume (>{high_volume_threshold} msgs/month)"
                )

        return recommendations

    async def create_provider_configuration(
        self,
        org_id: UUID,
        provider_type: IntegrationProvider,
        provider_name: str,
        encrypted_credentials: str,
        webhook_secret: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        is_primary: bool = False,
        priority: int = 0,
    ) -> OrganizationIntegration:
        """Create new provider configuration.

        Args:
            org_id: Organization UUID
            provider_type: Provider type enum
            provider_name: Human-readable provider name
            encrypted_credentials: Encrypted provider credentials
            webhook_secret: Optional webhook secret
            metadata: Optional provider metadata (costs, features, etc.)
            is_primary: Whether this should be the primary provider
            priority: Provider priority for fallback scenarios

        Returns:
            Created OrganizationIntegration instance
        """
        # Create provider using appropriate factory method
        if provider_type == IntegrationProvider.WHATSAPP:
            provider = OrganizationIntegration.create_whatsapp_integration(
                organization_id=org_id,
                encrypted_credentials=encrypted_credentials,
                webhook_secret=webhook_secret,
                metadata=metadata,
                provider_name=provider_name,
                is_primary=is_primary,
                priority=priority,
            )
        elif provider_type in [IntegrationProvider.GMAIL, IntegrationProvider.OUTLOOK]:
            provider_str = "gmail" if provider_type == IntegrationProvider.GMAIL else "outlook"
            provider = OrganizationIntegration.create_email_integration(
                organization_id=org_id,
                provider=provider_str,
                encrypted_credentials=encrypted_credentials,
                metadata=metadata,
                provider_name=provider_name,
                is_primary=is_primary,
                priority=priority,
            )
        elif provider_type in [IntegrationProvider.TWILIO, IntegrationProvider.VOIP_PROVIDER]:
            provider_str = (
                "twilio" if provider_type == IntegrationProvider.TWILIO else "voip_provider"
            )
            provider = OrganizationIntegration.create_voip_integration(
                organization_id=org_id,
                provider=provider_str,
                encrypted_credentials=encrypted_credentials,
                webhook_secret=webhook_secret,
                metadata=metadata,
                provider_name=provider_name,
                is_primary=is_primary,
                priority=priority,
            )
        else:
            raise ValueError(f"Unsupported provider type: {provider_type}")

        # Save to database
        self.db.add(provider)
        self.db.commit()
        self.db.refresh(provider)

        return provider

    async def get_organization_providers_summary(self, org_id: UUID) -> Dict[str, Any]:
        """Get complete summary of all providers for an organization.

        Args:
            org_id: Organization UUID

        Returns:
            Dict with providers summary by type
        """
        summary = {
            "organization_id": str(org_id),
            "provider_types": {},
            "total_providers": 0,
            "active_providers": 0,
        }

        # Get providers for each type
        for provider_type in IntegrationProvider:
            providers = await self.get_all_providers(org_id, provider_type)

            if providers:
                type_summary = {
                    "total": len(providers),
                    "active": len([p for p in providers if p.is_active]),
                    "primary": next((p.provider_name for p in providers if p.is_primary), None),
                    "providers": [
                        {
                            "id": str(p.id),
                            "name": p.provider_name,
                            "status": p.status.value,
                            "is_primary": p.is_primary,
                            "priority": p.priority,
                            "created_at": p.created_at.isoformat(),
                        }
                        for p in providers
                    ],
                }
                summary["provider_types"][provider_type.value] = type_summary
                summary["total_providers"] += len(providers)
                summary["active_providers"] += type_summary["active"]

        return summary

    def _check_provider_status(
        self, target_provider: OrganizationIntegration, validation_result: Dict[str, Any]
    ) -> None:
        """Check target provider status and update validation result.

        Args:
            target_provider: Target provider to check
            validation_result: Validation result dict to update
        """
        if target_provider.status != IntegrationStatus.ACTIVE:
            if target_provider.status == IntegrationStatus.ERROR:
                validation_result["safe_to_switch"] = False
                validation_result["blockers"].append(
                    f"Target provider has error status: {target_provider.integration_metadata.get('last_error', 'Unknown error')}"
                )
            elif target_provider.status == IntegrationStatus.PENDING:
                validation_result["warnings"].append(
                    "Target provider is still in pending status - setup may be incomplete"
                )
            else:
                validation_result["warnings"].append(
                    f"Target provider status is {target_provider.status.value}"
                )

    def _check_feature_compatibility(
        self,
        current_primary: Optional[OrganizationIntegration],
        target_provider: OrganizationIntegration,
        validation_result: Dict[str, Any],
    ) -> None:
        """Check feature compatibility between providers.

        Args:
            current_primary: Current primary provider
            target_provider: Target provider
            validation_result: Validation result dict to update
        """
        if current_primary and target_provider:
            current_features = set(current_primary.integration_metadata.get("features", []))
            target_features = set(target_provider.integration_metadata.get("features", []))

            missing_features = current_features - target_features
            if missing_features:
                validation_result["warnings"].append(
                    f"Target provider missing features: {', '.join(missing_features)}"
                )

    def _analyze_cost_impact(
        self,
        current_primary: Optional[OrganizationIntegration],
        target_provider: OrganizationIntegration,
        validation_result: Dict[str, Any],
    ) -> None:
        """Analyze cost impact of provider switch.

        Args:
            current_primary: Current primary provider
            target_provider: Target provider
            validation_result: Validation result dict to update
        """
        if current_primary and target_provider:
            current_cost = current_primary.integration_metadata.get("monthly_cost", 0)
            target_cost = target_provider.integration_metadata.get("monthly_cost", 0)

            if target_cost > current_cost:
                increase = target_cost - current_cost
                validation_result["warnings"].append(
                    f"Switch will increase monthly cost by ${increase:.2f}"
                )
            elif target_cost < current_cost:
                savings = current_cost - target_cost
                validation_result["recommendations"].append(
                    f"Switch will save ${savings:.2f}/month"
                )

    async def validate_provider_switch_safety(
        self,
        org_id: UUID,
        provider_type: IntegrationProvider,
        new_provider_id: UUID,
    ) -> Dict[str, Any]:
        """Validate if provider switch is safe to perform.

        Args:
            org_id: Organization UUID
            provider_type: Provider type enum
            new_provider_id: UUID of provider to switch to

        Returns:
            Dict with safety validation results
        """
        validation_result = {
            "safe_to_switch": True,
            "warnings": [],
            "blockers": [],
            "recommendations": [],
        }

        # Get current primary and target provider
        current_primary = await self.get_primary_provider(org_id, provider_type)
        target_provider = (
            self.db.query(OrganizationIntegration)
            .filter(
                OrganizationIntegration.id == new_provider_id,
                OrganizationIntegration.organization_id == org_id,
                OrganizationIntegration.provider == provider_type,
            )
            .first()
        )

        if not target_provider:
            validation_result["safe_to_switch"] = False
            validation_result["blockers"].append("Target provider not found")
            return validation_result

        # Run validation checks
        self._check_provider_status(target_provider, validation_result)

        # Check if switching to same provider
        if current_primary and current_primary.id == new_provider_id:
            validation_result["warnings"].append("Target provider is already the primary provider")

        # Feature and cost compatibility checks
        self._check_feature_compatibility(current_primary, target_provider, validation_result)
        self._analyze_cost_impact(current_primary, target_provider, validation_result)

        return validation_result
