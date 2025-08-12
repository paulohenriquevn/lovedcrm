"""CRM Lead Assignment Service.

Intelligent lead assignment with multiple strategies and workload balancing.
Supports organization-scoped assignments with performance tracking.
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session

from ..models.crm_lead import Lead, PipelineStage
from ..models.organization import Organization, OrganizationMember
from ..models.user import User


class AssignmentStrategy(str, Enum):
    """Available assignment strategies."""

    ROUND_ROBIN = "round_robin"
    WORKLOAD_BALANCED = "workload_balanced"
    SCORE_BASED = "score_based"


class LeadAssignmentService:
    """Intelligent lead assignment service with organization isolation.

    Features:
    - Round-robin distribution for equal opportunity
    - Workload-balanced assignment based on active leads
    - Score-based assignment matching high-value leads to top performers
    - Performance tracking and analytics
    """

    def __init__(self, db: Session):
        """Initialize assignment service."""
        self.db = db

    async def assign_leads_batch(
        self,
        organization: Organization,
        lead_ids: List[UUID],
        strategy: AssignmentStrategy = AssignmentStrategy.WORKLOAD_BALANCED,
        user_ids: Optional[List[UUID]] = None,
    ) -> Dict:
        """Assign multiple leads using specified strategy.

        Args:
            organization: Organization context
            lead_ids: List of lead UUIDs to assign
            strategy: Assignment strategy to use
            user_ids: Optional specific users to assign to (if None, uses all active team)

        Returns:
            Assignment results with statistics
        """
        # Get available team members
        team_members = await self._get_available_team_members(organization, user_ids)

        if not team_members:
            raise HTTPException(status_code=400, detail="No available team members for assignment")

        # Get unassigned leads only (with organization isolation)
        leads = (
            self.db.query(Lead)
            .filter(
                and_(
                    Lead.id.in_(lead_ids),
                    Lead.organization_id == organization.id,
                    Lead.assigned_user_id.is_(None),
                )
            )
            .all()
        )

        if not leads:
            raise HTTPException(status_code=400, detail="No unassigned leads found for assignment")

        # Execute assignment strategy
        assignments = []

        if strategy == AssignmentStrategy.ROUND_ROBIN:
            assignments = await self._assign_round_robin(leads, team_members)
        elif strategy == AssignmentStrategy.WORKLOAD_BALANCED:
            assignments = await self._assign_workload_balanced(leads, team_members, organization)
        elif strategy == AssignmentStrategy.SCORE_BASED:
            assignments = await self._assign_score_based(leads, team_members, organization)

        # Apply assignments to database
        assignment_results = []
        for assignment in assignments:
            lead = next(
                lead_item for lead_item in leads if str(lead_item.id) == assignment["lead_id"]
            )
            lead.assigned_user_id = UUID(assignment["user_id"])

            # Add assignment metadata
            assignment_meta = {
                "assignment_timestamp": datetime.now().isoformat(),
                "assignment_strategy": strategy.value,
                "assignment_reason": assignment["reason"],
                "assigned_by": "system",  # Could be current user
            }

            lead.lead_metadata = {
                **(lead.lead_metadata or {}),
                "assignment_history": (
                    lead.lead_metadata.get("assignment_history", []) + [assignment_meta]
                ),
            }

            assignment_results.append(
                {
                    "lead_id": assignment["lead_id"],
                    "lead_name": assignment["lead_name"],
                    "user_id": assignment["user_id"],
                    "user_name": assignment["user_name"],
                    "reason": assignment["reason"],
                    "lead_score": float(lead.lead_score) if lead.lead_score else 0,
                }
            )

        self.db.commit()

        return {
            "success": True,
            "total_assigned": len(assignments),
            "assignments": assignment_results,
            "strategy_used": strategy.value,
            "organization_id": str(organization.id),
            "assigned_at": datetime.now().isoformat(),
        }

    async def _get_available_team_members(
        self, organization: Organization, user_ids: Optional[List[UUID]] = None
    ) -> List[User]:
        """Get available team members for assignment with proper organization filtering."""
        # Query active users who are members of the organization
        query = (
            self.db.query(User)
            .join(OrganizationMember, User.id == OrganizationMember.user_id)
            .filter(
                and_(
                    User.is_active == True,
                    OrganizationMember.organization_id == organization.id,
                    OrganizationMember.is_active == True,
                )
            )
        )

        # Filter by specific users if provided
        if user_ids:
            query = query.filter(User.id.in_(user_ids))

        team_members = query.all()

        return team_members

    async def _assign_round_robin(self, leads: List[Lead], team_members: List[User]) -> List[Dict]:
        """Round-robin assignment for equal distribution."""
        assignments = []

        # Sort leads by creation date for consistent assignment order
        sorted_leads = sorted(leads, key=lambda lead_item: lead_item.created_at)

        for i, lead in enumerate(sorted_leads):
            # Cycle through team members
            member_index = i % len(team_members)
            selected_member = team_members[member_index]

            assignments.append(
                {
                    "lead_id": str(lead.id),
                    "lead_name": lead.name,
                    "user_id": str(selected_member.id),
                    "user_name": selected_member.full_name or selected_member.email,
                    "reason": f"Round-robin assignment (position {member_index + 1})",
                }
            )

        return assignments

    async def _assign_workload_balanced(
        self, leads: List[Lead], team_members: List[User], organization: Organization
    ) -> List[Dict]:
        """Workload-balanced assignment based on active leads."""
        # Get current workload for each team member
        workloads = {}
        for member in team_members:
            active_count = (
                self.db.query(Lead)
                .filter(
                    and_(
                        Lead.organization_id == organization.id,
                        Lead.assigned_user_id == member.id,
                        Lead.stage.in_(
                            [
                                PipelineStage.LEAD,
                                PipelineStage.CONTATO,
                                PipelineStage.PROPOSTA,
                                PipelineStage.NEGOCIACAO,
                            ]
                        ),  # Active stages (not closed)
                    )
                )
                .count()
            )

            workloads[str(member.id)] = {
                "user": member,
                "active_leads": active_count,
                "performance_score": await self._get_performance_score(member, organization),
            }

        assignments = []

        # Sort leads by score (high score first for better distribution)
        sorted_leads = sorted(
            leads, key=lambda lead_item: float(lead_item.lead_score or 0), reverse=True
        )

        for lead in sorted_leads:
            # Find member with lowest workload (considering performance)
            best_member_id = min(
                workloads.keys(),
                key=lambda uid: (
                    workloads[uid]["active_leads"],
                    -workloads[uid]["performance_score"],  # Prefer better performers in ties
                ),
            )

            best_member = workloads[best_member_id]["user"]
            current_workload = workloads[best_member_id]["active_leads"]

            assignments.append(
                {
                    "lead_id": str(lead.id),
                    "lead_name": lead.name,
                    "user_id": str(best_member.id),
                    "user_name": best_member.full_name or best_member.email,
                    "reason": f"Workload balanced ({current_workload} active leads)",
                }
            )

            # Update workload counter for next iteration
            workloads[best_member_id]["active_leads"] += 1

        return assignments

    async def _assign_score_based(
        self, leads: List[Lead], team_members: List[User], organization: Organization
    ) -> List[Dict]:
        """Score-based assignment - high-value leads to top performers."""
        # Get performance data for team members
        performance_data = {}
        for member in team_members:
            performance = await self._get_performance_score(member, organization)
            performance_data[str(member.id)] = {"user": member, "performance_score": performance}

        # Sort members by performance (best first)
        sorted_members = sorted(
            performance_data.values(), key=lambda m: m["performance_score"], reverse=True
        )

        # Sort leads by score (high first)
        sorted_leads = sorted(
            leads, key=lambda lead_item: float(lead_item.lead_score or 0), reverse=True
        )

        assignments = []

        # Assign high-score leads to top performers with rotation
        for i, lead in enumerate(sorted_leads):
            # Rotate through top performers
            member_index = i % len(sorted_members)
            selected_member = sorted_members[member_index]["user"]
            performance = sorted_members[member_index]["performance_score"]

            assignments.append(
                {
                    "lead_id": str(lead.id),
                    "lead_name": lead.name,
                    "user_id": str(selected_member.id),
                    "user_name": selected_member.full_name or selected_member.email,
                    "reason": f"Score-based: Lead {float(lead.lead_score or 0):.0f} pts → Top performer ({performance:.1%} conversion)",
                }
            )

        return assignments

    async def _get_performance_score(self, user: User, organization: Organization) -> float:
        """Calculate user performance based on recent conversions."""
        # Look at last 90 days of performance
        ninety_days_ago = datetime.now() - timedelta(days=90)

        # Count closed/won deals
        closed_deals = (
            self.db.query(Lead)
            .filter(
                and_(
                    Lead.organization_id == organization.id,
                    Lead.assigned_user_id == user.id,
                    Lead.stage == PipelineStage.FECHADO,
                    Lead.updated_at >= ninety_days_ago,
                )
            )
            .count()
        )

        # Count total assigned leads in the period
        total_assigned = (
            self.db.query(Lead)
            .filter(
                and_(
                    Lead.organization_id == organization.id,
                    Lead.assigned_user_id == user.id,
                    Lead.created_at >= ninety_days_ago,
                )
            )
            .count()
        )

        if total_assigned == 0:
            return 0.5  # Neutral score for new team members

        return closed_deals / total_assigned

    async def get_assignment_analytics(
        self, organization: Organization, days_back: int = 30
    ) -> Dict:
        """Get assignment analytics and performance metrics.

        Args:
            organization: Organization context
            days_back: Number of days to analyze

        Returns:
            Analytics data with team performance and workload distribution
        """
        cutoff_date = datetime.now() - timedelta(days=days_back)

        # Get all active team members with assignments
        team_data = []

        # Get organization team members using proper join
        users = (
            self.db.query(User)
            .join(OrganizationMember, User.id == OrganizationMember.user_id)
            .filter(
                and_(
                    User.is_active == True,
                    OrganizationMember.organization_id == organization.id,
                    OrganizationMember.is_active == True,
                )
            )
            .all()
        )

        for user in users:
            # Current active workload
            active_leads = (
                self.db.query(Lead)
                .filter(
                    and_(
                        Lead.organization_id == organization.id,
                        Lead.assigned_user_id == user.id,
                        Lead.stage.in_(
                            [
                                PipelineStage.LEAD,
                                PipelineStage.CONTATO,
                                PipelineStage.PROPOSTA,
                                PipelineStage.NEGOCIACAO,
                            ]
                        ),
                    )
                )
                .count()
            )

            # Recent assignments
            recent_assignments = (
                self.db.query(Lead)
                .filter(
                    and_(
                        Lead.organization_id == organization.id,
                        Lead.assigned_user_id == user.id,
                        Lead.created_at >= cutoff_date,
                    )
                )
                .count()
            )

            # Recent conversions
            recent_conversions = (
                self.db.query(Lead)
                .filter(
                    and_(
                        Lead.organization_id == organization.id,
                        Lead.assigned_user_id == user.id,
                        Lead.stage == PipelineStage.FECHADO,
                        Lead.updated_at >= cutoff_date,
                    )
                )
                .count()
            )

            # Performance metrics
            conversion_rate = (
                recent_conversions / recent_assignments if recent_assignments > 0 else 0
            )

            team_data.append(
                {
                    "user_id": str(user.id),
                    "user_name": user.full_name or user.email,
                    "active_leads": active_leads,
                    "recent_assignments": recent_assignments,
                    "recent_conversions": recent_conversions,
                    "conversion_rate": round(conversion_rate, 3),
                    "performance_score": await self._get_performance_score(user, organization),
                }
            )

        # Overall statistics
        total_active_leads = sum(member["active_leads"] for member in team_data)
        total_recent_assignments = sum(member["recent_assignments"] for member in team_data)
        total_recent_conversions = sum(member["recent_conversions"] for member in team_data)

        avg_conversion_rate = (
            total_recent_conversions / total_recent_assignments
            if total_recent_assignments > 0
            else 0
        )

        return {
            "organization_id": str(organization.id),
            "analysis_period_days": days_back,
            "team_performance": team_data,
            "summary": {
                "total_team_members": len(team_data),
                "total_active_leads": total_active_leads,
                "total_recent_assignments": total_recent_assignments,
                "total_recent_conversions": total_recent_conversions,
                "average_conversion_rate": round(avg_conversion_rate, 3),
                "workload_distribution": {
                    "min_active_leads": min((m["active_leads"] for m in team_data), default=0),
                    "max_active_leads": max((m["active_leads"] for m in team_data), default=0),
                    "avg_active_leads": round(total_active_leads / len(team_data), 1)
                    if team_data
                    else 0,
                },
            },
            "generated_at": datetime.now().isoformat(),
        }
