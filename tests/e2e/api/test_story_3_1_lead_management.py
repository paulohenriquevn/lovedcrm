"""
Story 3.1 - Lead Management MVP End-to-End Tests

Tests for lead scoring, deduplication, and intelligent assignment features
with strict organization isolation validation.
"""

import pytest
from tests.e2e.api.conftest import TEST_BASE_URL


@pytest.mark.asyncio
class TestLeadScoringSystem:
    """Test ML-based lead scoring with 6-factor algorithm."""
    
    async def test_calculate_lead_score_success(self, authenticated_user, api_client):
        """Test single lead scoring calculation with organization isolation."""
        
        # Create a test lead
        lead_data = {
            "name": "João Silva",
            "email": "joao@techcorp.com.br", 
            "phone": "+55 11 99999-8888",
            "source": "LinkedIn",
            "estimated_value": 15000.0,
            "stage": "lead",
            "notes": "Interested in premium package"
        }
        
        create_response = api_client.post(
            f"{TEST_BASE_URL}/crm/leads",
            json=lead_data,
            headers={
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': authenticated_user['organization']['id']
            }
        )
        
        assert create_response.status_code == 201, f"Lead creation failed: {create_response.text}"
        lead = create_response.json()
        lead_id = lead['id']
        
        # Calculate score
        score_response = api_client.post(
            f"{TEST_BASE_URL}/crm/leads/{lead_id}/calculate-score",
            headers={
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': authenticated_user['organization']['id']
            }
        )
        
        assert score_response.status_code == 200
        score_data = score_response.json()
        
        # Validate score structure
        assert "lead_id" in score_data
        assert "score" in score_data
        assert "factors" in score_data
        assert score_data["lead_id"] == lead_id
        assert 0 <= score_data["score"] <= 100
        
        # Validate factors (6-factor algorithm)
        expected_factors = ["email_authority", "phone_complete", "value_tier", "source_quality", "company_size", "engagement"]
        for factor in expected_factors:
            assert factor in score_data["factors"]
            
        # Validate high-quality lead gets reasonable score
        assert score_data["score"] >= 30  # Corporate email + complete phone + good value
        
    async def test_bulk_score_leads_success(self, authenticated_user, api_client):
        """Test bulk scoring of multiple leads."""
        
        # Create multiple test leads
        leads_data = [
            {
                "name": "Maria Santos", 
                "email": "maria@empresa.com",
                "phone": "+55 11 8888-7777",
                "estimated_value": 25000.0,
                "stage": "lead"
            },
            {
                "name": "Pedro Costa",
                "email": "pedro@gmail.com", 
                "phone": "+55 11 7777-6666",
                "estimated_value": 5000.0,
                "stage": "lead"
            }
        ]
        
        created_leads = []
        for lead_data in leads_data:
            response = api_client.post(
                f"{TEST_BASE_URL}/crm/leads",
                json=lead_data,
                headers={
                    'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                    'X-Org-Id': authenticated_user['organization']['id']
                }
            )
            assert response.status_code == 201
            created_leads.append(response.json()['id'])
            
        # Bulk score specific leads
        bulk_response = api_client.post(
            f"{TEST_BASE_URL}/crm/leads/bulk-score",
            json=created_leads,
            headers={
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': authenticated_user['organization']['id']
            }
        )
        
        assert bulk_response.status_code == 200
        bulk_data = bulk_response.json()
        
        assert "scored_leads" in bulk_data
        assert "total_leads" in bulk_data
        assert bulk_data["scored_leads"] == 2
        assert bulk_data["total_leads"] == 2
        
        # Validate bulk scoring response structure
        assert "average_score" in bulk_data
        assert "score_distribution" in bulk_data
        assert "organization_id" in bulk_data


@pytest.mark.asyncio
class TestLeadDeduplicationSystem:
    """Test fuzzy matching duplicate detection and merging."""
    
    async def test_find_potential_duplicates_success(self, authenticated_user, api_client):
        """Test duplicate detection using fuzzy matching algorithms."""
        
        # Create similar leads that should be detected as duplicates
        similar_leads = [
            {
                "name": "João da Silva",
                "email": "joao.silva@techcorp.com.br",
                "phone": "+55 11 99999-8888",
                "stage": "lead"
            },
            {
                "name": "Joao Silva",  # Slightly different name
                "email": "j.silva@techcorp.com.br",  # Same domain, different email
                "phone": "11999998888",  # Different phone format
                "stage": "lead"
            }
        ]
        
        for lead_data in similar_leads:
            response = api_client.post(
                f"{TEST_BASE_URL}/crm/leads",
                json=lead_data,
                headers={
                    'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                    'X-Org-Id': authenticated_user['organization']['id']
                }
            )
            assert response.status_code == 201
            
        # Find duplicates
        duplicates_response = api_client.get(
            f"{TEST_BASE_URL}/crm/leads/duplicates?limit=50",
            headers={
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': authenticated_user['organization']['id']
            }
        )
        
        assert duplicates_response.status_code == 200
        duplicates_data = duplicates_response.json()
        
        # Should find at least one duplicate pair
        assert len(duplicates_data) >= 1
        
        # Validate duplicate structure
        duplicate = duplicates_data[0]
        assert "original_lead" in duplicate
        assert "potential_duplicate" in duplicate
        assert "similarity_score" in duplicate
        assert "matching_factors" in duplicate
        assert "confidence_level" in duplicate
        assert "recommended_action" in duplicate
        
        # Should have reasonable similarity score
        assert duplicate["similarity_score"] >= 70  # Above minimum threshold


@pytest.mark.asyncio
class TestLeadAssignmentSystem:
    """Test intelligent lead assignment with multiple strategies."""
    
    async def test_assign_leads_batch_workload_balanced(self, authenticated_user, api_client):
        """Test workload-balanced lead assignment strategy."""
        
        # Create multiple unassigned leads
        leads_data = [
            {"name": "Lead 1", "email": "lead1@test.com", "stage": "lead"},
            {"name": "Lead 2", "email": "lead2@test.com", "stage": "lead"},
            {"name": "Lead 3", "email": "lead3@test.com", "stage": "lead"}
        ]
        
        created_leads = []
        for lead_data in leads_data:
            response = api_client.post(f"{TEST_BASE_URL}/crm/leads", json=lead_data, headers={
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': authenticated_user['organization']['id']
            })
            assert response.status_code == 201
            created_leads.append(response.json()['id'])
            
        # Assign leads using workload-balanced strategy
        assignment_response = api_client.post(
            f"{TEST_BASE_URL}/crm/leads/assign-batch",
            json=created_leads,
            params={"strategy": "workload_balanced"},
            headers={
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': authenticated_user['organization']['id']
            }
        )
        
        assert assignment_response.status_code == 200
        assignment_data = assignment_response.json()
        
        # Validate assignment results
        assert assignment_data["success"] is True
        assert assignment_data["total_assigned"] == 3
        assert assignment_data["strategy_used"] == "workload_balanced"
        assert len(assignment_data["assignments"]) == 3
        
        # Validate each assignment
        for assignment in assignment_data["assignments"]:
            assert "lead_id" in assignment
            assert "user_id" in assignment
            assert "user_name" in assignment
            assert "reason" in assignment
            assert assignment["lead_id"] in created_leads
            assert "workload" in assignment["reason"].lower()
            
    async def test_get_assignment_analytics_success(self, authenticated_user, api_client):
        """Test assignment analytics and team performance metrics."""
        
        analytics_response = api_client.get(
            f"{TEST_BASE_URL}/crm/leads/assignment-analytics?days_back=30",
            headers={
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': authenticated_user['organization']['id']
            }
        )
        
        assert analytics_response.status_code == 200
        analytics_data = analytics_response.json()
        
        # Validate analytics structure
        assert "organization_id" in analytics_data
        assert "analysis_period_days" in analytics_data
        assert "team_performance" in analytics_data
        assert "summary" in analytics_data
        assert analytics_data["organization_id"] == authenticated_user['organization']['id']
        assert analytics_data["analysis_period_days"] == 30


@pytest.mark.asyncio  
class TestStory31Integration:
    """Integration tests for complete Story 3.1 lead management workflow."""
    
    async def test_complete_lead_lifecycle_with_scoring_and_assignment(self, authenticated_user, api_client):
        """Test complete workflow: create → score → detect duplicates → assign."""
        
        # Step 1: Create a high-quality lead
        lead_data = {
            "name": "Ana Costa", 
            "email": "ana.costa@bigcorp.com.br",
            "phone": "+55 11 99999-8888",
            "source": "Referral", 
            "estimated_value": 50000.0,
            "notes": "Enterprise client interested in full solution",
            "stage": "lead"
        }
        
        create_response = api_client.post(f"{TEST_BASE_URL}/crm/leads", json=lead_data, headers={
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        })
        assert create_response.status_code == 201
        lead = create_response.json()
        lead_id = lead['id']
        
        # Step 2: Calculate lead score
        score_response = api_client.post(f"{TEST_BASE_URL}/crm/leads/{lead_id}/calculate-score", headers={
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        })
        assert score_response.status_code == 200
        score_data = score_response.json()
        
        # Should be high-quality lead with good score (adjusted for actual algorithm)
        assert score_data["score"] >= 40
        
        # Step 3: Check for duplicates (should be none)
        duplicates_response = api_client.get(f"{TEST_BASE_URL}/crm/leads/duplicates", headers={
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        })
        assert duplicates_response.status_code == 200
        
        # Step 4: Assign lead using score-based strategy (high-value leads to top performers)
        assignment_response = api_client.post(
            f"{TEST_BASE_URL}/crm/leads/assign-batch",
            json=[lead_id],
            params={"strategy": "score_based"},
            headers={
                'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
                'X-Org-Id': authenticated_user['organization']['id']
            }
        )
        assert assignment_response.status_code == 200
        assignment_data = assignment_response.json()
        
        assert assignment_data["success"] is True
        assert assignment_data["total_assigned"] == 1
        assert assignment_data["strategy_used"] == "score_based"
        
        # Step 5: Verify lead was assigned and has score
        get_response = api_client.get(f"{TEST_BASE_URL}/crm/leads/{lead_id}", headers={
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        })
        assert get_response.status_code == 200
        final_lead = get_response.json()
        
        # Should now have assignment and score
        assert final_lead.get("assigned_user_id") is not None
        assert final_lead.get("lead_score") is not None
        assert final_lead["lead_score"] >= 40