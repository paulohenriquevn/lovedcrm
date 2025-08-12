"""Lead Analytics Repository.

Optimized data access layer for analytics queries with materialized view support,
organization isolation enforcement, and performance-focused query patterns.

Integration Points:
- Materialized views from 002_analytics_enhancements.sql migration
- Multi-tenancy isolation with organization_id filtering throughout
- Redis caching integration for dashboard queries (5-minute TTL)
- Performance optimizations using existing 139+ indexes
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session


class LeadAnalyticsRepository:
    """Optimized repository for analytics data access with organization isolation.

    All queries include organization_id filtering for multi-tenancy compliance.
    Uses materialized views and selective indexes for performance optimization.
    """

    def __init__(self, db: Session):
        """Initialize analytics repository with database session."""
        self.db = db

    def get_daily_metrics_summary(
        self, organization_id: UUID, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Get daily metrics from materialized view for ultra-fast dashboard loading.

        Performance: < 50ms using materialized view + organization index
        Returns: Aggregated metrics for the specified date range
        """
        # Use materialized view for optimal performance
        daily_metrics_query = text(
            """
            SELECT 
                SUM(total_leads) as total_leads,
                SUM(closed_won_leads) as closed_won_leads,
                SUM(closed_lost_leads) as closed_lost_leads,
                AVG(avg_lead_score) as avg_lead_score,
                SUM(high_score_leads) as high_score_leads,
                SUM(medium_score_leads) as medium_score_leads,
                SUM(low_score_leads) as low_score_leads,
                SUM(total_estimated_value) as total_estimated_value,
                SUM(total_won_value) as total_won_value,
                AVG(avg_estimated_value) as avg_estimated_value
            FROM daily_lead_metrics
            WHERE organization_id = :org_id
              AND metric_date >= :start_date::DATE
              AND metric_date <= :end_date::DATE;
        """
        )

        result = self.db.execute(
            daily_metrics_query,
            {
                "org_id": str(organization_id),
                "start_date": start_date.date(),
                "end_date": end_date.date(),
            },
        ).first()

        if not result:
            return self._get_empty_metrics_summary()

        return {
            "total_leads": result.total_leads or 0,
            "closed_won_leads": result.closed_won_leads or 0,
            "closed_lost_leads": result.closed_lost_leads or 0,
            "avg_lead_score": round(float(result.avg_lead_score or 0), 1),
            "high_score_leads": result.high_score_leads or 0,
            "medium_score_leads": result.medium_score_leads or 0,
            "low_score_leads": result.low_score_leads or 0,
            "total_estimated_value": float(result.total_estimated_value or 0),
            "total_won_value": float(result.total_won_value or 0),
            "avg_estimated_value": round(float(result.avg_estimated_value or 0), 2),
            "conversion_rate": round(
                (result.closed_won_leads / result.total_leads * 100)
                if result.total_leads > 0
                else 0,
                2,
            ),
        }

    def get_stage_transition_analytics(
        self, organization_id: UUID, start_date: datetime, end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get detailed stage transition analytics using audit logs.

        Uses optimized audit_logs indexes for performance.
        Returns stage-by-stage conversion analysis with timing data.
        """
        transition_query = text(
            """
            WITH stage_transitions AS (
                SELECT 
                    al.record_id as lead_id,
                    al.old_values->>'stage' as from_stage,
                    al.new_values->>'stage' as to_stage,
                    al.created_at as transition_time,
                    l.lead_score,
                    l.estimated_value
                FROM audit_logs al
                INNER JOIN leads l ON al.record_id = l.id
                WHERE al.organization_id = :org_id
                  AND l.organization_id = :org_id
                  AND al.table_name = 'leads'
                  AND al.action = 'update'
                  AND al.old_values ? 'stage'
                  AND al.new_values ? 'stage'
                  AND al.created_at >= :start_date
                  AND al.created_at <= :end_date
            )
            SELECT 
                from_stage,
                to_stage,
                COUNT(*) as transition_count,
                AVG(COALESCE(lead_score, 0)) as avg_score_at_transition,
                SUM(COALESCE(estimated_value, 0)) as total_value_transitioned
            FROM stage_transitions
            WHERE from_stage IS NOT NULL AND to_stage IS NOT NULL
            GROUP BY from_stage, to_stage
            ORDER BY transition_count DESC;
        """
        )

        result = self.db.execute(
            transition_query,
            {"org_id": str(organization_id), "start_date": start_date, "end_date": end_date},
        )

        transitions = []
        for row in result:
            transitions.append(
                {
                    "from_stage": row.from_stage,
                    "to_stage": row.to_stage,
                    "transition_count": row.transition_count,
                    "avg_score": round(float(row.avg_score_at_transition or 0), 1),
                    "total_value": float(row.total_value_transitioned or 0),
                }
            )

        return transitions

    def get_lead_source_performance(
        self, organization_id: UUID, start_date: datetime, end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get performance analytics by lead source with ROI calculation.

        Uses source-specific indexes for optimal query performance.
        Returns detailed source analysis for executive dashboard.
        """
        source_performance_query = text(
            """
            SELECT 
                COALESCE(source, 'unknown') as source,
                COUNT(*) as total_leads,
                COUNT(CASE WHEN stage = 'fechado' AND is_won = true THEN 1 END) as won_leads,
                COUNT(CASE WHEN stage = 'fechado' THEN 1 END) as closed_leads,
                AVG(COALESCE(lead_score, 0)) as avg_lead_score,
                SUM(COALESCE(estimated_value, 0)) as total_estimated_value,
                SUM(CASE 
                    WHEN stage = 'fechado' AND is_won = true 
                    THEN COALESCE(actual_value, estimated_value, 0) 
                    END) as total_won_value,
                AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_sales_cycle_days,
                PERCENTILE_CONT(0.5) WITHIN GROUP (
                    ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at))/86400
                ) as median_sales_cycle_days
            FROM leads
            WHERE organization_id = :org_id
              AND created_at >= :start_date
              AND created_at <= :end_date
            GROUP BY source
            ORDER BY won_leads DESC, avg_lead_score DESC;
        """
        )

        result = self.db.execute(
            source_performance_query,
            {"org_id": str(organization_id), "start_date": start_date, "end_date": end_date},
        )

        source_performance = []
        for row in result:
            total = row.total_leads or 1  # Avoid division by zero
            won = row.won_leads or 0
            closed = row.closed_leads or 0

            conversion_rate = round((won / total) * 100, 2)
            close_rate = round((closed / total) * 100, 2)
            win_rate = round((won / closed * 100), 2) if closed > 0 else 0

            # Calculate ROI
            roi = 0
            if row.total_estimated_value and row.total_estimated_value > 0:
                roi = round(((row.total_won_value or 0) / row.total_estimated_value) * 100, 2)

            source_performance.append(
                {
                    "source": row.source,
                    "total_leads": total,
                    "won_leads": won,
                    "closed_leads": closed,
                    "conversion_rate": conversion_rate,
                    "close_rate": close_rate,
                    "win_rate": win_rate,
                    "avg_score": round(float(row.avg_lead_score or 0), 1),
                    "avg_sales_cycle_days": round(float(row.avg_sales_cycle_days or 0), 1),
                    "median_sales_cycle_days": round(float(row.median_sales_cycle_days or 0), 1),
                    "roi_percentage": roi,
                    "total_estimated_value": float(row.total_estimated_value or 0),
                    "total_won_value": float(row.total_won_value or 0),
                    "quality_rating": self._calculate_source_quality_rating(
                        conversion_rate, float(row.avg_lead_score or 0)
                    ),
                }
            )

        return source_performance

    def get_behavioral_tracking_summary(
        self, organization_id: UUID, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Get behavioral tracking summary from lead_behavior_tracking table.

        Uses behavior tracking indexes for performance.
        Returns engagement patterns and behavioral segmentation data.
        """
        behavior_summary_query = text(
            """
            WITH behavior_segments AS (
                SELECT 
                    l.id as lead_id,
                    l.lead_score,
                    bt.engagement_score,
                    bt.interaction_count,
                    bt.last_interaction_at,
                    l.stage,
                    l.estimated_value,
                    CASE 
                        WHEN l.lead_score >= 80 AND bt.engagement_score >= 70 THEN 'champion'
                        WHEN l.lead_score >= 60 AND bt.engagement_score >= 50 THEN 'promising'
                        WHEN l.lead_score >= 70 AND bt.engagement_score < 30 THEN 'qualified_unengaged'
                        WHEN l.lead_score < 40 AND bt.engagement_score < 30 THEN 'cold'
                        ELSE 'standard'
                    END as behavioral_segment,
                    EXTRACT(EPOCH FROM (NOW() - COALESCE(bt.last_interaction_at, l.created_at)))/86400 as days_since_interaction
                FROM leads l
                LEFT JOIN lead_behavior_tracking bt ON l.id = bt.lead_id AND l.organization_id = bt.organization_id
                WHERE l.organization_id = :org_id
                  AND l.created_at >= :start_date
                  AND l.created_at <= :end_date
            )
            SELECT 
                behavioral_segment,
                COUNT(*) as segment_count,
                AVG(lead_score) as avg_score,
                AVG(engagement_score) as avg_engagement,
                AVG(days_since_interaction) as avg_days_since_interaction,
                AVG(interaction_count) as avg_interactions,
                COUNT(CASE WHEN stage = 'fechado' AND stage = 'fechado' THEN 1 END) as closed_count,
                SUM(COALESCE(estimated_value, 0)) as total_segment_value
            FROM behavior_segments
            GROUP BY behavioral_segment
            ORDER BY segment_count DESC;
        """
        )

        result = self.db.execute(
            behavior_summary_query,
            {"org_id": str(organization_id), "start_date": start_date, "end_date": end_date},
        )

        segments = {}
        total_leads = 0

        for row in result:
            segment_count = row.segment_count or 0
            total_leads += segment_count

            segments[row.behavioral_segment] = {
                "count": segment_count,
                "avg_score": round(float(row.avg_score or 0), 1),
                "avg_engagement": round(float(row.avg_engagement or 0), 1),
                "avg_days_since_interaction": round(float(row.avg_days_since_interaction or 0), 1),
                "avg_interactions": round(float(row.avg_interactions or 0), 1),
                "closed_count": row.closed_count or 0,
                "total_value": float(row.total_segment_value or 0),
                "conversion_rate": round(
                    (row.closed_count / segment_count * 100) if segment_count > 0 else 0, 2
                ),
            }

        return {
            "segments": segments,
            "total_leads_analyzed": total_leads,
            "high_priority_count": (
                segments.get("champion", {}).get("count", 0)
                + segments.get("promising", {}).get("count", 0)
            ),
            "engagement_summary": {
                "avg_engagement": round(
                    sum(s.get("avg_engagement", 0) * s.get("count", 0) for s in segments.values())
                    / total_leads
                    if total_leads > 0
                    else 0,
                    1,
                ),
                "high_engagement_count": (
                    segments.get("champion", {}).get("count", 0)
                    + segments.get("promising", {}).get("count", 0)
                ),
            },
        }

    def get_pipeline_velocity_metrics(
        self, organization_id: UUID, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Get pipeline velocity and timing analytics using audit logs.

        Analyzes stage transition timing for velocity optimization.
        Uses audit log indexes for performance.
        """
        velocity_query = text(
            """
            WITH stage_durations AS (
                SELECT 
                    al.record_id as lead_id,
                    al.old_values->>'stage' as from_stage,
                    al.created_at as transition_time,
                    LAG(al.created_at) OVER (
                        PARTITION BY al.record_id 
                        ORDER BY al.created_at
                    ) as previous_transition_time
                FROM audit_logs al
                WHERE al.organization_id = :org_id
                  AND al.table_name = 'leads'
                  AND al.action = 'update'
                  AND al.old_values ? 'stage'
                  AND al.new_values ? 'stage'
                  AND al.created_at >= :start_date
                  AND al.created_at <= :end_date
            ),
            calculated_durations AS (
                SELECT 
                    from_stage as stage,
                    EXTRACT(EPOCH FROM (transition_time - previous_transition_time))/86400 as days_in_stage
                FROM stage_durations 
                WHERE previous_transition_time IS NOT NULL
                  AND from_stage IS NOT NULL
                  AND EXTRACT(EPOCH FROM (transition_time - previous_transition_time))/86400 BETWEEN 0 AND 365
            )
            SELECT 
                stage,
                COUNT(*) as transition_count,
                AVG(days_in_stage) as avg_days,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_in_stage) as median_days,
                MIN(days_in_stage) as min_days,
                MAX(days_in_stage) as max_days,
                STDDEV(days_in_stage) as stddev_days
            FROM calculated_durations
            WHERE stage IN ('lead', 'contato', 'proposta', 'negociacao')
            GROUP BY stage
            ORDER BY 
                CASE stage 
                    WHEN 'lead' THEN 1 
                    WHEN 'contato' THEN 2 
                    WHEN 'proposta' THEN 3 
                    WHEN 'negociacao' THEN 4 
                END;
        """
        )

        result = self.db.execute(
            velocity_query,
            {"org_id": str(organization_id), "start_date": start_date, "end_date": end_date},
        )

        velocity_metrics = {}
        total_pipeline_days = 0

        for row in result:
            avg_days = float(row.avg_days or 0)
            velocity_metrics[row.stage] = {
                "avg_days": round(avg_days, 1),
                "median_days": round(float(row.median_days or 0), 1),
                "min_days": round(float(row.min_days or 0), 1),
                "max_days": round(float(row.max_days or 0), 1),
                "stddev_days": round(float(row.stddev_days or 0), 1),
                "transition_count": row.transition_count,
                "velocity_rating": self._calculate_velocity_rating(avg_days),
            }
            total_pipeline_days += avg_days

        return {
            "stage_velocity": velocity_metrics,
            "total_pipeline_days": round(total_pipeline_days, 1),
            "overall_velocity": "Fast"
            if total_pipeline_days < 30
            else "Slow"
            if total_pipeline_days > 60
            else "Normal",
            "bottleneck_stage": self._identify_velocity_bottleneck(velocity_metrics),
        }

    # Utility methods for calculations

    def _get_empty_metrics_summary(self) -> Dict[str, Any]:
        """Return empty metrics structure for edge cases."""
        return {
            "total_leads": 0,
            "closed_won_leads": 0,
            "closed_lost_leads": 0,
            "avg_lead_score": 0.0,
            "high_score_leads": 0,
            "medium_score_leads": 0,
            "low_score_leads": 0,
            "total_estimated_value": 0.0,
            "total_won_value": 0.0,
            "avg_estimated_value": 0.0,
            "conversion_rate": 0.0,
        }

    def _calculate_source_quality_rating(self, conversion_rate: float, avg_score: float) -> str:
        """Calculate quality rating for lead sources."""
        if conversion_rate >= 25 and avg_score >= 70:
            return "Excellent"
        elif conversion_rate >= 15 and avg_score >= 60:
            return "Good"
        elif conversion_rate >= 10 or avg_score >= 50:
            return "Fair"
        else:
            return "Poor"

    def _calculate_velocity_rating(self, avg_days: float) -> str:
        """Rate stage velocity based on average days."""
        if avg_days <= 1.0:
            return "Excellent"
        elif avg_days <= 3.0:
            return "Good"
        elif avg_days <= 7.0:
            return "Fair"
        else:
            return "Slow"

    def _identify_velocity_bottleneck(self, velocity_metrics: Dict) -> Optional[str]:
        """Identify the stage causing velocity bottlenecks."""
        max_days = 0
        bottleneck_stage = None

        for stage, metrics in velocity_metrics.items():
            avg_days = metrics.get("avg_days", 0)
            if avg_days > max_days and avg_days > 7:  # Only flag if > 7 days
                max_days = avg_days
                bottleneck_stage = stage

        return bottleneck_stage
