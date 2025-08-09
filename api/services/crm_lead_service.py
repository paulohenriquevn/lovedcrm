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
    ConversionMetricsResponse,
    FilterOptionsResponse,
    LeadCreate,
    LeadFavoriteToggle,
    LeadListResponse,
    LeadResponse,
    LeadStageUpdate,
    LeadUpdate,
    PipelineStatsResponse,
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
                    logger.debug(
                        f"Successfully broadcasted lead_created event to org {organization.id}"
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
                "stage": stage_data.stage.value
                if hasattr(stage_data.stage, "value")
                else stage_data.stage,
                "previous_stage": lead.stage.value if hasattr(lead.stage, "value") else lead.stage,
                "estimated_value": str(lead.estimated_value) if lead.estimated_value else None,
                "organization_id": str(organization.id),
                "notes": stage_data.notes,
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
                logger.debug(
                    f"Successfully broadcasted lead_stage_changed event to org {organization.id}"
                )
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
