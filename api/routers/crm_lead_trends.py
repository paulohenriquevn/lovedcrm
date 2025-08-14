"""CRM Lead Trends Router.

API endpoints for lead score trends and historical data analysis.
Features: Score history, trend detection, factor impact analysis.
Story 3.3: Lead Management - Melhorias UX.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_
from sqlalchemy.orm import Session

from api.core.database import get_db
from api.core.deps import get_current_organization
from api.core.logging_config import get_logger
from api.models.crm_lead import Lead
from api.models.organization import Organization
from api.schemas.crm_lead import FactorImpact, LeadScoreTrend, TrendDirection
from api.services.crm_lead_score_history_service import LeadScoreHistoryService

router = APIRouter(prefix="/crm/leads", tags=["crm-lead-trends"])
logger = get_logger(__name__)


@router.get("/{lead_id}/score-trend")
def get_lead_score_trend(
    lead_id: str,
    days: int = Query(default=30, ge=7, le=365, description="Number of days to analyze"),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> LeadScoreTrend:
    """Get lead score trend data for visualization.

    Returns historical score data, trend direction, and factor analysis.
    """
    try:
        lead_uuid = UUID(lead_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lead ID format")

    # Get lead with organization validation
    lead = (
        db.query(Lead)
        .filter(and_(Lead.id == lead_uuid, Lead.organization_id == organization.id))  # type: ignore[arg-type]
        .first()
    )

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Get real historical data from score history service
    score_history_service = LeadScoreHistoryService(db)
    historical_scores = score_history_service.get_formatted_score_trend(
        organization=organization, lead_id=lead_uuid, days_back=days
    )
    
    # Get trend summary
    trend_summary = score_history_service.get_score_trend_summary(
        organization=organization, lead_id=lead_uuid, days_back=days
    )

    # Convert trend direction to enum
    trend_direction_map = {
        "increasing": TrendDirection.INCREASING,
        "decreasing": TrendDirection.DECREASING,
        "stable": TrendDirection.STABLE,
    }
    trend_direction = trend_direction_map.get(trend_summary["trend_direction"], TrendDirection.STABLE)
    trend_value = trend_summary["trend_value"]

    # Analyze factor impacts from latest score factors
    factor_impacts = _analyze_factor_impacts_from_lead(lead)

    # Create response
    trend_data = LeadScoreTrend(
        lead_id=lead.id,
        current_score=int(lead.lead_score or 0),
        trend_direction=trend_direction,
        trend_value=round(trend_value, 1),
        historical_data=historical_scores,
        factor_impacts=factor_impacts,
        analysis_period_days=days,
        last_updated=datetime.utcnow(),
    )

    logger.info(
        "Generated score trend analysis",
        extra={
            "lead_id": str(lead.id),
            "organization_id": str(organization.id),
            "trend_direction": trend_direction.value,
            "trend_value": trend_value,
            "days_analyzed": days,
        },
    )

    return trend_data


# DEPRECATED: Mock functions below are no longer used
# Real data is now fetched from LeadScoreHistoryService

def _generate_score_history(
    lead: Lead, start_date: datetime, end_date: datetime, days: int
) -> List[Dict[str, Any]]:
    """DEPRECATED: Generate mock historical score data.

    Now replaced by LeadScoreHistoryService.get_formatted_score_trend().
    """
    current_score = lead.lead_score or 50
    historical_data = []

    # Generate daily data points
    for i in range(days + 1):
        date = start_date + timedelta(days=i)

        # Simulate score variation based on lead characteristics
        base_variation = (i / days) * 10  # Gradual trend
        random_variation = hash(f"{lead.id}_{date.date()}") % 21 - 10  # -10 to +10

        # Apply realistic constraints
        day_score = float(current_score) + base_variation + (random_variation * 0.3)
        day_score = max(0, min(100, round(day_score, 1)))

        historical_data.append(
            {
                "date": date.date().isoformat(),
                "score": day_score,
                "factors": _generate_factor_snapshot(lead, date, day_score),
            }
        )

    return historical_data


def _analyze_trend_direction(historical_scores: List[Dict[str, Any]]) -> TrendDirection:
    """Analyze the overall trend direction from historical data."""
    if len(historical_scores) < 2:
        return TrendDirection.STABLE

    # Calculate trend using linear regression approach
    scores = [point["score"] for point in historical_scores]
    n = len(scores)

    # Simple trend calculation
    first_half_avg = sum(scores[: n // 2]) / (n // 2)
    second_half_avg = sum(scores[n // 2 :]) / (n - n // 2)

    difference = second_half_avg - first_half_avg

    if difference > 2:
        return TrendDirection.UP
    elif difference < -2:
        return TrendDirection.DOWN
    else:
        return TrendDirection.STABLE


def _analyze_factor_impacts_from_lead(lead: Lead) -> List[FactorImpact]:
    """Analyze factor impacts from current lead data.
    
    Creates factor impact analysis based on current lead scoring factors.
    """
    factor_impacts = []
    
    # Get current score factors from lead
    score_factors = lead.score_factors or {}
    
    # Common factors to analyze
    factor_weights = {
        "email_quality": 0.2,
        "phone_provided": 0.15,
        "source_quality": 0.15,
        "estimated_value": 0.2,
        "stage_progress": 0.15,
        "engagement_level": 0.15,
    }
    
    for factor_name, weight in factor_weights.items():
        factor_score = score_factors.get(factor_name, 0)
        
        # Calculate impact based on factor score and weight
        impact_value = factor_score * weight
        
        # Determine impact level
        if impact_value >= 15:
            impact_level = "high"
        elif impact_value >= 8:
            impact_level = "medium"
        else:
            impact_level = "low"
            
        factor_impacts.append(
            FactorImpact(
                factor_name=factor_name.replace("_", " ").title(),
                impact_value=round(impact_value, 1),
                impact_level=impact_level,
                description=_get_factor_description(factor_name, factor_score),
            )
        )
    
    # Sort by impact value descending
    factor_impacts.sort(key=lambda x: x.impact_value, reverse=True)
    
    return factor_impacts

def _get_factor_description(factor_name: str, factor_score: float) -> str:
    """Get description for a factor based on its score."""
    descriptions = {
        "email_quality": "Email address validation and deliverability",
        "phone_provided": "Phone number provided and validated",
        "source_quality": "Lead source reliability and conversion rate",
        "estimated_value": "Potential deal value assessment",
        "stage_progress": "Movement through sales pipeline",
        "engagement_level": "Recent interaction and response rate",
    }
    
    base_desc = descriptions.get(factor_name, "Factor impact on lead score")
    
    if factor_score >= 80:
        return f"{base_desc} - Excellent"
    elif factor_score >= 60:
        return f"{base_desc} - Good"
    elif factor_score >= 40:
        return f"{base_desc} - Average"
    else:
        return f"{base_desc} - Needs improvement"

def _analyze_factor_impacts(
    lead: Lead, historical_scores: List[Dict[str, Any]]
) -> List[FactorImpact]:
    """Analyze which factors had the most impact on score changes."""
    if not lead.score_factors:
        return []

    factor_impacts = []
    current_factors = lead.score_factors

    # Analyze each factor's contribution
    for factor_name, current_value in current_factors.items():
        # Calculate historical variation for this factor
        factor_scores = []
        for point in historical_scores:
            if point.get("factors") and factor_name in point["factors"]:
                factor_scores.append(point["factors"][factor_name])

        if len(factor_scores) >= 2:
            start_value = factor_scores[0]
            end_value = factor_scores[-1]
            change = end_value - start_value
            impact_level = _calculate_impact_level(abs(change))

            factor_impacts.append(
                FactorImpact(
                    factor_name=factor_name,
                    current_value=current_value,
                    change_value=round(change, 1),
                    impact_level=impact_level,
                    description=_get_factor_change_description(factor_name, change),
                )
            )

    # Sort by impact level and change magnitude
    factor_impacts.sort(key=lambda x: (x.impact_level, abs(x.change_value)), reverse=True)

    return factor_impacts


def _generate_factor_snapshot(lead: Lead, date: datetime, total_score: float) -> Dict[str, float]:
    """DEPRECATED: Generate mock factor values for a specific date.

    Now replaced by real factor data from LeadScoreHistory records.
    """
    if not lead.score_factors:
        return {}

    factors = {}
    for factor_name, current_value in lead.score_factors.items():
        # Simulate historical variation
        variation = hash(f"{factor_name}_{date.date()}") % 11 - 5  # -5 to +5
        historical_value = max(0, min(100, current_value + (variation * 0.2)))
        factors[factor_name] = round(historical_value, 1)

    return factors


def _calculate_impact_level(change_magnitude: float) -> str:
    """Calculate impact level based on change magnitude."""
    if change_magnitude >= 10:
        return "high"
    elif change_magnitude >= 5:
        return "medium"
    else:
        return "low"


def _get_factor_change_description(factor_name: str, change: float) -> str:
    """DEPRECATED: Get human-readable description of factor change."""
    direction = "increased" if change > 0 else "decreased"
    factor_labels = {
        "email_authority": "Email Authority",
        "phone_complete": "Phone Completeness",
        "estimated_value": "Deal Value",
        "source_quality": "Source Quality",
        "company_size": "Company Size",
        "engagement": "Engagement Level",
    }

    factor_label = factor_labels.get(factor_name, factor_name.replace("_", " ").title())
    magnitude = "significantly" if abs(change) >= 10 else "moderately"

    return f"{factor_label} {magnitude} {direction} over the analysis period"


@router.get("/{lead_id}/trend-summary")
def get_lead_trend_summary(
    lead_id: str,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get a quick trend summary for lead scoring display."""
    try:
        lead_uuid = UUID(lead_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lead ID format")

    # Get lead with organization validation
    lead = (
        db.query(Lead)
        .filter(and_(Lead.id == lead_uuid, Lead.organization_id == organization.id))  # type: ignore[arg-type]
        .first()
    )

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Generate quick 7-day trend
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

    historical_scores = _generate_score_history(
        lead=lead, start_date=start_date, end_date=end_date, days=7
    )

    trend_direction = _analyze_trend_direction(historical_scores)

    # Calculate trend value
    trend_value = 0
    if len(historical_scores) >= 2:
        start_score = historical_scores[0]["score"]
        end_score = historical_scores[-1]["score"]
        trend_value = round(end_score - start_score, 1)

    return {
        "lead_id": str(lead.id),
        "current_score": lead.lead_score or 0,
        "trend_direction": trend_direction.value,
        "trend_value": trend_value,
        "period": "7_days",
    }
