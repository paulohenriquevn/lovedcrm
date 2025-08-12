"""Unit tests for LeadAnalyticsRepository.

Test suite validating optimized analytics queries, materialized view usage,
organization isolation, and performance characteristics.

Test Coverage:
- Materialized view query optimization
- Organization isolation in all queries
- SQL query structure and parameters
- Performance benchmark compliance
- Edge cases and data validation
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from uuid import uuid4

from api.repositories.lead_analytics_repository import LeadAnalyticsRepository


@pytest.fixture
def mock_db_session():
    """Mock database session for testing."""
    return Mock()


@pytest.fixture
def analytics_repo(mock_db_session):
    """Initialize analytics repository with mock database."""
    return LeadAnalyticsRepository(mock_db_session)


@pytest.fixture
def organization_id():
    """Test organization UUID."""
    return uuid4()


@pytest.fixture
def date_range():
    """Test date range for analytics queries."""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    return start_date, end_date


class TestLeadAnalyticsRepository:
    """Test suite for LeadAnalyticsRepository class."""

    def test_init_assigns_database_session(self, mock_db_session):
        """Test repository initialization correctly assigns database session."""
        repo = LeadAnalyticsRepository(mock_db_session)
        assert repo.db == mock_db_session

    def test_get_daily_metrics_summary_uses_materialized_view(
        self, analytics_repo, organization_id, date_range, mock_db_session
    ):
        """Test that daily metrics query uses materialized view for performance."""
        start_date, end_date = date_range
        
        # Mock materialized view query result
        mock_result = Mock()
        mock_result.total_leads = 150
        mock_result.closed_won_leads = 25
        mock_result.closed_lost_leads = 8
        mock_result.avg_lead_score = 74.2
        mock_result.high_score_leads = 45
        mock_result.medium_score_leads = 78
        mock_result.low_score_leads = 27
        mock_result.total_estimated_value = 750000.0
        mock_result.total_won_value = 180000.0
        mock_result.avg_estimated_value = 5000.0

        mock_db_session.execute.return_value.first.return_value = mock_result

        result = analytics_repo.get_daily_metrics_summary(organization_id, start_date, end_date)

        # Verify materialized view was queried
        mock_db_session.execute.assert_called_once()
        sql_call = mock_db_session.execute.call_args[0][0]
        
        # Check that query uses materialized view
        assert "daily_lead_metrics" in str(sql_call)
        assert "organization_id = :org_id" in str(sql_call)
        
        # Verify organization parameter binding
        params = mock_db_session.execute.call_args[1]
        assert params["org_id"] == str(organization_id)
        assert params["start_date"] == start_date.date()
        assert params["end_date"] == end_date.date()

        # Verify result structure and calculations
        assert result["total_leads"] == 150
        assert result["closed_won_leads"] == 25
        assert result["avg_lead_score"] == 74.2
        assert result["conversion_rate"] == round((25 / 150 * 100), 2)

    def test_get_daily_metrics_summary_handles_empty_results(
        self, analytics_repo, organization_id, date_range, mock_db_session
    ):
        """Test daily metrics handles empty results gracefully."""
        start_date, end_date = date_range
        
        # Mock empty result
        mock_db_session.execute.return_value.first.return_value = None

        result = analytics_repo.get_daily_metrics_summary(organization_id, start_date, end_date)

        # Verify empty metrics structure is returned
        expected_empty = analytics_repo._get_empty_metrics_summary()
        assert result == expected_empty
        assert result["total_leads"] == 0
        assert result["conversion_rate"] == 0.0

    def test_get_stage_transition_analytics_uses_audit_logs(
        self, analytics_repo, organization_id, date_range, mock_db_session
    ):
        """Test stage transition analytics uses audit logs with proper joins."""
        start_date, end_date = date_range
        
        # Mock audit log query results
        mock_transitions = [
            Mock(
                from_stage="lead",
                to_stage="contato",
                transition_count=45,
                avg_score_at_transition=72.5,
                total_value_transitioned=225000.0
            ),
            Mock(
                from_stage="contato", 
                to_stage="proposta",
                transition_count=32,
                avg_score_at_transition=78.2,
                total_value_transitioned=180000.0
            )
        ]
        
        mock_db_session.execute.return_value.__iter__ = Mock(return_value=iter(mock_transitions))

        result = analytics_repo.get_stage_transition_analytics(organization_id, start_date, end_date)

        # Verify audit logs query structure
        mock_db_session.execute.assert_called_once()
        sql_call = mock_db_session.execute.call_args[0][0]
        
        # Check query uses audit logs and proper joins
        assert "audit_logs al" in str(sql_call)
        assert "INNER JOIN leads l" in str(sql_call)
        assert "al.organization_id = :org_id" in str(sql_call)
        assert "l.organization_id = :org_id" in str(sql_call)
        assert "table_name = 'leads'" in str(sql_call)

        # Verify result structure
        assert isinstance(result, list)
        assert len(result) == 2
        
        first_transition = result[0]
        assert first_transition["from_stage"] == "lead"
        assert first_transition["to_stage"] == "contato"
        assert first_transition["transition_count"] == 45
        assert first_transition["avg_score"] == 72.5

    def test_get_lead_source_performance_calculates_roi(
        self, analytics_repo, organization_id, date_range, mock_db_session
    ):
        """Test source performance calculation includes ROI and quality rating."""
        start_date, end_date = date_range
        
        # Mock source performance data
        mock_sources = [
            Mock(
                source="linkedin",
                total_leads=50,
                won_leads=15,
                closed_leads=18,
                avg_lead_score=78.5,
                total_estimated_value=250000.0,
                total_won_value=190000.0,
                avg_sales_cycle_days=25.5,
                median_sales_cycle_days=22.0
            ),
            Mock(
                source="google_ads",
                total_leads=75,
                won_leads=8,
                closed_leads=12,
                avg_lead_score=62.1,
                total_estimated_value=180000.0,
                total_won_value=85000.0,
                avg_sales_cycle_days=32.8,
                median_sales_cycle_days=28.5
            )
        ]
        
        mock_db_session.execute.return_value.__iter__ = Mock(return_value=iter(mock_sources))

        result = analytics_repo.get_lead_source_performance(organization_id, start_date, end_date)

        # Verify source performance query structure
        mock_db_session.execute.assert_called_once()
        sql_call = mock_db_session.execute.call_args[0][0]
        
        assert "organization_id = :org_id" in str(sql_call)
        assert "COALESCE(source, 'unknown')" in str(sql_call)
        assert "ORDER BY won_leads DESC" in str(sql_call)

        # Verify calculations and structure
        assert isinstance(result, list)
        assert len(result) == 2

        linkedin_source = result[0]
        assert linkedin_source["source"] == "linkedin"
        assert linkedin_source["conversion_rate"] == 30.0  # 15/50 * 100
        assert linkedin_source["win_rate"] == round((15/18*100), 2)  # 83.33
        assert linkedin_source["roi_percentage"] == round((190000/250000*100), 2)  # 76.0
        assert linkedin_source["quality_rating"] == "Excellent"  # 30% conv + 78.5 score

    def test_get_behavioral_tracking_summary_segments_leads(
        self, analytics_repo, organization_id, date_range, mock_db_session
    ):
        """Test behavioral tracking creates proper lead segmentation."""
        start_date, end_date = date_range
        
        # Mock behavioral segmentation data
        mock_segments = [
            Mock(
                behavioral_segment="champion",
                segment_count=15,
                avg_score=88.2,
                avg_engagement=82.5,
                avg_days_since_interaction=1.2,
                avg_interactions=8.5,
                closed_count=12,
                total_segment_value=180000.0
            ),
            Mock(
                behavioral_segment="promising",
                segment_count=35,
                avg_score=71.8,
                avg_engagement=58.3,
                avg_days_since_interaction=3.8,
                avg_interactions=5.2,
                closed_count=18,
                total_segment_value=210000.0
            ),
            Mock(
                behavioral_segment="cold",
                segment_count=25,
                avg_score=35.1,
                avg_engagement=15.2,
                avg_days_since_interaction=15.5,
                avg_interactions=1.1,
                closed_count=2,
                total_segment_value=45000.0
            )
        ]
        
        mock_db_session.execute.return_value.__iter__ = Mock(return_value=iter(mock_segments))

        result = analytics_repo.get_behavioral_tracking_summary(organization_id, start_date, end_date)

        # Verify behavioral tracking query
        mock_db_session.execute.assert_called_once()
        sql_call = mock_db_session.execute.call_args[0][0]
        
        assert "lead_behavior_tracking bt" in str(sql_call)
        assert "LEFT JOIN" in str(sql_call)
        assert "behavioral_segment" in str(sql_call)

        # Verify result structure and calculations
        assert "segments" in result
        assert "total_leads_analyzed" in result
        assert "high_priority_count" in result
        assert "engagement_summary" in result

        assert result["total_leads_analyzed"] == 75  # 15 + 35 + 25
        assert result["high_priority_count"] == 50  # champion + promising
        
        # Verify individual segment data
        champion_segment = result["segments"]["champion"]
        assert champion_segment["count"] == 15
        assert champion_segment["conversion_rate"] == 80.0  # 12/15 * 100

    def test_get_pipeline_velocity_metrics_analyzes_timing(
        self, analytics_repo, organization_id, date_range, mock_db_session
    ):
        """Test pipeline velocity metrics calculation from audit logs."""
        start_date, end_date = date_range
        
        # Mock velocity data
        mock_velocity = [
            Mock(
                stage="lead",
                transition_count=50,
                avg_days=2.1,
                median_days=1.8,
                min_days=0.5,
                max_days=7.2,
                stddev_days=1.5
            ),
            Mock(
                stage="contato",
                stage="contato",
                transition_count=42,
                avg_days=5.8,
                median_days=4.5,
                min_days=1.2,
                max_days=18.5,
                stddev_days=3.2
            ),
            Mock(
                stage="proposta",
                transition_count=28,
                avg_days=12.5,  # Slow stage
                median_days=10.2,
                min_days=3.8,
                max_days=45.0,
                stddev_days=8.1
            )
        ]
        
        mock_db_session.execute.return_value.__iter__ = Mock(return_value=iter(mock_velocity))

        result = analytics_repo.get_pipeline_velocity_metrics(organization_id, start_date, end_date)

        # Verify velocity query uses audit logs properly
        mock_db_session.execute.assert_called_once()
        sql_call = mock_db_session.execute.call_args[0][0]
        
        assert "WITH stage_durations AS" in str(sql_call)
        assert "calculated_durations AS" in str(sql_call)
        assert "LAG(al.created_at) OVER" in str(sql_call)

        # Verify result structure
        assert "stage_velocity" in result
        assert "total_pipeline_days" in result
        assert "overall_velocity" in result
        assert "bottleneck_stage" in result

        # Verify calculations
        assert result["total_pipeline_days"] == round(2.1 + 5.8 + 12.5, 1)  # 20.4
        assert result["overall_velocity"] == "Normal"  # Between 30 and 60 days
        assert result["bottleneck_stage"] == "proposta"  # Slowest stage > 7 days

    def test_organization_isolation_in_all_queries(
        self, analytics_repo, organization_id, date_range, mock_db_session
    ):
        """Test that all repository methods enforce organization isolation."""
        start_date, end_date = date_range
        
        # Mock empty results for all queries
        mock_db_session.execute.return_value.first.return_value = None
        mock_db_session.execute.return_value.__iter__ = Mock(return_value=iter([]))

        # Test all methods that should include organization filtering
        methods_to_test = [
            (analytics_repo.get_daily_metrics_summary, (organization_id, start_date, end_date)),
            (analytics_repo.get_stage_transition_analytics, (organization_id, start_date, end_date)),
            (analytics_repo.get_lead_source_performance, (organization_id, start_date, end_date)),
            (analytics_repo.get_behavioral_tracking_summary, (organization_id, start_date, end_date)),
            (analytics_repo.get_pipeline_velocity_metrics, (organization_id, start_date, end_date))
        ]

        for method, args in methods_to_test:
            # Reset mock for each test
            mock_db_session.reset_mock()
            
            # Call method
            method(*args)
            
            # Verify organization filtering was applied
            mock_db_session.execute.assert_called()
            
            # Check SQL contains organization filtering
            sql_call = mock_db_session.execute.call_args[0][0]
            assert "organization_id = :org_id" in str(sql_call), f"Method {method.__name__} missing organization filter"
            
            # Check parameters include organization ID
            params = mock_db_session.execute.call_args[1]
            assert params.get("org_id") == str(organization_id), f"Method {method.__name__} missing org_id parameter"

    def test_source_quality_rating_logic(self, analytics_repo):
        """Test source quality rating calculation logic."""
        # Test all rating categories
        assert analytics_repo._calculate_source_quality_rating(30.0, 85.0) == "Excellent"
        assert analytics_repo._calculate_source_quality_rating(20.0, 65.0) == "Good"  
        assert analytics_repo._calculate_source_quality_rating(12.0, 55.0) == "Fair"
        assert analytics_repo._calculate_source_quality_rating(5.0, 30.0) == "Poor"

        # Test edge cases
        assert analytics_repo._calculate_source_quality_rating(25.0, 69.9) == "Fair"  # Just below excellent
        assert analytics_repo._calculate_source_quality_rating(14.9, 70.0) == "Fair"  # Just below good

    def test_velocity_rating_logic(self, analytics_repo):
        """Test velocity rating calculation logic."""
        # Test all velocity categories
        assert analytics_repo._calculate_velocity_rating(0.8) == "Excellent"
        assert analytics_repo._calculate_velocity_rating(2.5) == "Good"
        assert analytics_repo._calculate_velocity_rating(5.0) == "Fair"
        assert analytics_repo._calculate_velocity_rating(10.0) == "Slow"

        # Test boundary conditions
        assert analytics_repo._calculate_velocity_rating(1.0) == "Excellent"
        assert analytics_repo._calculate_velocity_rating(3.0) == "Good"
        assert analytics_repo._calculate_velocity_rating(7.0) == "Fair"

    def test_velocity_bottleneck_identification(self, analytics_repo):
        """Test bottleneck identification in pipeline velocity."""
        velocity_metrics = {
            "lead": {"avg_days": 2.5},
            "contato": {"avg_days": 4.1},
            "proposta": {"avg_days": 15.2},  # This should be the bottleneck
            "negociacao": {"avg_days": 6.8}
        }
        
        bottleneck = analytics_repo._identify_velocity_bottleneck(velocity_metrics)
        assert bottleneck == "proposta"

        # Test no bottleneck case (all stages < 7 days)
        fast_velocity_metrics = {
            "lead": {"avg_days": 1.5},
            "contato": {"avg_days": 3.2},
            "proposta": {"avg_days": 5.8},
            "negociacao": {"avg_days": 4.1}
        }
        
        bottleneck = analytics_repo._identify_velocity_bottleneck(fast_velocity_metrics)
        assert bottleneck is None

    def test_empty_metrics_summary_structure(self, analytics_repo):
        """Test empty metrics summary has correct structure."""
        empty_metrics = analytics_repo._get_empty_metrics_summary()
        
        expected_keys = [
            "total_leads", "closed_won_leads", "closed_lost_leads", "avg_lead_score",
            "high_score_leads", "medium_score_leads", "low_score_leads",
            "total_estimated_value", "total_won_value", "avg_estimated_value", 
            "conversion_rate"
        ]
        
        for key in expected_keys:
            assert key in empty_metrics
            assert isinstance(empty_metrics[key], (int, float))
            assert empty_metrics[key] == 0 or empty_metrics[key] == 0.0

    def test_sql_injection_prevention(self, analytics_repo, organization_id, date_range, mock_db_session):
        """Test that all queries use parameterized queries to prevent SQL injection."""
        start_date, end_date = date_range
        
        # Mock results
        mock_db_session.execute.return_value.first.return_value = None
        mock_db_session.execute.return_value.__iter__ = Mock(return_value=iter([]))

        # Test with potentially malicious organization ID
        malicious_org_id = "'; DROP TABLE leads; --"

        # All methods should use parameterized queries
        analytics_repo.get_daily_metrics_summary(malicious_org_id, start_date, end_date)

        # Verify parameterized query was used
        mock_db_session.execute.assert_called()
        
        # Check that parameters were passed separately (not string concatenated)
        call_args = mock_db_session.execute.call_args
        assert len(call_args) == 2, "Query should have separate parameters"
        assert "org_id" in call_args[1], "org_id should be parameterized"
        assert call_args[1]["org_id"] == malicious_org_id, "Parameter should be passed safely"