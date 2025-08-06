"""
🎯 CRM Leads E2E Tests - STORY 1.1 Pipeline Visualization B2B

GOLDEN RULE: FUNCTIONALITY FIRST
1. PRIORITY 1: Test successful CRM operations (2XX) - FUNCTIONALITY REAL
2. PRIORITY 2: Test validation and security (4XX/5XX) - SECURITY
3. OBJECTIVE: Verify that CRM leads features TRULY WORK

Test Coverage:
- ✅ Create leads with organization isolation
- ✅ List leads with pagination and filters
- ✅ Update leads and stage movements
- ✅ Search leads functionality
- ✅ Pipeline statistics
- ✅ Multi-tenant security isolation
"""
import uuid
import pytest
import time

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid
)


class TestCRMLeadsAPI:
    """Test CRM Leads API endpoints with organizational isolation."""

    # ============================================================================
    # ✅ PRIORITY 1: SUCCESS SCENARIOS - CRM functionality works correctly
    # ============================================================================

    def test_create_lead_success(self, api_client, authenticated_user):
        """✅ Test creating a new lead for organization."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        lead_data = {
            "name": "Maria Silva",
            "email": "maria@example.com",
            "phone": "+55 11 99999-1234",
            "stage": "lead",
            "source": "WhatsApp",
            "estimated_value": 5000.0,
            "tags": ["Marketing Digital", "Urgente"],
            "notes": "Cliente interessado em campanha completa"
        }
        
        response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/",
            json=lead_data,
            headers=headers
        )
        
        assert_successful_response(response, 201)
        data = response.json()
        
        # Verify lead creation
        assert_valid_uuid(data['id'])
        assert data['organization_id'] == authenticated_user['organization']['id']
        assert data['name'] == lead_data['name']
        assert data['email'] == lead_data['email']
        assert data['stage'] == lead_data['stage']
        assert float(data['estimated_value']) == lead_data['estimated_value']
        assert data['tags'] == lead_data['tags']
        assert data['is_closed'] == False
        
        # Verify timestamps
        assert 'created_at' in data
        assert 'updated_at' in data
        
        # Return data for use in other tests
        return data

    def test_list_leads_success(self, api_client, authenticated_user):
        """✅ Test listing leads with pagination."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Create a test lead first
        lead = self.test_create_lead_success(api_client, authenticated_user)
        
        # List leads
        response = api_client.get(
            f"{TEST_BASE_URL}/api/crm/leads/?page=1&page_size=10",
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        # Verify pagination structure
        assert 'leads' in data
        assert 'total_count' in data
        assert 'page' in data
        assert 'page_size' in data
        assert 'has_more' in data
        
        # Verify at least our created lead is present
        assert data['total_count'] >= 1
        assert len(data['leads']) >= 1
        
        # Find our lead in the list
        found_lead = None
        for lead_item in data['leads']:
            if lead_item['id'] == lead['id']:
                found_lead = lead_item
                break
        
        assert found_lead is not None
        assert found_lead['organization_id'] == authenticated_user['organization']['id']

    def test_get_lead_by_id_success(self, api_client, authenticated_user):
        """✅ Test getting a specific lead by ID."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Create a test lead first
        created_lead = self.test_create_lead_success(api_client, authenticated_user)
        
        # Get lead by ID
        response = api_client.get(
            f"{TEST_BASE_URL}/api/crm/leads/{created_lead['id']}",
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        # Verify lead details
        assert data['id'] == created_lead['id']
        assert data['organization_id'] == authenticated_user['organization']['id']
        assert data['name'] == created_lead['name']

    def test_update_lead_success(self, api_client, authenticated_user):
        """✅ Test updating an existing lead."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Create a test lead first
        created_lead = self.test_create_lead_success(api_client, authenticated_user)
        
        # Update lead data
        update_data = {
            "name": "Maria Silva Santos",
            "estimated_value": 7500.0,
            "notes": "Cliente muito interessado - aumentou budget"
        }
        
        response = api_client.put(
            f"{TEST_BASE_URL}/api/crm/leads/{created_lead['id']}",
            json=update_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        # Verify updates
        assert data['id'] == created_lead['id']
        assert data['name'] == update_data['name']
        assert float(data['estimated_value']) == update_data['estimated_value']
        assert data['notes'] == update_data['notes']
        assert data['updated_at'] != created_lead['updated_at']  # Should be updated

    def test_update_lead_stage_success(self, api_client, authenticated_user):
        """✅ Test updating lead pipeline stage."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Create a test lead first
        created_lead = self.test_create_lead_success(api_client, authenticated_user)
        
        # Update stage
        stage_data = {
            "stage": "contato",
            "notes": "Cliente respondeu - movendo para contato"
        }
        
        response = api_client.put(
            f"{TEST_BASE_URL}/api/crm/leads/{created_lead['id']}/stage",
            json=stage_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        # Verify stage update
        assert data['id'] == created_lead['id']
        assert data['stage'] == stage_data['stage']
        assert stage_data['notes'] in data['notes']  # Notes should be appended

    def test_search_leads_success(self, api_client, authenticated_user):
        """✅ Test searching leads by query."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Create a test lead first
        created_lead = self.test_create_lead_success(api_client, authenticated_user)
        
        # Search by name
        search_data = {
            "query": "Maria",
            "page": 1,
            "page_size": 10
        }
        
        response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/search",
            json=search_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        # Verify search results
        assert 'leads' in data
        assert len(data['leads']) >= 1
        
        # Should find our lead
        found = any(lead['id'] == created_lead['id'] for lead in data['leads'])
        assert found

    def test_pipeline_statistics_success(self, api_client, authenticated_user):
        """✅ Test getting pipeline statistics."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Create a test lead first
        self.test_create_lead_success(api_client, authenticated_user)
        
        # Get statistics
        response = api_client.get(
            f"{TEST_BASE_URL}/api/crm/leads/statistics",
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        # Verify statistics structure
        assert 'stage_counts' in data
        assert 'total_leads' in data
        assert 'conversion_rate' in data
        
        # Verify all pipeline stages are present
        expected_stages = ['lead', 'contato', 'proposta', 'negociacao', 'fechado']
        for stage in expected_stages:
            assert stage in data['stage_counts']
            assert isinstance(data['stage_counts'][stage], int)
        
        # Should have at least one lead (the one we created)
        assert data['total_leads'] >= 1

    def test_delete_lead_success(self, api_client, authenticated_user):
        """✅ Test deleting a lead."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Create a test lead first
        created_lead = self.test_create_lead_success(api_client, authenticated_user)
        
        # Delete lead
        response = api_client.delete(
            f"{TEST_BASE_URL}/api/crm/leads/{created_lead['id']}",
            headers=headers
        )
        
        assert_successful_response(response, 204)
        
        # Verify lead is deleted - should return 404
        get_response = api_client.get(
            f"{TEST_BASE_URL}/api/crm/leads/{created_lead['id']}",
            headers=headers
        )
        
        assert_error_response(get_response, 404)

    # ============================================================================
    # 🔒 PRIORITY 2: SECURITY SCENARIOS - Multi-tenant isolation & validation
    # ============================================================================

    def test_leads_organization_isolation_success(
        self, api_client, authenticated_user, second_organization_user
    ):
        """🔒 CRITICAL: Test leads are completely isolated between organizations."""
        # Create lead in first organization
        org1_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        lead_data = {
            "name": "Organization 1 Lead",
            "email": "org1@example.com",
            "stage": "lead"
        }
        
        response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/",
            json=lead_data,
            headers=org1_headers
        )
        
        assert_successful_response(response, 201)
        org1_lead = response.json()
        
        # Try to access with second organization - should be isolated
        org2_headers = {
            'Authorization': f"Bearer {second_organization_user['tokens']['access_token']}",
            'X-Org-Id': second_organization_user['organization']['id']
        }
        
        # Should not be able to get org1's lead
        response = api_client.get(
            f"{TEST_BASE_URL}/api/crm/leads/{org1_lead['id']}",
            headers=org2_headers
        )
        
        assert_error_response(response, 404)  # Should not exist for org2
        
        # List leads should show different data for each org
        org1_list = api_client.get(
            f"{TEST_BASE_URL}/api/crm/leads/",
            headers=org1_headers
        ).json()
        
        org2_list = api_client.get(
            f"{TEST_BASE_URL}/api/crm/leads/",
            headers=org2_headers
        ).json()
        
        # Org1 should see their lead
        org1_lead_ids = [lead['id'] for lead in org1_list['leads']]
        assert org1_lead['id'] in org1_lead_ids
        
        # Org2 should not see org1's lead
        org2_lead_ids = [lead['id'] for lead in org2_list['leads']]
        assert org1_lead['id'] not in org2_lead_ids

    def test_crm_endpoints_require_authentication(self, api_client):
        """🔒 Test all CRM endpoints require authentication."""
        endpoints = [
            ('GET', '/api/crm/leads/'),
            ('POST', '/api/crm/leads/'),
            ('GET', '/api/crm/leads/statistics'),
            ('POST', '/api/crm/leads/search'),
            ('GET', f'/api/crm/leads/{uuid.uuid4()}'),
            ('PUT', f'/api/crm/leads/{uuid.uuid4()}'),
            ('DELETE', f'/api/crm/leads/{uuid.uuid4()}'),
        ]
        
        for method, endpoint in endpoints:
            if method == 'GET':
                response = api_client.get(f"{TEST_BASE_URL}{endpoint}")
            elif method == 'POST':
                response = api_client.post(f"{TEST_BASE_URL}{endpoint}", json={})
            elif method == 'PUT':
                response = api_client.put(f"{TEST_BASE_URL}{endpoint}", json={})
            elif method == 'DELETE':
                response = api_client.delete(f"{TEST_BASE_URL}{endpoint}")
            
            # Should require authentication
            assert response.status_code in [401, 403], f"{method} {endpoint} should require auth"

    def test_crm_endpoints_require_org_header(self, authenticated_user):
        """🔒 Test all CRM endpoints require X-Org-Id header."""
        import requests
        
        # Create a fresh client without the X-Org-Id header set by fixture
        fresh_client = requests.Session()
        
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}"
            # Missing X-Org-Id header
        }
        
        endpoints = [
            ('GET', '/api/crm/leads/'),
            ('POST', '/api/crm/leads/'),
            ('GET', '/api/crm/leads/statistics'),
        ]
        
        for method, endpoint in endpoints:
            if method == 'GET':
                response = fresh_client.get(f"{TEST_BASE_URL}{endpoint}", headers=headers)
            elif method == 'POST':
                response = fresh_client.post(f"{TEST_BASE_URL}{endpoint}", json={}, headers=headers)
            
            # Should require X-Org-Id header (middleware returns 400)
            assert response.status_code == 400, f"{method} {endpoint} should require X-Org-Id, got {response.status_code}: {response.text}"

    def test_create_lead_validation_errors(self, api_client, authenticated_user):
        """🔒 Test lead creation validation."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Test missing required fields
        invalid_data = {
            # Missing name
            "email": "test@example.com"
        }
        
        response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/",
            json=invalid_data,
            headers=headers
        )
        
        assert_error_response(response, 422)  # Validation error
        
        # Test invalid email
        invalid_data = {
            "name": "Test Lead",
            "email": "invalid-email"
        }
        
        response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/",
            json=invalid_data,
            headers=headers
        )
        
        assert_error_response(response, 422)  # Validation error
        
        # Test invalid stage
        invalid_data = {
            "name": "Test Lead",
            "stage": "invalid_stage"
        }
        
        response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/",
            json=invalid_data,
            headers=headers
        )
        
        assert_error_response(response, 422)  # Validation error

    def test_update_nonexistent_lead_error(self, api_client, authenticated_user):
        """🔒 Test updating nonexistent lead returns 404."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        nonexistent_id = str(uuid.uuid4())
        
        response = api_client.put(
            f"{TEST_BASE_URL}/api/crm/leads/{nonexistent_id}",
            json={"name": "Updated Name"},
            headers=headers
        )
        
        assert_error_response(response, 404)

    def test_search_leads_validation(self, api_client, authenticated_user):
        """🔒 Test search validation."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Test missing query
        response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/search",
            json={"page": 1},  # Missing query
            headers=headers
        )
        
        assert_error_response(response, 422)
        
        # Test invalid page size
        response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/search",
            json={"query": "test", "page_size": 150},  # Too large
            headers=headers
        )
        
        assert_error_response(response, 422)


@pytest.mark.crm
@pytest.mark.leads
class TestCRMLeadsIntegration:
    """Integration tests for complete CRM leads workflow."""

    def test_complete_lead_lifecycle(self, api_client, authenticated_user):
        """✅ Test complete lead lifecycle: create → update → move stages → delete."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # 1. Create lead
        lead_data = {
            "name": "Integration Test Lead",
            "email": "integration@example.com",
            "phone": "+55 11 99999-0000",
            "stage": "lead",
            "estimated_value": 10000.0,
            "tags": ["Integration Test"]
        }
        
        create_response = api_client.post(
            f"{TEST_BASE_URL}/api/crm/leads/",
            json=lead_data,
            headers=headers
        )
        
        assert_successful_response(create_response, 201)
        lead = create_response.json()
        
        # 2. Update lead information
        update_data = {
            "estimated_value": 12000.0,
            "notes": "Updated during integration test"
        }
        
        update_response = api_client.put(
            f"{TEST_BASE_URL}/api/crm/leads/{lead['id']}",
            json=update_data,
            headers=headers
        )
        
        assert_successful_response(update_response, 200)
        
        # 3. Move through pipeline stages
        stages = ["contato", "proposta", "negociacao", "fechado"]
        
        for stage in stages:
            stage_response = api_client.put(
                f"{TEST_BASE_URL}/api/crm/leads/{lead['id']}/stage",
                json={"stage": stage, "notes": f"Moved to {stage}"},
                headers=headers
            )
            
            assert_successful_response(stage_response, 200)
            updated_lead = stage_response.json()
            assert updated_lead['stage'] == stage
        
        # 4. Verify final state
        final_lead = stage_response.json()
        assert final_lead['stage'] == "fechado"
        assert final_lead['is_closed'] == True
        
        # 5. Clean up - delete lead
        delete_response = api_client.delete(
            f"{TEST_BASE_URL}/api/crm/leads/{lead['id']}",
            headers=headers
        )
        
        assert_successful_response(delete_response, 204)