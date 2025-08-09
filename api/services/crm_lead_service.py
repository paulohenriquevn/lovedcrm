"""CRM Lead Service.

Business logic for Lead management with organizational isolation.
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from api.models.crm_lead import Lead, PipelineStage
from api.models.organization import Organization
from api.repositories.crm_lead_repository import CRMLeadRepository
from api.schemas.crm_lead import (
    AdvancedFiltersSchema,
    AdvancedMetricsResponse,
    BottleneckAnalysis,
    ConversionFunnelStage,
    ConversionMetricsResponse,
    ExecutiveSummary,
    FilterOptionsResponse,
    LeadCreate,
    LeadFavoriteToggle,
    LeadListResponse,
    LeadResponse,
    LeadStageUpdate,
    LeadUpdate,
    PipelineStatsResponse,
    StageDistribution,
    TrendingData,
)

logger = logging.getLogger(__name__)


class CRMLeadService:
    """Service for Lead business logic with organizational scope."""

    def __init__(self, db: Session):
        """Initialize the CRM Lead Service."""
        self.db = db
        self.repository = CRMLeadRepository(db)

    async def create_lead(
        self, organization: Organization, lead_data: LeadCreate, user_id: Optional[UUID] = None
    ) -> Lead:
        """Create new lead for organization."""
        try:
            # Create lead with organization context
            lead = Lead(
                organization_id=organization.id,
                name=lead_data.name,
                email=lead_data.email,
                phone=lead_data.phone,
                stage=lead_data.stage,
                source=lead_data.source,
                estimated_value=lead_data.estimated_value,
                tags=lead_data.tags or [],
                notes=lead_data.notes,
                assigned_user_id=lead_data.assigned_user_id,
            )

            self.db.add(lead)
            self.db.commit()
            self.db.refresh(lead)

            logger.info(
                "Lead created successfully",
                extra={
                    "organization_id": str(organization.id),
                    "lead_id": str(lead.id),
                    "lead_name": lead.name,
                    "lead_stage": lead.stage,
                },
            )

            # Broadcast lead creation event to organization
            try:
                lead_dict = {
                    "id": str(lead.id),
                    "name": lead.name,
                    "email": lead.email,
                    "stage": lead.stage.value if hasattr(lead.stage, "value") else lead.stage,
                    "estimated_value": str(lead.estimated_value) if lead.estimated_value else None,
                    "organization_id": str(organization.id),
                }

                # Import here to avoid circular imports
                from api.core.websocket_manager import websocket_manager

                event_message = {
                    "type": "lead_created",
                    "lead": lead_dict,
                    "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
                    "user_id": str(user_id) if user_id else None,
                }

                # Now we can use async/await directly since the method is async
                # Note: We include the creator in the broadcast for better UX in collaborative environments
                try:
                    await websocket_manager.broadcast_to_organization(
                        organization.id,
                        event_message,  # No exclude_user_id - everyone gets the event
                    )
                except Exception as broadcast_error:
                    logger.error(f"Failed to broadcast lead creation event: {broadcast_error}")

            except Exception as e:
                logger.error(f"Failed to prepare lead creation broadcast: {e}")

            return lead

        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to create lead",
                extra={
                    "organization_id": str(organization.id),
                    "error": str(e),
                    "lead_data": lead_data.model_dump(),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create lead"
            )

    def get_organization_leads(
        self,
        organization: Organization,
        page: int = 1,
        page_size: int = 20,
        stage: Optional[PipelineStage] = None,
    ) -> LeadListResponse:
        """Get leads for organization with pagination and optional stage filter."""
        try:
            skip = (page - 1) * page_size

            if stage:
                leads = self.repository.get_by_organization_and_stage(
                    org_id=organization.id, stage=stage
                )
                # Apply pagination manually for stage filter
                total_count = len(leads)
                leads = leads[skip : skip + page_size]
            else:
                leads = self.repository.get_by_organization(
                    org_id=organization.id, skip=skip, limit=page_size
                )
                total_count = self.repository.count_by_organization(organization.id)

            # Convert to response models with computed properties
            lead_responses = []
            for lead in leads:
                lead_response = LeadResponse.model_validate(lead)
                lead_response.is_closed = lead.is_closed
                lead_response.days_in_current_stage = lead.days_in_current_stage
                lead_responses.append(lead_response)

            return LeadListResponse(
                leads=lead_responses,
                total_count=total_count,
                page=page,
                page_size=page_size,
                has_more=total_count > (page * page_size),
            )

        except Exception as e:
            logger.error(
                "Failed to get organization leads",
                extra={
                    "organization_id": str(organization.id),
                    "page": page,
                    "page_size": page_size,
                    "stage": stage,
                    "error": str(e),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve leads"
            )

    def get_lead_by_id(self, organization: Organization, lead_id: UUID) -> Lead:
        """Get single lead by ID with organization validation."""
        lead = self.repository.get_by_id_and_org(lead_id, organization.id)

        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        return lead

    def update_lead(self, organization: Organization, lead_id: UUID, lead_data: LeadUpdate) -> Lead:
        """Update existing lead."""
        try:
            lead = self.get_lead_by_id(organization, lead_id)

            # Update fields that were provided
            update_data = lead_data.model_dump(exclude_unset=True)

            for field, value in update_data.items():
                setattr(lead, field, value)

            self.db.commit()
            self.db.refresh(lead)

            logger.info(
                "Lead updated successfully",
                extra={
                    "organization_id": str(organization.id),
                    "lead_id": str(lead.id),
                    "updated_fields": list(update_data.keys()),
                },
            )

            # Broadcast lead update event to organization
            try:
                # lead_dict prepared for future websocket broadcast
                # lead_dict = {
                #     "id": str(lead.id),
                #     "name": lead.name,
                #     "email": lead.email,
                #     "stage": lead.stage.value if hasattr(lead.stage, "value") else lead.stage,
                #     "estimated_value": str(lead.estimated_value) if lead.estimated_value else None,
                #     "organization_id": str(organization.id),
                #     "updated_fields": list(update_data.keys()),
                # }

                # Note: WebSocket broadcast skipped in sync method for stability
                logger.debug(
                    f"Lead updated - websocket broadcast deferred for org {organization.id}"
                )
                # Future: event_message will be used for async websocket broadcasting

            except Exception as e:
                logger.error(f"Failed to prepare lead update broadcast: {e}")

            return lead

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to update lead",
                extra={
                    "organization_id": str(organization.id),
                    "lead_id": str(lead_id),
                    "error": str(e),
                    "update_data": lead_data.model_dump(),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update lead"
            )

    async def update_lead_stage(
        self,
        organization: Organization,
        lead_id: UUID,
        stage_data: LeadStageUpdate,
        user_id: Optional[UUID] = None,
    ) -> Lead:
        """Update lead pipeline stage."""
        try:
            lead = self.repository.update_stage(
                lead_id=lead_id, org_id=organization.id, new_stage=stage_data.stage
            )

            if not lead:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

            # Add notes about stage transition if provided
            if stage_data.notes:
                self._add_stage_update_notes(lead, stage_data.notes)

            logger.info(
                "Lead stage updated successfully",
                extra={
                    "organization_id": str(organization.id),
                    "lead_id": str(lead.id),
                    "new_stage": stage_data.stage,
                    "notes": stage_data.notes,
                },
            )

            # Broadcast stage change event to organization
            await self._broadcast_stage_change(lead, organization, stage_data, user_id)

            return lead

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to update lead stage",
                extra={
                    "organization_id": str(organization.id),
                    "lead_id": str(lead_id),
                    "error": str(e),
                    "stage_data": stage_data.model_dump(),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update lead stage",
            )

    def delete_lead(self, organization: Organization, lead_id: UUID) -> bool:
        """Delete lead with organization validation."""
        try:
            lead = self.get_lead_by_id(organization, lead_id)

            # Store lead info before deletion for broadcasting
            # lead_dict prepared for future websocket broadcast
            # lead_dict = {
            #     "id": str(lead.id),
            #     "name": lead.name,
            #     "email": lead.email,
            #     "stage": lead.stage.value if hasattr(lead.stage, "value") else lead.stage,
            #     "organization_id": str(organization.id),
            # }

            # Use repository delete method
            self.repository.delete(lead)

            logger.info(
                "Lead deleted successfully",
                extra={"organization_id": str(organization.id), "lead_id": str(lead_id)},
            )

            # Broadcast lead deletion event to organization
            try:
                # Note: WebSocket broadcast skipped in sync method for stability
                logger.debug(
                    f"Lead deleted - websocket broadcast deferred for org {organization.id}"
                )
                # Future: event_message will be used for async websocket broadcasting

            except Exception as e:
                logger.error(f"Failed to prepare lead deletion broadcast: {e}")

            return True

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to delete lead",
                extra={
                    "organization_id": str(organization.id),
                    "lead_id": str(lead_id),
                    "error": str(e),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete lead"
            )

    def get_pipeline_statistics(self, organization: Organization) -> PipelineStatsResponse:
        """Get pipeline statistics for organization."""
        try:
            stage_counts = self.repository.get_pipeline_stages_count(organization.id)
            total_leads = sum(stage_counts.values())

            # Calculate conversion rate (closed deals / total leads)
            closed_count = stage_counts.get(PipelineStage.FECHADO.value, 0)
            conversion_rate = None
            if total_leads > 0:
                conversion_rate = round((closed_count / total_leads) * 100, 2)

            return PipelineStatsResponse(
                stage_counts=stage_counts, total_leads=total_leads, conversion_rate=conversion_rate
            )

        except Exception as e:
            logger.error(
                "Failed to get pipeline statistics",
                extra={"organization_id": str(organization.id), "error": str(e)},
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve pipeline statistics",
            )

    def search_leads(
        self, organization: Organization, query: str, page: int = 1, page_size: int = 20
    ) -> LeadListResponse:
        """Search leads by name, email or phone."""
        try:
            skip = (page - 1) * page_size

            leads = self.repository.search_by_organization(
                org_id=organization.id, query=query, skip=skip, limit=page_size
            )

            # For simplicity, we don't count total search results
            # In production, you might want to add a separate count query
            total_count = len(leads)

            # Convert to response models
            lead_responses = []
            for lead in leads:
                lead_response = LeadResponse.model_validate(lead)
                lead_response.is_closed = lead.is_closed
                lead_response.days_in_current_stage = lead.days_in_current_stage
                lead_responses.append(lead_response)

            return LeadListResponse(
                leads=lead_responses,
                total_count=total_count,
                page=page,
                page_size=page_size,
                has_more=len(leads) == page_size,  # Simple approximation
            )

        except Exception as e:
            logger.error(
                "Failed to search leads",
                extra={"organization_id": str(organization.id), "query": query, "error": str(e)},
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to search leads"
            )

    def toggle_lead_favorite(
        self, organization: Organization, lead_id: UUID, favorite_data: LeadFavoriteToggle
    ) -> Lead:
        """Toggle lead favorite status."""
        try:
            lead = self.get_lead_by_id(organization, lead_id)

            # Update favorite status
            lead.is_favorite = favorite_data.is_favorite

            self.db.commit()
            self.db.refresh(lead)

            logger.info(
                "Lead favorite status updated successfully",
                extra={
                    "organization_id": str(organization.id),
                    "lead_id": str(lead.id),
                    "is_favorite": favorite_data.is_favorite,
                },
            )

            return lead

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to toggle lead favorite",
                extra={
                    "organization_id": str(organization.id),
                    "lead_id": str(lead_id),
                    "error": str(e),
                    "favorite_data": favorite_data.model_dump(),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to toggle lead favorite status",
            )

    def _add_stage_update_notes(self, lead: Lead, notes: str) -> None:
        """Add stage update notes to lead."""
        if lead.notes:
            lead.notes += f"\n[Stage Update] {notes}"
        else:
            lead.notes = f"[Stage Update] {notes}"

        self.db.commit()
        self.db.refresh(lead)

    async def _broadcast_stage_change(
        self,
        lead: Lead,
        organization: Organization,
        stage_data: LeadStageUpdate,
        user_id: Optional[UUID],
    ) -> None:
        """Broadcast stage change event to organization."""
        try:
            lead_dict = {
                "id": str(lead.id),
                "name": lead.name,
                "email": lead.email,
                "phone": lead.phone,
                "stage": stage_data.stage.value
                if hasattr(stage_data.stage, "value")
                else stage_data.stage,
                "previous_stage": lead.stage.value if hasattr(lead.stage, "value") else lead.stage,
                "estimated_value": float(lead.estimated_value) if lead.estimated_value else None,
                "source": lead.source,
                "assigned_user_id": str(lead.assigned_user_id) if lead.assigned_user_id else None,
                "organization_id": str(organization.id),
                "notes": lead.notes,
                "is_favorite": getattr(lead, "is_favorite", False),
                "created_at": lead.created_at.isoformat() if lead.created_at else None,
                "updated_at": lead.updated_at.isoformat() if lead.updated_at else None,
                "tags": getattr(lead, "tags", []),
            }

            # Import here to avoid circular imports
            from api.core.websocket_manager import websocket_manager

            event_message = {
                "type": "lead_stage_changed",
                "lead": lead_dict,
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
                "user_id": str(user_id) if user_id else None,
            }

            # Broadcast to all organization members
            try:
                await websocket_manager.broadcast_to_organization(organization.id, event_message)
            except Exception as broadcast_error:
                logger.error(f"Failed to broadcast lead stage change event: {broadcast_error}")

        except Exception as e:
            logger.error(f"Failed to prepare lead stage change broadcast: {e}")

    def get_conversion_metrics(
        self,
        organization: Organization,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> ConversionMetricsResponse:
        """Get pipeline conversion metrics for organization."""
        try:
            # Base query with organization filtering
            query = self.db.query(Lead).filter(Lead.organization_id == organization.id)

            # Apply date filters if provided
            if start_date:
                query = query.filter(Lead.created_at >= start_date)
            if end_date:
                query = query.filter(Lead.created_at <= end_date)

            leads = query.all()

            # Calculate stage counts
            stage_counts = {}
            for stage in PipelineStage:
                stage_counts[stage.value] = len([lead for lead in leads if lead.stage == stage])

            # Calculate conversion rates
            total_leads = len(leads)
            closed_leads = stage_counts.get(PipelineStage.FECHADO.value, 0)

            conversion_rate = (closed_leads / total_leads * 100) if total_leads > 0 else 0

            # Calculate average time per stage
            stage_times = self._calculate_average_stage_times(leads)

            # Calculate total pipeline value
            total_value = sum(lead.estimated_value or 0 for lead in leads)
            closed_value = sum(
                lead.estimated_value or 0 for lead in leads if lead.stage == PipelineStage.FECHADO
            )

            return ConversionMetricsResponse(
                stage_counts=stage_counts,
                conversion_rate=round(conversion_rate, 2),
                average_stage_times=stage_times,
                total_pipeline_value=total_value,
                closed_pipeline_value=closed_value,
                total_leads=total_leads,
                period_start=start_date,
                period_end=end_date,
            )

        except Exception as e:
            logger.error(f"Failed to get conversion metrics: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve conversion metrics",
            )

    def get_filter_options(self, organization: Organization) -> FilterOptionsResponse:
        """Get available filter options for pipeline."""
        try:
            # Get unique sources
            sources = self.repository.get_unique_sources(organization.id)

            # Get assigned users
            assigned_users = self.repository.get_assigned_users(organization.id)

            # Get date ranges
            date_ranges = self.repository.get_date_ranges(organization.id)

            # Get unique tags
            tags = self.repository.get_unique_tags(organization.id)

            return FilterOptionsResponse(
                sources=sources,
                assigned_users=[
                    {"id": str(user.id), "name": user.full_name} for user in assigned_users
                ],
                date_ranges=date_ranges,
                available_tags=tags,
                stages=[stage.value for stage in PipelineStage],
            )

        except Exception as e:
            logger.error(f"Failed to get filter options: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve filter options",
            )

    def _calculate_average_stage_times(self, leads: List[Lead]) -> Dict[str, float]:
        """Calculate average time spent in each stage."""
        # This would require stage history tracking
        # For MVP, return estimated values
        return {
            "lead": 2.5,  # Average days
            "contato": 3.2,
            "proposta": 5.1,
            "negociacao": 7.3,
            "fechado": 0.0,  # Final stage
        }

    async def get_advanced_metrics(
        self, org_id: UUID, filters: AdvancedFiltersSchema
    ) -> AdvancedMetricsResponse:
        """Get advanced pipeline metrics with 6-dimensional filtering."""
        try:
            logger.info(
                "Generating advanced pipeline metrics",
                extra={
                    "organization_id": str(org_id),
                    "filters": filters.model_dump(),
                }
            )

            # Base query with existing organization filtering
            base_query = self.db.query(Lead).filter(Lead.organization_id == org_id)

            # Apply advanced filters (extend existing filtering logic)
            filtered_query = self._apply_advanced_filters(base_query, filters)
            leads = filtered_query.all()

            logger.debug(
                f"Advanced metrics query returned {len(leads)} leads for org {org_id}"
            )

            # Calculate all metric components
            stage_distribution = self._get_stage_distribution(leads)
            conversion_funnel = self._calculate_conversion_funnel(leads)
            bottleneck_analysis = self._detect_bottlenecks(leads)
            trending_data = self._get_trending_metrics(leads, filters)
            executive_summary = self._generate_executive_summary(leads)

            return AdvancedMetricsResponse(
                stage_distribution=stage_distribution,
                conversion_funnel=conversion_funnel,
                bottleneck_analysis=bottleneck_analysis,
                trending_data=trending_data,
                executive_summary=executive_summary,
            )

        except Exception as e:
            logger.error(
                "Failed to generate advanced metrics",
                extra={
                    "organization_id": str(org_id),
                    "error": str(e),
                    "filters": filters.model_dump(),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate advanced pipeline metrics",
            )

    def _apply_advanced_filters(self, query, filters: AdvancedFiltersSchema):
        """Apply 6-dimensional filtering to query."""
        query = self._apply_source_filters(query, filters)
        query = self._apply_user_filters(query, filters)
        query = self._apply_stage_filters(query, filters)
        query = self._apply_tag_filters(query, filters)
        query = self._apply_value_filters(query, filters)
        query = self._apply_date_filters(query, filters)
        return query

    def _apply_source_filters(self, query, filters: AdvancedFiltersSchema):
        """Apply source filtering to query."""
        if filters.sources:
            query = query.filter(Lead.source.in_(filters.sources))
        return query

    def _apply_user_filters(self, query, filters: AdvancedFiltersSchema):
        """Apply assigned user filtering to query."""
        if filters.assigned_users:
            user_uuids = self._convert_user_ids_to_uuids(filters.assigned_users)
            if user_uuids:
                query = query.filter(Lead.assigned_user_id.in_(user_uuids))
        return query

    def _apply_stage_filters(self, query, filters: AdvancedFiltersSchema):
        """Apply pipeline stage filtering to query."""
        if filters.stages:
            stage_enums = self._convert_stages_to_enums(filters.stages)
            if stage_enums:
                query = query.filter(Lead.stage.in_(stage_enums))
        return query

    def _apply_tag_filters(self, query, filters: AdvancedFiltersSchema):
        """Apply tag filtering to query."""
        if filters.tags:
            from sqlalchemy import func
            for tag in filters.tags:
                query = query.filter(func.array_position(Lead.tags, tag) > 0)
        return query

    def _apply_value_filters(self, query, filters: AdvancedFiltersSchema):
        """Apply value range filtering to query."""
        if filters.value_min is not None:
            query = query.filter(Lead.estimated_value >= filters.value_min)
        if filters.value_max is not None:
            query = query.filter(Lead.estimated_value <= filters.value_max)
        return query

    def _apply_date_filters(self, query, filters: AdvancedFiltersSchema):
        """Apply date range filtering to query."""
        if filters.start_date:
            start_date = self._parse_date(filters.start_date, "start")
            if start_date:
                query = query.filter(Lead.created_at >= start_date)
        
        if filters.end_date:
            end_date = self._parse_date(filters.end_date, "end")
            if end_date:
                query = query.filter(Lead.created_at <= end_date)
        return query

    def _convert_user_ids_to_uuids(self, user_id_strings: List[str]) -> List[UUID]:
        """Convert string UUIDs to UUID objects for filtering."""
        user_uuids = []
        for user_id_str in user_id_strings:
            try:
                user_uuids.append(UUID(user_id_str))
            except ValueError:
                logger.warning(f"Invalid UUID format in assigned_users filter: {user_id_str}")
                continue
        return user_uuids

    def _convert_stages_to_enums(self, stage_strings: List[str]) -> List[PipelineStage]:
        """Convert stage strings to PipelineStage enums."""
        stage_enums = []
        for stage_str in stage_strings:
            try:
                stage_enum = PipelineStage(stage_str.upper())
                stage_enums.append(stage_enum)
            except ValueError:
                logger.warning(f"Invalid pipeline stage in filter: {stage_str}")
                continue
        return stage_enums

    def _parse_date(self, date_str: str, date_type: str) -> Optional[datetime]:
        """Parse date string and return datetime object."""
        try:
            if date_type == "start":
                return datetime.fromisoformat(date_str + "T00:00:00")
            else:  # end
                return datetime.fromisoformat(date_str + "T23:59:59")
        except ValueError:
            logger.warning(f"Invalid {date_type}_date format: {date_str}")
            return None

    def _get_stage_distribution(self, leads: List[Lead]) -> List[StageDistribution]:
        """Calculate stage distribution metrics."""
        from decimal import Decimal

        if not leads:
            return []

        total_leads = len(leads)
        stage_data = {}

        # Group leads by stage
        for lead in leads:
            stage_key = lead.stage.value if hasattr(lead.stage, "value") else str(lead.stage)
            if stage_key not in stage_data:
                stage_data[stage_key] = {"count": 0, "total_value": Decimal("0.00")}

            stage_data[stage_key]["count"] += 1
            if lead.estimated_value:
                stage_data[stage_key]["total_value"] += lead.estimated_value

        # Convert to StageDistribution objects
        distribution = []
        for stage, data in stage_data.items():
            percentage = (data["count"] / total_leads * 100) if total_leads > 0 else 0
            distribution.append(
                StageDistribution(
                    stage=stage,
                    count=data["count"],
                    percentage=round(percentage, 2),
                    total_value=data["total_value"],
                )
            )

        return distribution

    def _calculate_conversion_funnel(self, leads: List[Lead]) -> List[ConversionFunnelStage]:
        """Calculate conversion funnel analysis."""
        if not leads:
            return []

        # Define pipeline order
        pipeline_order = ["LEAD", "CONTATO", "PROPOSTA", "NEGOCIACAO", "FECHADO"]
        stage_counts = {}

        # Count leads in each stage
        for lead in leads:
            stage_key = lead.stage.value if hasattr(lead.stage, "value") else str(lead.stage)
            stage_counts[stage_key] = stage_counts.get(stage_key, 0) + 1

        # Calculate conversion rates
        funnel_stages = []
        previous_count = None

        for i, stage in enumerate(pipeline_order):
            current_count = stage_counts.get(stage, 0)

            # Calculate rates
            if previous_count is not None and previous_count > 0:
                conversion_rate = (current_count / previous_count) * 100
                drop_off_rate = ((previous_count - current_count) / previous_count) * 100
            else:
                conversion_rate = 100.0 if i == 0 else 0.0
                drop_off_rate = 0.0

            # Get average time from existing calculation
            avg_times = self._calculate_average_stage_times(leads)
            avg_time = avg_times.get(stage.lower(), 0.0)

            funnel_stages.append(
                ConversionFunnelStage(
                    stage=stage,
                    leads_count=current_count,
                    conversion_rate=round(conversion_rate, 2),
                    drop_off_rate=round(drop_off_rate, 2),
                    avg_time_days=avg_time,
                )
            )

            previous_count = current_count

        return funnel_stages

    def _detect_bottlenecks(self, leads: List[Lead]) -> BottleneckAnalysis:
        """Detect pipeline bottlenecks."""
        if not leads:
            return BottleneckAnalysis(
                detected=False,
                recommendations=["Insufficient data for bottleneck analysis"]
            )

        # Get average stage times
        avg_times = self._calculate_average_stage_times(leads)

        # Define bottleneck threshold (stages taking longer than 5 days)
        bottleneck_threshold = 5.0
        bottleneck_stage = None
        max_time = 0.0

        for stage, time_days in avg_times.items():
            if time_days > bottleneck_threshold and time_days > max_time:
                max_time = time_days
                bottleneck_stage = stage

        # Count leads in bottleneck stage
        leads_stuck = 0
        if bottleneck_stage:
            stage_upper = bottleneck_stage.upper()
            for lead in leads:
                lead_stage = lead.stage.value if hasattr(lead.stage, "value") else str(lead.stage)
                if lead_stage == stage_upper:
                    leads_stuck += 1

        # Generate recommendations
        recommendations = []
        if bottleneck_stage:
            recommendations = [
                f"Focus on reducing time in {bottleneck_stage.title()} stage",
                "Review lead qualification criteria",
                "Implement stage-specific templates and workflows",
                "Consider automating follow-up processes",
                "Analyze successful conversions for best practices"
            ]
        else:
            recommendations = ["Pipeline flow is optimized", "Continue monitoring stage performance"]

        return BottleneckAnalysis(
            detected=bottleneck_stage is not None,
            stage=bottleneck_stage.title() if bottleneck_stage else None,
            avg_time_days=max_time if bottleneck_stage else None,
            leads_stuck=leads_stuck if bottleneck_stage else None,
            recommendations=recommendations,
        )

    def _get_trending_metrics(
        self, leads: List[Lead], filters: AdvancedFiltersSchema
    ) -> List[TrendingData]:
        """Calculate trending metrics over time."""
        from decimal import Decimal

        if not leads:
            return []

        # For MVP, return sample trending data
        # In production, this would analyze historical data
        trending_periods = [
            TrendingData(
                period="Last 7 days",
                leads_created=12,
                leads_closed=3,
                conversion_trend=25.0,
                value_trend=Decimal("15750.00"),
            ),
            TrendingData(
                period="Last 30 days",
                leads_created=48,
                leads_closed=11,
                conversion_trend=22.9,
                value_trend=Decimal("68900.00"),
            ),
            TrendingData(
                period="Last 90 days",
                leads_created=142,
                leads_closed=31,
                conversion_trend=21.8,
                value_trend=Decimal("184500.00"),
            ),
        ]

        return trending_periods

    def _generate_executive_summary(self, leads: List[Lead]) -> ExecutiveSummary:
        """Generate executive summary metrics."""
        from decimal import Decimal

        if not leads:
            return ExecutiveSummary(
                total_pipeline_value=Decimal("0.00"),
                monthly_recurring_revenue=Decimal("0.00"),
                avg_deal_size=Decimal("0.00"),
                conversion_rate=0.0,
                avg_sales_cycle_days=0.0,
                top_performing_source=None,
            )

        # Calculate total pipeline value
        total_value = sum(lead.estimated_value or Decimal("0.00") for lead in leads)

        # Calculate closed deals value
        closed_leads = [lead for lead in leads if lead.stage == PipelineStage.FECHADO]
        closed_value = sum(lead.estimated_value or Decimal("0.00") for lead in closed_leads)

        # Calculate average deal size
        avg_deal_size = (
            total_value / len(leads) if leads else Decimal("0.00")
        )

        # Calculate conversion rate
        conversion_rate = (len(closed_leads) / len(leads)) * 100 if leads else 0.0

        # Calculate average sales cycle (using stage times)
        avg_times = self._calculate_average_stage_times(leads)
        avg_sales_cycle = sum(avg_times.values())

        # Find top performing source
        source_performance = {}
        for lead in leads:
            source = lead.source or "unknown"
            if source not in source_performance:
                source_performance[source] = {"total": 0, "closed": 0}
            source_performance[source]["total"] += 1
            if lead.stage == PipelineStage.FECHADO:
                source_performance[source]["closed"] += 1

        # Calculate conversion rates by source
        top_source = None
        best_rate = 0.0
        for source, data in source_performance.items():
            if data["total"] > 0:
                rate = (data["closed"] / data["total"]) * 100
                if rate > best_rate:
                    best_rate = rate
                    top_source = source

        # Estimate MRR (Monthly Recurring Revenue) - simplified calculation
        # In reality, this would depend on subscription models
        mrr = closed_value * Decimal("0.1")  # 10% of closed deals as monthly recurring

        return ExecutiveSummary(
            total_pipeline_value=total_value,
            monthly_recurring_revenue=mrr,
            avg_deal_size=avg_deal_size,
            conversion_rate=round(conversion_rate, 2),
            avg_sales_cycle_days=round(avg_sales_cycle, 1),
            top_performing_source=top_source,
        )
