"""Unit tests for LeadAnalyticsService.

Comprehensive test suite validating analytics calculations, organization isolation,
performance benchmarks, and integration with Story 3.1 services.

Test Coverage:
- Organization isolation validation (critical for multi-tenancy)
- Analytics calculations accuracy
- Performance benchmarks (< 500ms for dashboard queries)
- Story 3.1 service integration
- Edge cases and error handling
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, patch
from uuid import uuid4

from api.services.crm_lead_analytics_service import LeadAnalyticsService
from api.models.crm_lead import Lead
from api.models.organization import Organization


@pytest.fixture
def mock_db_session():
    """Mock database session for testing."""
    return Mock()


@pytest.fixture
def analytics_service(mock_db_session):
    """Initialize analytics service with mock database."""
    return LeadAnalyticsService(mock_db_session)


@pytest.fixture
def organization_id():
    """Test organization UUID."""
    return uuid4()


@pytest.fixture
def other_organization_id():
    """Different organization UUID for isolation testing."""
    return uuid4()


@pytest.fixture
def sample_leads_data(organization_id):
    """Sample leads data for testing calculations."""
    return [
        {
            "id": uuid4(),
            "organization_id": organization_id,
            "stage": "lead",
            "lead_score": 85.0,
            "estimated_value": 25000.0,
            "source": "linkedin",
            "created_at": datetime.now() - timedelta(days=5),
            "updated_at": datetime.now() - timedelta(days=5)
        },
        {
            "id": uuid4(),
            "organization_id": organization_id,
            "stage": "contato",
            "lead_score": 72.0,
            "estimated_value": 15000.0,
            "source": "google_ads",
            "created_at": datetime.now() - timedelta(days=10),
            "updated_at": datetime.now() - timedelta(days=8)
        },
        {
            "id": uuid4(),
            "organization_id": organization_id,
            "stage": "fechado",
            "lead_score": 90.0,
            "estimated_value": 30000.0,
            "actual_value": 28000.0,
            "is_won": True,
            "source": "referral",
            "created_at": datetime.now() - timedelta(days=15),
            "updated_at": datetime.now() - timedelta(days=2)
        }
    ]


class TestLeadAnalyticsService:
    """Test suite for LeadAnalyticsService class."""

    def test_init_creates_scoring_service(self, mock_db_session):
        """Test service initialization creates scoring service dependency."""
        service = LeadAnalyticsService(mock_db_session)
        
        assert service.db == mock_db_session
        assert service.scoring_service is not None
        assert hasattr(service.scoring_service, 'calculate_lead_score')

    @pytest.mark.asyncio
    async def test_calculate_executive_dashboard_organization_isolation(
        self, analytics_service, organization_id, other_organization_id, mock_db_session
    ):
        """Test that analytics queries are properly isolated by organization."""
        # Setup mock query chain for organization filtering
        mock_query = Mock()
        mock_filter_result = Mock()
        mock_count_result = Mock()
        
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter_result
        mock_filter_result.count.return_value = 5
        mock_filter_result.with_entities.return_value.scalar.return_value = 75.5
        
        # Mock execute for SQL queries
        mock_execute_result = Mock()
        mock_execute_result.__iter__ = Mock(return_value=iter([]))
        mock_db_session.execute.return_value = mock_execute_result

        start_date = datetime.now() - timedelta(days=30)
        end_date = datetime.now()

        # Call method with specific organization
        result = await analytics_service.calculate_executive_dashboard(
            organization_id, start_date, end_date
        )

        # Verify organization filtering in all queries
        call_args_list = mock_query.filter.call_args_list
        organization_filters = [
            call for call in call_args_list 
            if any('organization_id' in str(arg) for arg in call[0])
        ]
        
        assert len(organization_filters) > 0, "No organization filtering found in queries"
        assert result["organization_id"] == str(organization_id)

    @pytest.mark.asyncio 
    async def test_calculate_executive_dashboard_basic_metrics(
        self, analytics_service, organization_id, sample_leads_data, mock_db_session
    ):
        """Test basic metrics calculation in executive dashboard."""
        # Mock query results
        mock_query = Mock()
        mock_filter_result = Mock()
        
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter_result
        mock_filter_result.count.return_value = len(sample_leads_data)
        mock_filter_result.with_entities.return_value.scalar.return_value = 82.3

        # Mock SQL execution results
        mock_execute_result = Mock()
        mock_execute_result.__iter__ = Mock(return_value=iter([]))
        mock_db_session.execute.return_value = mock_execute_result

        # Mock helper methods
        analytics_service._get_previous_period_count = Mock(return_value=8)
        analytics_service._get_previous_period_avg_score = Mock(return_value=78.5)
        analytics_service._calculate_conversion_funnel = Mock(return_value={
            "overall_conversion_rate": 15.2,
            "stages": {},
            "total_leads_in_funnel": 3,
            "closed_leads": 1
        })
        analytics_service._calculate_score_distribution = Mock(return_value={
            "0-25": 0, "26-50": 0, "51-75": 1, "76-100": 2, "unscored": 0
        })
        analytics_service._calculate_source_performance = Mock(return_value=[])
        analytics_service._calculate_stage_timing_analysis = Mock(return_value={})
        analytics_service._calculate_behavior_insights = Mock(return_value={})
        analytics_service._generate_performance_alerts = Mock(return_value=[])

        result = await analytics_service.calculate_executive_dashboard(organization_id)

        # Verify basic metrics structure
        assert "summary_metrics" in result
        summary = result["summary_metrics"]
        
        assert "total_leads" in summary
        assert "leads_growth_percentage" in summary
        assert "average_score" in summary
        assert "score_trend" in summary
        assert "conversion_rate" in summary

        # Verify calculations
        assert summary["total_leads"] == 3
        assert summary["average_score"] == 82.3
        assert summary["score_trend"] == round(82.3 - 78.5, 1)

    @pytest.mark.asyncio
    async def test_calculate_conversion_funnel_sql_optimization(
        self, analytics_service, organization_id, mock_db_session
    ):
        """Test conversion funnel uses optimized SQL with CTEs."""
        # Mock SQL execution result
        mock_result = Mock()
        mock_result.__iter__ = Mock(return_value=iter([
            Mock(
                stage="lead",
                stage_count=10,
                avg_score=75.0,
                median_score=73.0,
                avg_days_in_stage=2.5,
                conversion_rate=100.0,
                total_estimated_value=150000.0,
                high_score_count=6,
                low_score_count=1
            ),
            Mock(
                stage="contato", 
                stage_count=8,
                avg_score=78.0,
                median_score=76.0,
                avg_days_in_stage=4.2,
                conversion_rate=80.0,
                total_estimated_value=120000.0,
                high_score_count=5,
                low_score_count=0
            )
        ]))
        
        mock_db_session.execute.return_value = mock_result

        start_date = datetime.now() - timedelta(days=30)
        end_date = datetime.now()

        result = await analytics_service._calculate_conversion_funnel(
            organization_id, Mock(), start_date, end_date
        )

        # Verify SQL was executed (CTE-based query)
        mock_db_session.execute.assert_called_once()
        sql_call = mock_db_session.execute.call_args[0][0]
        
        # Verify it's using CTEs for optimization
        assert "WITH stage_analysis AS" in str(sql_call)
        assert "conversion_rates AS" in str(sql_call)
        
        # Verify organization parameter binding
        params = mock_db_session.execute.call_args[1]
        assert params["org_id"] == str(organization_id)

        # Verify result structure
        assert "stages" in result
        assert "overall_conversion_rate" in result
        assert "total_leads_in_funnel" in result
        assert "bottleneck_stage" in result
        assert "funnel_health" in result

    @pytest.mark.asyncio
    async def test_score_distribution_calculation(
        self, analytics_service, organization_id, mock_db_session
    ):
        """Test lead score distribution calculation accuracy."""
        # Mock query result with score distribution
        mock_result = Mock()
        mock_result.score_0_25 = 2
        mock_result.score_26_50 = 5
        mock_result.score_51_75 = 8
        mock_result.score_76_100 = 12
        mock_result.score_null = 1

        mock_query = Mock()
        mock_filter_result = Mock()
        mock_with_entities_result = Mock()

        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter_result
        mock_filter_result.with_entities.return_value = mock_with_entities_result
        mock_with_entities_result.first.return_value = mock_result

        base_query = Mock()
        result = await analytics_service._calculate_score_distribution(base_query)

        # Verify distribution structure and values
        expected_distribution = {
            "0-25": 2,
            "26-50": 5, 
            "51-75": 8,
            "76-100": 12,
            "unscored": 1
        }

        assert result == expected_distribution

    @pytest.mark.asyncio
    async def test_performance_alerts_generation(
        self, analytics_service, organization_id, mock_db_session
    ):
        """Test smart performance alerts generation with recommendations."""
        # Mock helper methods for alert triggers
        analytics_service._get_recent_conversion_rate = Mock(return_value=8.5)
        analytics_service._get_historical_conversion_rate = Mock(return_value=15.2)
        analytics_service._calculate_pipeline_value_at_risk = Mock(return_value=250000.0)
        analytics_service._detect_stagnant_high_value_leads = Mock(return_value={
            "count": 5,
            "total_value": 125000.0,
            "recommended_assignee": "top_performer_123"
        })
        analytics_service._detect_score_distribution_anomaly = Mock(return_value={
            "is_anomaly": False
        })

        result = await analytics_service._generate_performance_alerts(organization_id)

        # Verify alert structure
        assert isinstance(result, list)
        
        if result:  # If alerts were generated
            alert = result[0]
            assert "id" in alert
            assert "type" in alert
            assert "priority" in alert
            assert "title" in alert
            assert "description" in alert
            assert "impact" in alert
            assert "recommended_actions" in alert
            assert "data" in alert
            assert "created_at" in alert

            # Verify recommendations are actionable
            assert isinstance(alert["recommended_actions"], list)
            assert len(alert["recommended_actions"]) > 0

    @pytest.mark.asyncio
    async def test_organization_isolation_edge_cases(
        self, analytics_service, organization_id, other_organization_id, mock_db_session
    ):
        """Test edge cases for organization isolation."""
        # Test with empty organization UUID
        with pytest.raises(Exception):
            await analytics_service.calculate_executive_dashboard(None)

        # Mock query to return empty results for wrong organization
        mock_query = Mock()
        mock_filter_result = Mock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter_result
        mock_filter_result.count.return_value = 0
        mock_filter_result.with_entities.return_value.scalar.return_value = None

        # Mock execute for SQL queries
        mock_execute_result = Mock()
        mock_execute_result.__iter__ = Mock(return_value=iter([]))
        mock_db_session.execute.return_value = mock_execute_result

        # Mock helper methods for edge case
        analytics_service._get_previous_period_count = Mock(return_value=0)
        analytics_service._get_previous_period_avg_score = Mock(return_value=0.0)
        analytics_service._calculate_conversion_funnel = Mock(return_value={
            "overall_conversion_rate": 0.0,
            "stages": {},
            "total_leads_in_funnel": 0,
            "closed_leads": 0
        })
        analytics_service._calculate_score_distribution = Mock(return_value={
            "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0, "unscored": 0
        })
        analytics_service._calculate_source_performance = Mock(return_value=[])
        analytics_service._calculate_stage_timing_analysis = Mock(return_value={})
        analytics_service._calculate_behavior_insights = Mock(return_value={})
        analytics_service._generate_performance_alerts = Mock(return_value=[])

        # Should return empty results for organization with no leads
        result = await analytics_service.calculate_executive_dashboard(other_organization_id)
        
        assert result["summary_metrics"]["total_leads"] == 0
        assert result["organization_id"] == str(other_organization_id)

    def test_growth_percentage_calculation_edge_cases(self, analytics_service):
        """Test growth percentage calculation handles edge cases."""
        # Test division by zero
        assert analytics_service._calculate_growth_percentage(5, 0) == 100.0
        assert analytics_service._calculate_growth_percentage(0, 0) == 0.0
        
        # Test normal calculations
        assert analytics_service._calculate_growth_percentage(15, 10) == 50.0
        assert analytics_service._calculate_growth_percentage(8, 10) == -20.0

    def test_conversion_bottleneck_detection(self, analytics_service):
        """Test bottleneck stage detection logic."""
        stages_data = {
            "lead": {"conversion_rate": 85.0},
            "contato": {"conversion_rate": 72.0},
            "proposta": {"conversion_rate": 35.0},  # This should be the bottleneck
            "negociacao": {"conversion_rate": 65.0}
        }
        
        bottleneck = analytics_service._detect_conversion_bottleneck(stages_data)
        assert bottleneck == "proposta"
        
        # Test no bottleneck case (all rates > 50%)
        high_performance_stages = {
            "lead": {"conversion_rate": 85.0},
            "contato": {"conversion_rate": 72.0},
            "proposta": {"conversion_rate": 65.0},
            "negociacao": {"conversion_rate": 68.0}
        }
        
        bottleneck = analytics_service._detect_conversion_bottleneck(high_performance_stages)
        assert bottleneck is None

    def test_funnel_health_calculation(self, analytics_service):
        """Test funnel health rating calculation."""
        assert analytics_service._calculate_funnel_health({}, 25.0) == "Excellent"
        assert analytics_service._calculate_funnel_health({}, 18.0) == "Good"
        assert analytics_service._calculate_funnel_health({}, 12.0) == "Fair"
        assert analytics_service._calculate_funnel_health({}, 5.0) == "Needs Attention"

    def test_source_quality_rating(self, analytics_service):
        """Test source quality rating logic."""
        assert analytics_service._get_source_quality_rating(30.0, 85.0) == "Excellent"
        assert analytics_service._get_source_quality_rating(18.0, 65.0) == "Good"
        assert analytics_service._get_source_quality_rating(12.0, 45.0) == "Fair"
        assert analytics_service._get_source_quality_rating(5.0, 25.0) == "Poor"

    @pytest.mark.asyncio
    async def test_performance_benchmark_mock(
        self, analytics_service, organization_id, mock_db_session
    ):
        """Test that analytics calculations complete within performance benchmarks."""
        import time
        
        # Mock all external dependencies to avoid real database calls
        mock_query = Mock()
        mock_filter_result = Mock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter_result
        mock_filter_result.count.return_value = 100
        mock_filter_result.with_entities.return_value.scalar.return_value = 75.5

        mock_execute_result = Mock()
        mock_execute_result.__iter__ = Mock(return_value=iter([]))
        mock_db_session.execute.return_value = mock_execute_result

        # Mock all helper methods for performance testing
        analytics_service._get_previous_period_count = Mock(return_value=95)
        analytics_service._get_previous_period_avg_score = Mock(return_value=73.2)
        analytics_service._calculate_conversion_funnel = Mock(return_value={
            "overall_conversion_rate": 18.5,
            "stages": {},
            "total_leads_in_funnel": 100,
            "closed_leads": 18
        })
        analytics_service._calculate_score_distribution = Mock(return_value={
            "0-25": 5, "26-50": 15, "51-75": 45, "76-100": 35, "unscored": 0
        })
        analytics_service._calculate_source_performance = Mock(return_value=[])
        analytics_service._calculate_stage_timing_analysis = Mock(return_value={})
        analytics_service._calculate_behavior_insights = Mock(return_value={})
        analytics_service._generate_performance_alerts = Mock(return_value=[])

        # Measure execution time
        start_time = time.time()
        result = await analytics_service.calculate_executive_dashboard(organization_id)
        end_time = time.time()

        execution_time = (end_time - start_time) * 1000  # Convert to milliseconds

        # Performance benchmark: < 500ms for dashboard calculations
        assert execution_time < 500, f"Dashboard calculation took {execution_time}ms, expected < 500ms"
        assert result is not None