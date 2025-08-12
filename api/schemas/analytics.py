"""Analytics Pydantic Schemas.

Data validation models for analytics API endpoints with organization context,
comprehensive type validation, and business logic constraints for the
Story 3.2 Lead Analytics & Advanced Insights system.

Integration Points:
- Executive dashboard data structures
- Behavioral insights and segmentation models
- Performance alerts with actionable recommendations
- Report generation request/response models
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, validator

# ============================================================================
# ENUMS FOR ANALYTICS TYPES
# ============================================================================


class AnalyticsTimeframe(str, Enum):
    """Supported timeframes for analytics queries."""

    LAST_7_DAYS = "last_7_days"
    LAST_30_DAYS = "last_30_days"
    LAST_90_DAYS = "last_90_days"
    CURRENT_MONTH = "current_month"
    LAST_MONTH = "last_month"
    CURRENT_QUARTER = "current_quarter"
    CUSTOM = "custom"


class BehavioralSegment(str, Enum):
    """Lead behavioral segmentation types."""

    CHAMPION = "champion"
    PROMISING = "promising"
    QUALIFIED_UNENGAGED = "qualified_unengaged"
    COLD = "cold"
    STANDARD = "standard"


class AlertPriority(str, Enum):
    """Performance alert priority levels."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AlertType(str, Enum):
    """Types of performance alerts."""

    CONVERSION_DROP = "conversion_drop"
    OPPORTUNITY = "opportunity"
    DATA_QUALITY = "data_quality"
    VELOCITY_ISSUE = "velocity_issue"


# ============================================================================
# BASE ANALYTICS SCHEMAS
# ============================================================================


class AnalyticsRequest(BaseModel):
    """Base request model for analytics endpoints."""

    model_config = ConfigDict(from_attributes=True)

    timeframe: AnalyticsTimeframe = Field(default=AnalyticsTimeframe.LAST_30_DAYS)
    start_date: Optional[datetime] = Field(default=None)
    end_date: Optional[datetime] = Field(default=None)
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator("end_date")
    def validate_date_range(cls, v, values):
        """Validate that end_date is after start_date when both are provided."""
        start_date = values.get("start_date")
        if start_date and v and v <= start_date:
            raise ValueError("end_date must be after start_date")
        return v

    @validator("filters")
    def validate_filters(cls, v):
        """Validate filter structure and values."""
        if not v:
            return {}

        allowed_filters = {
            "source",
            "score_min",
            "score_max",
            "assigned_user_id",
            "stage",
            "estimated_value_min",
            "estimated_value_max",
        }

        for key in v.keys():
            if key not in allowed_filters:
                raise ValueError(f"Invalid filter key: {key}")

        # Validate score ranges
        if "score_min" in v and (v["score_min"] < 0 or v["score_min"] > 100):
            raise ValueError("score_min must be between 0 and 100")
        if "score_max" in v and (v["score_max"] < 0 or v["score_max"] > 100):
            raise ValueError("score_max must be between 0 and 100")

        return v


# ============================================================================
# SUMMARY METRICS SCHEMAS
# ============================================================================


class SummaryMetrics(BaseModel):
    """Executive summary metrics for dashboard."""

    model_config = ConfigDict(from_attributes=True)

    total_leads: int = Field(ge=0)
    leads_growth_percentage: float
    average_score: float = Field(ge=0, le=100)
    score_trend: float
    conversion_rate: float = Field(ge=0, le=100)
    period: Dict[str, str]


class ScoreDistribution(BaseModel):
    """Lead score distribution breakdown."""

    model_config = ConfigDict(from_attributes=True)

    score_0_25: int = Field(ge=0, alias="0-25")
    score_26_50: int = Field(ge=0, alias="26-50")
    score_51_75: int = Field(ge=0, alias="51-75")
    score_76_100: int = Field(ge=0, alias="76-100")
    unscored: int = Field(ge=0)


# ============================================================================
# CONVERSION FUNNEL SCHEMAS
# ============================================================================


class StageData(BaseModel):
    """Individual stage data within conversion funnel."""

    model_config = ConfigDict(from_attributes=True)

    count: int = Field(ge=0)
    avg_score: float = Field(ge=0, le=100)
    median_score: float = Field(ge=0, le=100)
    avg_days: float = Field(ge=0)
    conversion_rate: float = Field(ge=0, le=100)
    estimated_value: float = Field(ge=0)
    high_score_leads: int = Field(ge=0)
    low_score_leads: int = Field(ge=0)
    score_quality: str


class ScoreCorrelation(BaseModel):
    """Score correlation analysis within funnel."""

    model_config = ConfigDict(from_attributes=True)

    high_score_conversion: float = Field(ge=0, le=100)
    quality_insights: List[str]


class ConversionFunnel(BaseModel):
    """Complete conversion funnel analysis."""

    model_config = ConfigDict(from_attributes=True)

    stages: Dict[str, StageData]
    overall_conversion_rate: float = Field(ge=0, le=100)
    total_leads_in_funnel: int = Field(ge=0)
    closed_leads: int = Field(ge=0)
    total_pipeline_value: float = Field(ge=0)
    bottleneck_stage: Optional[str] = None
    funnel_health: str
    score_correlation: ScoreCorrelation


# ============================================================================
# SOURCE PERFORMANCE SCHEMAS
# ============================================================================


class SourcePerformanceData(BaseModel):
    """Performance metrics for individual lead source."""

    model_config = ConfigDict(from_attributes=True)

    source: str
    total_leads: int = Field(ge=0)
    won_leads: int = Field(ge=0)
    conversion_rate: float = Field(ge=0, le=100)
    close_rate: float = Field(ge=0, le=100)
    win_rate: float = Field(ge=0, le=100)
    avg_score: float = Field(ge=0, le=100)
    avg_cycle_days: float = Field(ge=0)
    roi_percentage: float
    total_value: float = Field(ge=0)
    quality_rating: str


# ============================================================================
# BEHAVIORAL INSIGHTS SCHEMAS
# ============================================================================


class SegmentData(BaseModel):
    """Behavioral segment analysis data."""

    model_config = ConfigDict(from_attributes=True)

    count: int = Field(ge=0)
    avg_score: float = Field(ge=0, le=100)
    avg_engagement: float = Field(ge=0, le=100)
    avg_days_since_interaction: float = Field(ge=0)
    closed_count: int = Field(ge=0)
    conversion_rate: float = Field(ge=0, le=100)
    recommended_actions: List[str]


class BehaviorInsights(BaseModel):
    """Complete behavioral insights analysis."""

    model_config = ConfigDict(from_attributes=True)

    segments: Dict[BehavioralSegment, SegmentData]
    total_leads_analyzed: int = Field(ge=0)
    high_priority_count: int = Field(ge=0)
    reactivation_needed: int = Field(ge=0)
    insights: List[str]


# ============================================================================
# STAGE TIMING SCHEMAS
# ============================================================================


class StageTimingData(BaseModel):
    """Stage timing analysis for individual stage."""

    model_config = ConfigDict(from_attributes=True)

    avg_days: float = Field(ge=0)
    median_days: float = Field(ge=0)
    min_days: float = Field(ge=0)
    max_days: float = Field(ge=0)
    transition_count: int = Field(ge=0)
    velocity_rating: str


class StageTiming(BaseModel):
    """Complete stage timing analysis."""

    model_config = ConfigDict(from_attributes=True)

    stage_timing: Dict[str, StageTimingData]
    total_pipeline_days: float = Field(ge=0)
    velocity_health: str
    bottleneck_stage: Optional[str] = None


# ============================================================================
# PERFORMANCE ALERTS SCHEMAS
# ============================================================================


class AlertData(BaseModel):
    """Data payload for performance alert."""

    model_config = ConfigDict(from_attributes=True)

    recent_rate: Optional[float] = None
    historical_rate: Optional[float] = None
    drop_percentage: Optional[float] = None
    revenue_at_risk: Optional[float] = None
    count: Optional[int] = None
    total_value: Optional[float] = None


class PerformanceAlert(BaseModel):
    """Individual performance alert with recommendations."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    type: AlertType
    priority: AlertPriority
    title: str
    description: str
    impact: str
    recommended_actions: List[str]
    data: AlertData
    created_at: str


# ============================================================================
# EXECUTIVE DASHBOARD RESPONSE
# ============================================================================


class ExecutiveDashboard(BaseModel):
    """Complete executive dashboard response."""

    model_config = ConfigDict(from_attributes=True)

    summary_metrics: SummaryMetrics
    conversion_funnel: ConversionFunnel
    score_distribution: ScoreDistribution
    source_performance: List[SourcePerformanceData]
    stage_timing: StageTiming
    behavior_insights: BehaviorInsights
    alerts: List[PerformanceAlert]
    organization_id: str
    generated_at: str


# ============================================================================
# REPORT GENERATION SCHEMAS
# ============================================================================


class ReportFormat(str, Enum):
    """Supported report output formats."""

    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"


class ReportRequest(BaseModel):
    """Report generation request."""

    model_config = ConfigDict(from_attributes=True)

    format: ReportFormat
    timeframe: AnalyticsTimeframe = Field(default=AnalyticsTimeframe.LAST_30_DAYS)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    include_charts: bool = Field(default=True)
    organization_branding: bool = Field(default=True)

    @validator("end_date")
    def validate_report_date_range(cls, v, values):
        """Validate report date range."""
        start_date = values.get("start_date")
        if start_date and v and v <= start_date:
            raise ValueError("end_date must be after start_date")
        return v


class ReportStatus(BaseModel):
    """Background report generation status."""

    model_config = ConfigDict(from_attributes=True)

    report_id: str
    status: str  # 'pending', 'processing', 'completed', 'failed'
    progress_percentage: int = Field(ge=0, le=100)
    download_url: Optional[str] = None
    error_message: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    created_at: datetime


# ============================================================================
# FILTER AND CONFIGURATION SCHEMAS
# ============================================================================


class DashboardFilters(BaseModel):
    """Advanced dashboard filters."""

    model_config = ConfigDict(from_attributes=True)

    source: Optional[List[str]] = None
    score_range: Optional[Dict[str, int]] = None  # {"min": 0, "max": 100}
    assigned_user_id: Optional[str] = None
    stage: Optional[List[str]] = None
    value_range: Optional[Dict[str, float]] = None  # {"min": 0, "max": 100000}
    behavioral_segment: Optional[List[BehavioralSegment]] = None
    days_stagnant: Optional[int] = None

    @validator("score_range")
    def validate_score_range(cls, v):
        """Validate score range values."""
        if v:
            if "min" in v and (v["min"] < 0 or v["min"] > 100):
                raise ValueError("score min must be between 0 and 100")
            if "max" in v and (v["max"] < 0 or v["max"] > 100):
                raise ValueError("score max must be between 0 and 100")
            if "min" in v and "max" in v and v["min"] > v["max"]:
                raise ValueError("score min must be <= score max")
        return v


class AnalyticsConfiguration(BaseModel):
    """Analytics dashboard configuration settings."""

    model_config = ConfigDict(from_attributes=True)

    refresh_interval_minutes: int = Field(default=5, ge=1, le=60)
    default_timeframe: AnalyticsTimeframe = Field(default=AnalyticsTimeframe.LAST_30_DAYS)
    show_alerts: bool = Field(default=True)
    alert_threshold_days: int = Field(default=3, ge=1, le=30)
    enable_real_time_updates: bool = Field(default=True)
    dashboard_layout: Optional[Dict[str, Any]] = None


# ============================================================================
# ERROR RESPONSES
# ============================================================================


class AnalyticsError(BaseModel):
    """Analytics API error response."""

    model_config = ConfigDict(from_attributes=True)

    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    organization_id: Optional[str] = None
    timestamp: datetime
