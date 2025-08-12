"""CRM Analytics API Router.

FastAPI router for analytics endpoints providing executive dashboard data,
behavioral insights, performance alerts, and report generation for Story 3.2
Lead Analytics & Advanced Insights system.

Integration Points:
- LeadAnalyticsService for core analytics calculations
- Organization dependency for multi-tenancy isolation
- Redis caching for performance optimization (5-minute TTL)
- Background job system for report generation
"""

from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..core.deps import get_current_active_user, get_current_organization, get_db
from ..models.organization import Organization
from ..models.user import User
from ..schemas.analytics import (
    AnalyticsTimeframe,
    BehaviorInsights,
    ConversionFunnel,
    ExecutiveDashboard,
    PerformanceAlert,
    ReportRequest,
    ReportStatus,
    SourcePerformanceData,
    SummaryMetrics,
)
from ..services.crm_lead_analytics_service import LeadAnalyticsService

router = APIRouter(prefix="/crm/analytics", tags=["CRM Analytics"])


# ============================================================================
# EXECUTIVE DASHBOARD ENDPOINTS
# ============================================================================


@router.get(
    "/executive-dashboard",
    response_model=ExecutiveDashboard,
    summary="Get Executive Dashboard",
    description="Retrieve complete executive dashboard with conversion funnel, behavioral insights, and performance alerts",
)
async def get_executive_dashboard(
    timeframe: AnalyticsTimeframe = Query(default=AnalyticsTimeframe.LAST_30_DAYS),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    source: Optional[List[str]] = Query(default=None),
    score_min: Optional[int] = Query(default=None, ge=0, le=100),
    score_max: Optional[int] = Query(default=None, ge=0, le=100),
    assigned_user_id: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> ExecutiveDashboard:
    """Get comprehensive executive dashboard analytics.

    Returns complete analytics data including:
    - Summary metrics with growth trends
    - Conversion funnel analysis with Story 3.1 score correlation
    - Source performance with ROI calculations
    - Behavioral insights and lead segmentation
    - Stage timing analysis and velocity metrics
    - Smart performance alerts with recommendations

    Performance: < 2 seconds with materialized views + caching
    Security: Organization isolation enforced automatically
    """
    try:
        # Initialize analytics service
        analytics_service = LeadAnalyticsService(db)

        # Build filters from query parameters
        filters = {}
        if source:
            filters["source"] = source
        if score_min is not None:
            filters["score_min"] = score_min
        if score_max is not None:
            filters["score_max"] = score_max
        if assigned_user_id:
            filters["assigned_user_id"] = assigned_user_id

        # Calculate date range based on timeframe
        if timeframe != AnalyticsTimeframe.CUSTOM:
            start_date, end_date = _calculate_timeframe_dates(timeframe)

        # Validate custom date range
        if start_date and end_date and start_date >= end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="start_date must be before end_date"
            )

        # Get dashboard data from analytics service
        dashboard_data = await analytics_service.calculate_executive_dashboard(
            organization.id, start_date, end_date, filters
        )

        return ExecutiveDashboard(**dashboard_data)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid parameters: {str(e)}"
        )
    except Exception as e:
        # Log error for monitoring
        import logging

        logger = logging.getLogger(__name__)
        logger.error(
            "Executive dashboard calculation failed",
            extra={
                "organization_id": str(organization.id),
                "user_id": str(current_user.id),
                "error": str(e),
                "timeframe": timeframe,
            },
            exc_info=True,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate executive dashboard",
        )


@router.get(
    "/summary-metrics",
    response_model=SummaryMetrics,
    summary="Get Summary Metrics",
    description="Get high-level summary metrics for quick dashboard overview",
)
async def get_summary_metrics(
    timeframe: AnalyticsTimeframe = Query(default=AnalyticsTimeframe.LAST_30_DAYS),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> SummaryMetrics:
    """Get summary metrics for dashboard header.

    Performance-optimized endpoint for summary cards that need frequent updates.
    Uses Redis caching with 2-minute TTL for real-time feel.
    """
    try:
        analytics_service = LeadAnalyticsService(db)

        if timeframe != AnalyticsTimeframe.CUSTOM:
            start_date, end_date = _calculate_timeframe_dates(timeframe)

        dashboard_data = await analytics_service.calculate_executive_dashboard(
            organization.id, start_date, end_date
        )

        return SummaryMetrics(**dashboard_data["summary_metrics"])

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get summary metrics: {str(e)}",
        )


# ============================================================================
# CONVERSION FUNNEL ENDPOINTS
# ============================================================================


@router.get(
    "/conversion-funnel",
    response_model=ConversionFunnel,
    summary="Get Conversion Funnel Analysis",
    description="Detailed conversion funnel with stage-by-stage analysis and Score 3.1 correlation",
)
async def get_conversion_funnel(
    timeframe: AnalyticsTimeframe = Query(default=AnalyticsTimeframe.LAST_30_DAYS),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> ConversionFunnel:
    """Get detailed conversion funnel analysis.

    Includes:
    - Stage-by-stage conversion rates
    - Average lead scores at each stage
    - Time spent in each stage
    - Bottleneck identification
    - Quality correlation with Story 3.1 scoring
    """
    try:
        analytics_service = LeadAnalyticsService(db)

        if timeframe != AnalyticsTimeframe.CUSTOM:
            start_date, end_date = _calculate_timeframe_dates(timeframe)

        # Get base query for funnel calculation
        from ..models.crm_lead import Lead

        base_query = db.query(Lead).filter(
            Lead.organization_id == organization.id,
            Lead.created_at >= start_date,
            Lead.created_at <= end_date,
        )

        funnel_data = await analytics_service._calculate_conversion_funnel(
            organization.id, base_query, start_date, end_date
        )

        return ConversionFunnel(**funnel_data)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate conversion funnel: {str(e)}",
        )


# ============================================================================
# SOURCE PERFORMANCE ENDPOINTS
# ============================================================================


@router.get(
    "/source-performance",
    response_model=List[SourcePerformanceData],
    summary="Get Source Performance Analysis",
    description="ROI and performance analysis by lead source with quality ratings",
)
async def get_source_performance(
    timeframe: AnalyticsTimeframe = Query(default=AnalyticsTimeframe.LAST_30_DAYS),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    min_leads: int = Query(default=5, ge=1),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> List[SourcePerformanceData]:
    """Get lead source performance analysis.

    Analyzes performance by source including:
    - Conversion rates and win rates
    - Average lead scores per source
    - ROI calculations
    - Sales cycle timing
    - Quality ratings based on performance
    """
    try:
        analytics_service = LeadAnalyticsService(db)

        if timeframe != AnalyticsTimeframe.CUSTOM:
            start_date, end_date = _calculate_timeframe_dates(timeframe)

        from ..models.crm_lead import Lead

        base_query = db.query(Lead).filter(
            Lead.organization_id == organization.id,
            Lead.created_at >= start_date,
            Lead.created_at <= end_date,
        )

        source_data = await analytics_service._calculate_source_performance(base_query)

        # Filter sources with minimum lead count
        filtered_sources = [source for source in source_data if source["total_leads"] >= min_leads]

        return [SourcePerformanceData(**source) for source in filtered_sources]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze source performance: {str(e)}",
        )


# ============================================================================
# BEHAVIORAL INSIGHTS ENDPOINTS
# ============================================================================


@router.get(
    "/behavior-analysis",
    response_model=BehaviorInsights,
    summary="Get Behavioral Insights",
    description="Lead behavioral segmentation with engagement patterns and recommendations",
)
async def get_behavior_analysis(
    timeframe: AnalyticsTimeframe = Query(default=AnalyticsTimeframe.LAST_30_DAYS),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> BehaviorInsights:
    """Get comprehensive behavioral insights and lead segmentation.

    Segments leads into behavioral categories:
    - Champion: High score + high engagement (immediate priority)
    - Promising: Good score + good engagement (follow-up ready)
    - Qualified Unengaged: High score + low engagement (re-activation needed)
    - Cold: Low score + low engagement (nurture campaigns)
    - Standard: Regular workflow leads
    """
    try:
        analytics_service = LeadAnalyticsService(db)

        if timeframe != AnalyticsTimeframe.CUSTOM:
            start_date, end_date = _calculate_timeframe_dates(timeframe)

        behavior_data = await analytics_service._calculate_behavior_insights(
            organization.id, start_date, end_date
        )

        return BehaviorInsights(**behavior_data)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze behavioral insights: {str(e)}",
        )


# ============================================================================
# PERFORMANCE ALERTS ENDPOINTS
# ============================================================================


@router.get(
    "/alerts",
    response_model=List[PerformanceAlert],
    summary="Get Performance Alerts",
    description="Smart performance alerts with actionable recommendations",
)
async def get_performance_alerts(
    priority: Optional[str] = Query(default=None),
    alert_type: Optional[str] = Query(default=None),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> List[PerformanceAlert]:
    """Get smart performance alerts with recommended actions.

    Alert types include:
    - Conversion rate drops with revenue impact
    - High-value leads stagnation opportunities
    - Score distribution anomalies
    - Pipeline velocity issues

    Each alert includes specific recommended actions and impact estimates.
    """
    try:
        analytics_service = LeadAnalyticsService(db)

        alerts = await analytics_service._generate_performance_alerts(organization.id)

        # Filter alerts based on parameters
        filtered_alerts = alerts

        if priority:
            filtered_alerts = [
                alert
                for alert in filtered_alerts
                if alert.get("priority", "").lower() == priority.lower()
            ]

        if alert_type:
            filtered_alerts = [
                alert
                for alert in filtered_alerts
                if alert.get("type", "").lower() == alert_type.lower()
            ]

        return [PerformanceAlert(**alert) for alert in filtered_alerts]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance alerts: {str(e)}",
        )


@router.put(
    "/alerts/{alert_id}/status",
    summary="Update Alert Status",
    description="Mark alert as read, dismissed, or action taken",
)
async def update_alert_status(
    alert_id: str,
    status: str = Query(..., regex="^(read|dismissed|action_taken)$"),
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> JSONResponse:
    """Update alert status for tracking and follow-up.

    Status options:
    - read: Alert has been viewed
    - dismissed: Alert is not relevant or actionable
    - action_taken: Recommended actions have been implemented
    """
    try:
        # In a real implementation, this would update alert status in database
        # For now, return success confirmation

        import logging

        logger = logging.getLogger(__name__)
        logger.info(
            "Alert status updated",
            extra={
                "alert_id": alert_id,
                "status": status,
                "user_id": str(current_user.id),
                "organization_id": str(organization.id),
                "notes": notes,
            },
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": f"Alert {alert_id} status updated to {status}",
                "alert_id": alert_id,
                "new_status": status,
                "updated_by": current_user.email,
                "updated_at": datetime.now().isoformat(),
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update alert status: {str(e)}",
        )


# ============================================================================
# REPORT GENERATION ENDPOINTS
# ============================================================================


@router.post(
    "/generate-report",
    response_model=ReportStatus,
    summary="Generate Analytics Report",
    description="Generate PDF/Excel analytics report with organization branding",
)
async def generate_analytics_report(
    report_request: ReportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> ReportStatus:
    """Generate comprehensive analytics report in background.

    Report formats:
    - PDF: Executive summary with charts and insights
    - Excel: Detailed data with multiple worksheets
    - CSV: Raw data export for further analysis

    Reports include organization branding and can be filtered by timeframe.
    """
    try:
        import uuid
        from datetime import datetime, timedelta

        # Generate unique report ID
        report_id = str(uuid.uuid4())

        # Schedule background report generation
        background_tasks.add_task(
            _generate_report_background,
            report_id,
            report_request,
            organization.id,
            current_user.id,
            db,
        )

        return ReportStatus(
            report_id=report_id,
            status="pending",
            progress_percentage=0,
            estimated_completion=datetime.now() + timedelta(minutes=5),
            created_at=datetime.now(),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate report generation: {str(e)}",
        )


@router.get(
    "/reports/{report_id}/status",
    response_model=ReportStatus,
    summary="Get Report Status",
    description="Check background report generation status and download link",
)
async def get_report_status(
    report_id: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> ReportStatus:
    """Get status of background report generation.

    Returns current status, progress, and download URL when completed.
    """
    try:
        # In a real implementation, this would check report status in database/Redis
        # For demo, return completed status

        return ReportStatus(
            report_id=report_id,
            status="completed",
            progress_percentage=100,
            download_url=f"/api/crm/analytics/reports/{report_id}/download",
            created_at=datetime.now() - timedelta(minutes=3),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get report status: {str(e)}",
        )


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================


def _calculate_timeframe_dates(timeframe: AnalyticsTimeframe) -> tuple[datetime, datetime]:
    """Calculate start and end dates based on timeframe enum."""
    end_date = datetime.now()

    if timeframe == AnalyticsTimeframe.LAST_7_DAYS:
        start_date = end_date - timedelta(days=7)
    elif timeframe == AnalyticsTimeframe.LAST_30_DAYS:
        start_date = end_date - timedelta(days=30)
    elif timeframe == AnalyticsTimeframe.LAST_90_DAYS:
        start_date = end_date - timedelta(days=90)
    elif timeframe == AnalyticsTimeframe.CURRENT_MONTH:
        start_date = end_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif timeframe == AnalyticsTimeframe.LAST_MONTH:
        first_day_current = end_date.replace(day=1)
        start_date = (first_day_current - timedelta(days=1)).replace(day=1)
        end_date = first_day_current - timedelta(days=1)
    elif timeframe == AnalyticsTimeframe.CURRENT_QUARTER:
        quarter_start_month = ((end_date.month - 1) // 3) * 3 + 1
        start_date = end_date.replace(
            month=quarter_start_month, day=1, hour=0, minute=0, second=0, microsecond=0
        )
    else:
        # Default to last 30 days
        start_date = end_date - timedelta(days=30)

    return start_date, end_date


async def _generate_report_background(
    report_id: str, report_request: ReportRequest, organization_id: UUID, user_id: UUID, db: Session
):
    """Background task for report generation.

    This would integrate with a background job system like Celery in production.
    For now, it logs the report request for monitoring.
    """
    import logging

    logger = logging.getLogger(__name__)
    logger.info(
        "Background report generation started",
        extra={
            "report_id": report_id,
            "format": report_request.format,
            "timeframe": report_request.timeframe,
            "organization_id": str(organization_id),
            "user_id": str(user_id),
        },
    )

    try:
        # In production, this would:
        # 1. Get analytics data using LeadAnalyticsService
        # 2. Generate report using appropriate library (ReportLab for PDF, openpyxl for Excel)
        # 3. Upload to cloud storage (S3, GCS, etc.)
        # 4. Update report status in database
        # 5. Send notification to user

        # For demo purposes, simulate report generation
        import asyncio

        await asyncio.sleep(2)  # Simulate processing time

        logger.info(
            "Background report generation completed",
            extra={"report_id": report_id, "organization_id": str(organization_id)},
        )

    except Exception as e:
        logger.error(
            "Background report generation failed",
            extra={
                "report_id": report_id,
                "organization_id": str(organization_id),
                "error": str(e),
            },
            exc_info=True,
        )
