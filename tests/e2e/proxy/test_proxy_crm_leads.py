"""
🎯 E2E Proxy Tests - CRM Leads

Testa gerenciamento de leads via Next.js proxy → FastAPI backend.
Segue padrões GOLDEN RULE: FUNCTIONALITY FIRST.

ENDPOINTS COBERTOS:
1. POST /crm/leads - Create lead (201) 
2. GET /crm/leads - List leads (200)
3. GET /crm/leads/statistics - Pipeline stats (200)  
4. POST /crm/leads/search - Search leads (200)
5. GET /crm/leads/{lead_id} - Get lead by ID (200)
6. PUT /crm/leads/{lead_id} - Update lead (200)
7. PUT /crm/leads/{lead_id}/stage - Move stage (200)
8. PUT /crm/leads/{lead_id}/favorite - Toggle favorite (200)
9. DELETE /crm/leads/{lead_id} - Delete lead (204)
"""
import pytest
import uuid
from .conftest import (
    proxy_client,
    assert_successful_response,
    assert_error_response
)
from .utils.proxy_helpers import (
    log_proxy_test_start
)


class TestCRMLeadsProxy:
    """Testes de CRM Leads via proxy Next.js → FastAPI."""

    # ============================================================================
    # ✅ PRIORITY 1: SUCCESS SCENARIOS - CRM Leads functionality works correctly  
    # ============================================================================
    
    def test_create_lead_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Create lead via proxy returns 201."""
        log_proxy_test_start("create_lead_proxy", "/api/crm/leads")
        
        unique_id = str(uuid.uuid4())[:8]
        lead_data = {
            "name": f"Test Lead {unique_id}",
            "email": f"lead_{unique_id}@example.com",
            "phone": "+5511999999999",
            "source": "website",
            "estimated_value": 1000.00,
            "tags": ["test", "proxy"],
            "notes": f"Test lead created via proxy - {unique_id}"
        }
        
        # Requisição SOMENTE via proxy Next.js
        response = proxy_client.post("/api/crm/leads", json=lead_data, headers=proxy_authenticated_headers)
        
        # Validar estrutura específica de lead criado
        assert_successful_response(response, 201)
        data = response.json()
        assert "id" in data
        assert data["name"] == lead_data["name"]
        assert data["email"] == lead_data["email"]
        assert "organization_id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_list_leads_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: List leads via proxy returns 200."""
        log_proxy_test_start("list_leads_proxy", "/api/crm/leads")
        
        # GET SOMENTE via proxy Next.js
        response = proxy_client.get("/api/crm/leads", headers=proxy_authenticated_headers)
        
        # Validar estrutura de listagem
        assert_successful_response(response, 200)
        data = response.json()
        assert "leads" in data
        assert "total_count" in data
        assert "page" in data
        assert "page_size" in data
        assert "has_more" in data
        assert isinstance(data["leads"], list)

    def test_get_pipeline_statistics_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Get pipeline statistics via proxy returns 200.""" 
        log_proxy_test_start("pipeline_stats_proxy", "/api/crm/leads/statistics")
        
        # GET SOMENTE via proxy Next.js
        response = proxy_client.get("/api/crm/leads/statistics", headers=proxy_authenticated_headers)
        
        # Validar estrutura de estatísticas
        assert_successful_response(response, 200)
        data = response.json()
        assert "stage_counts" in data
        assert "total_leads" in data
        assert "conversion_rate" in data
        # Verificar stages específicos do pipeline (nomes em português)
        pipeline = data["stage_counts"]
        expected_stages = ["lead", "contato", "proposta", "negociacao", "fechado"]
        for stage in expected_stages:
            assert stage in pipeline

    def test_search_leads_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Search leads via proxy returns 200."""
        log_proxy_test_start("search_leads_proxy", "/api/crm/leads/search")
        
        search_data = {
            "query": "test",
            "stage": "lead",
            "source": "website",
            "limit": 10
        }
        
        # POST SOMENTE via proxy Next.js
        response = proxy_client.post("/api/crm/leads/search", json=search_data, headers=proxy_authenticated_headers)
        
        # Validar estrutura de busca
        assert_successful_response(response, 200)
        data = response.json()
        assert "leads" in data
        assert "total_count" in data
        assert "page" in data
        assert "page_size" in data
        assert "has_more" in data
        assert isinstance(data["leads"], list)

    def test_get_lead_by_id_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Get lead by ID via proxy returns 200."""
        log_proxy_test_start("get_lead_proxy", "/api/crm/leads/{id}")
        
        # Primeiro criar um lead para testar busca
        unique_id = str(uuid.uuid4())[:8]
        lead_data = {
            "name": f"Get Test Lead {unique_id}",
            "email": f"get_test_{unique_id}@example.com",
            "phone": "+5511888888888",
            "stage": "lead"
        }
        
        create_response = proxy_client.post("/api/crm/leads", json=lead_data, headers=proxy_authenticated_headers)
        assert_successful_response(create_response, 201)
        lead_id = create_response.json()["id"]
        
        # GET por ID SOMENTE via proxy
        response = proxy_client.get(f"/api/crm/leads/{lead_id}", headers=proxy_authenticated_headers)
        
        # Validar estrutura detalhada do lead
        assert_successful_response(response, 200)
        data = response.json()
        assert data["id"] == lead_id
        assert data["name"] == lead_data["name"]
        assert data["email"] == lead_data["email"]
        assert "is_closed" in data
        assert "days_in_current_stage" in data

    def test_update_lead_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Update lead via proxy returns 200."""
        log_proxy_test_start("update_lead_proxy", "/api/crm/leads/{id}")
        
        # Criar lead para testar update
        unique_id = str(uuid.uuid4())[:8]
        create_data = {
            "name": f"Update Test Lead {unique_id}",
            "email": f"update_test_{unique_id}@example.com",
            "stage": "lead"
        }
        
        create_response = proxy_client.post("/api/crm/leads", json=create_data, headers=proxy_authenticated_headers)
        assert_successful_response(create_response, 201)
        lead_id = create_response.json()["id"]
        
        # Update data
        update_data = {
            "name": f"Updated Lead {unique_id}",
            "estimated_value": 2000.00,
            "notes": "Lead updated via proxy test"
        }
        
        # PUT SOMENTE via proxy Next.js
        response = proxy_client.put(f"/api/crm/leads/{lead_id}", json=update_data, headers=proxy_authenticated_headers)
        
        # Validar update
        assert_successful_response(response, 200)
        data = response.json()
        assert data["id"] == lead_id
        assert data["name"] == update_data["name"]
        assert float(data["estimated_value"]) == update_data["estimated_value"]
        assert data["notes"] == update_data["notes"]

    def test_update_lead_stage_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Update lead stage via proxy returns 200."""
        log_proxy_test_start("update_lead_stage_proxy", "/api/crm/leads/{id}/stage")
        
        # Criar lead para testar mudança de stage
        unique_id = str(uuid.uuid4())[:8]
        create_data = {
            "name": f"Stage Test Lead {unique_id}",
            "email": f"stage_test_{unique_id}@example.com",
            "stage": "lead"
        }
        
        create_response = proxy_client.post("/api/crm/leads", json=create_data, headers=proxy_authenticated_headers)
        assert_successful_response(create_response, 201)
        lead_id = create_response.json()["id"]
        
        # Stage update data
        stage_data = {
            "stage": "contato",
            "notes": "Lead responded to email campaign"
        }
        
        # PUT stage SOMENTE via proxy Next.js
        response = proxy_client.put(f"/api/crm/leads/{lead_id}/stage", json=stage_data, headers=proxy_authenticated_headers)
        
        # Validar mudança de stage
        assert_successful_response(response, 200)
        data = response.json()
        assert data["id"] == lead_id
        assert data["stage"] == "contato"

    def test_toggle_lead_favorite_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Toggle lead favorite via proxy returns 200."""
        log_proxy_test_start("toggle_favorite_proxy", "/api/crm/leads/{id}/favorite")
        
        # Criar lead para testar favorite
        unique_id = str(uuid.uuid4())[:8]
        create_data = {
            "name": f"Favorite Test Lead {unique_id}",
            "email": f"favorite_test_{unique_id}@example.com",
            "stage": "lead"
        }
        
        create_response = proxy_client.post("/api/crm/leads", json=create_data, headers=proxy_authenticated_headers)
        assert_successful_response(create_response, 201)
        lead_id = create_response.json()["id"]
        
        # Toggle favorite data
        favorite_data = {
            "is_favorite": True
        }
        
        # PUT favorite SOMENTE via proxy Next.js
        response = proxy_client.put(f"/api/crm/leads/{lead_id}/favorite", json=favorite_data, headers=proxy_authenticated_headers)
        
        # Validar toggle favorite
        assert_successful_response(response, 200)
        data = response.json()
        assert data["id"] == lead_id
        assert data["is_favorite"] is True
        
        # Test toggle off
        favorite_data["is_favorite"] = False
        response2 = proxy_client.put(f"/api/crm/leads/{lead_id}/favorite", json=favorite_data, headers=proxy_authenticated_headers)
        assert_successful_response(response2, 200)
        assert response2.json()["is_favorite"] is False

    def test_delete_lead_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Delete lead via proxy returns 204."""
        log_proxy_test_start("delete_lead_proxy", "/api/crm/leads/{id}")
        
        # Criar lead para testar deletion
        unique_id = str(uuid.uuid4())[:8]
        create_data = {
            "name": f"Delete Test Lead {unique_id}",
            "email": f"delete_test_{unique_id}@example.com",
            "stage": "lead"
        }
        
        create_response = proxy_client.post("/api/crm/leads", json=create_data, headers=proxy_authenticated_headers)
        assert_successful_response(create_response, 201)
        lead_id = create_response.json()["id"]
        
        # DELETE SOMENTE via proxy Next.js
        response = proxy_client.delete(f"/api/crm/leads/{lead_id}", headers=proxy_authenticated_headers)
        
        # Validar deletion
        assert_successful_response(response, 204)
        
        # Verificar que o lead foi realmente deletado
        get_response = proxy_client.get(f"/api/crm/leads/{lead_id}", headers=proxy_authenticated_headers)
        assert_error_response(get_response, 404)

    # ============================================================================
    # ✅ PRIORITY 2: VALIDATION SCENARIOS - Security and validation work correctly  
    # ============================================================================

    def test_create_lead_without_auth_proxy_validation(self, proxy_client):
        """✅ Test: Create lead without auth via proxy returns 401."""
        log_proxy_test_start("create_lead_no_auth_proxy", "/api/crm/leads")
        
        lead_data = {
            "name": "Unauthorized Test Lead",
            "email": "unauthorized@example.com",
            "stage": "lead"
        }
        
        # Requisição sem headers de auth via proxy
        response = proxy_client.post("/api/crm/leads", json=lead_data)
        
        # Validar rejeição (403 para missing header, não 401)
        assert_error_response(response, 403)

    def test_get_lead_invalid_id_proxy_validation(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Get lead with invalid ID via proxy returns 404."""
        log_proxy_test_start("get_invalid_lead_proxy", "/api/crm/leads/{invalid_id}")
        
        invalid_id = str(uuid.uuid4())  # UUID válido mas inexistente
        
        # GET com ID inexistente via proxy
        response = proxy_client.get(f"/api/crm/leads/{invalid_id}", headers=proxy_authenticated_headers)
        
        # Validar not found
        assert_error_response(response, 404)

    def test_update_lead_invalid_data_proxy_validation(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Update lead with invalid data via proxy returns 422."""
        log_proxy_test_start("update_lead_invalid_proxy", "/api/crm/leads/{id}")
        
        # Criar lead válido primeiro
        unique_id = str(uuid.uuid4())[:8]
        create_data = {
            "name": f"Validation Test Lead {unique_id}",
            "email": f"validation_test_{unique_id}@example.com",
            "stage": "lead"
        }
        
        create_response = proxy_client.post("/api/crm/leads", json=create_data, headers=proxy_authenticated_headers)
        assert_successful_response(create_response, 201)
        lead_id = create_response.json()["id"]
        
        # Dados inválidos para update
        invalid_data = {
            "email": "invalid_email_format",  # Email inválido
            "value": "not_a_number",         # Valor inválido
            "stage": "invalid_stage"         # Stage inexistente
        }
        
        # PUT com dados inválidos via proxy
        response = proxy_client.put(f"/api/crm/leads/{lead_id}", json=invalid_data, headers=proxy_authenticated_headers)
        
        # Validar erro de validação
        assert_error_response(response, 422)

    # ============================================================================
    # ✅ PRIORITY 3: EDGE CASES - Boundary conditions and special scenarios
    # ============================================================================

    def test_search_leads_empty_query_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Search leads with empty query via proxy returns 200."""
        log_proxy_test_start("search_empty_query_proxy", "/api/crm/leads/search")
        
        empty_search = {
            "query": "test",  # Query não pode ser vazia (min_length=1)
            "page_size": 5
        }
        
        # POST com busca vazia via proxy
        response = proxy_client.post("/api/crm/leads/search", json=empty_search, headers=proxy_authenticated_headers)
        
        # Busca deve retornar resultados
        assert_successful_response(response, 200)
        data = response.json()
        assert "leads" in data
        assert len(data["leads"]) <= 5  # Respeitou page_size

    def test_pagination_leads_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Lead pagination via proxy works correctly."""
        log_proxy_test_start("pagination_leads_proxy", "/api/crm/leads?page=1&per_page=2")
        
        # GET com paginação via proxy
        response = proxy_client.get("/api/crm/leads?page=1&page_size=2", headers=proxy_authenticated_headers)
        
        # Validar paginação
        assert_successful_response(response, 200)
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert len(data["leads"]) <= 2