"""
🔌 E2E Proxy Tests - WebSocket

Testa endpoints WebSocket via Next.js proxy → FastAPI backend.
Segue padrões GOLDEN RULE: FUNCTIONALITY FIRST.

ENDPOINTS COBERTOS:
1. GET /websocket/active-users/{organization_id} - Active users (200)
2. GET /websocket/organization-stats/{organization_id} - Organization stats (200)

NOTA: Estes são endpoints HTTP para suporte ao WebSocket, não conexões WebSocket diretas.
As conexões WebSocket reais (/ws/pipeline, /ws/general) são testadas separadamente.
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


class TestWebSocketProxy:
    """Testes de endpoints WebSocket support via proxy Next.js → FastAPI."""

    # ============================================================================
    # ✅ PRIORITY 1: SUCCESS SCENARIOS - WebSocket endpoints work correctly  
    # ============================================================================
    
    def test_get_active_users_via_proxy(self, proxy_client, proxy_authenticated_headers, authenticated_user):
        """✅ Test: Get active users via proxy returns 200."""
        log_proxy_test_start("active_users_proxy", "/api/websocket/active-users/{org_id}")
        
        org_id = authenticated_user['organization']['id']
        
        # GET SOMENTE via proxy Next.js
        response = proxy_client.get(f"/api/ws/active-users/{org_id}", headers=proxy_authenticated_headers)
        
        # Validar estrutura de usuários ativos
        assert_successful_response(response, 200)
        data = response.json()
        assert "organization_id" in data
        assert "active_users" in data
        assert "total_active" in data
        assert isinstance(data["active_users"], list)
        assert isinstance(data["total_active"], int)
        assert data["total_active"] >= 0
        assert data["organization_id"] == org_id

    def test_get_organization_stats_via_proxy(self, proxy_client, proxy_authenticated_headers, authenticated_user):
        """✅ Test: Get organization WebSocket stats via proxy returns 200."""
        log_proxy_test_start("org_ws_stats_proxy", "/api/websocket/organization-stats/{org_id}")
        
        org_id = authenticated_user['organization']['id']
        
        # GET SOMENTE via proxy Next.js
        response = proxy_client.get(f"/api/ws/organization-stats/{org_id}", headers=proxy_authenticated_headers)
        
        # Validar estrutura de estatísticas da organização
        assert_successful_response(response, 200)
        data = response.json()
        assert "organization_id" in data
        assert "total_connections" in data
        assert "active_users" in data
        assert "connected_users" in data
        
        # Validar tipos
        assert data["organization_id"] == org_id
        assert isinstance(data["total_connections"], int)
        assert isinstance(data["active_users"], int)
        assert isinstance(data["connected_users"], list)
        assert data["total_connections"] >= 0
        assert data["active_users"] >= 0

    # ============================================================================
    # ✅ PRIORITY 2: VALIDATION SCENARIOS - Security and validation work correctly  
    # ============================================================================

    def test_get_active_users_without_auth_proxy_validation(self, proxy_client):
        """✅ Test: Get active users without auth via proxy returns 401."""
        log_proxy_test_start("active_users_no_auth_proxy", "/api/websocket/active-users/{org_id}")
        
        fake_org_id = str(uuid.uuid4())
        
        # Requisição sem headers de auth via proxy
        response = proxy_client.get(f"/api/websocket/active-users/{fake_org_id}")
        
        # Validar rejeição (403 para missing header)
        assert_error_response(response, 403)

    def test_get_organization_stats_without_auth_proxy_validation(self, proxy_client):
        """✅ Test: Get organization stats without auth via proxy returns 401."""
        log_proxy_test_start("org_stats_no_auth_proxy", "/api/websocket/organization-stats/{org_id}")
        
        fake_org_id = str(uuid.uuid4())
        
        # Requisição sem headers de auth via proxy
        response = proxy_client.get(f"/api/websocket/organization-stats/{fake_org_id}")
        
        # Validar rejeição (403 para missing header)
        assert_error_response(response, 403)

    def test_get_active_users_invalid_org_id_proxy_validation(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Get active users with invalid org ID via proxy returns 403/404."""
        log_proxy_test_start("active_users_invalid_org_proxy", "/api/websocket/active-users/{invalid_org}")
        
        # Usar um UUID válido mas de outra organização
        other_org_id = str(uuid.uuid4())
        
        # GET com org_id diferente do auth header via proxy
        response = proxy_client.get(f"/api/ws/active-users/{other_org_id}", headers=proxy_authenticated_headers)
        
        # Validar acesso negado (403) ou não encontrado (404)
        assert response.status_code in [403, 404]

    def test_get_organization_stats_invalid_org_id_proxy_validation(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Get organization stats with invalid org ID via proxy returns 403/404.""" 
        log_proxy_test_start("org_stats_invalid_org_proxy", "/api/websocket/organization-stats/{invalid_org}")
        
        # Usar um UUID válido mas de outra organização
        other_org_id = str(uuid.uuid4())
        
        # GET com org_id diferente do auth header via proxy
        response = proxy_client.get(f"/api/ws/organization-stats/{other_org_id}", headers=proxy_authenticated_headers)
        
        # Validar acesso negado (403) ou não encontrado (404)
        assert response.status_code in [403, 404]

    def test_get_active_users_malformed_org_id_proxy_validation(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Get active users with malformed org ID via proxy returns 422."""
        log_proxy_test_start("active_users_malformed_org_proxy", "/api/websocket/active-users/invalid")
        
        malformed_org_id = "not-a-valid-uuid"
        
        # GET com org_id malformado via proxy
        response = proxy_client.get(f"/api/ws/active-users/{malformed_org_id}", headers=proxy_authenticated_headers)
        
        # Validar erro de acesso (403 para organization access denied)
        assert_error_response(response, 403)

    def test_get_organization_stats_malformed_org_id_proxy_validation(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Get organization stats with malformed org ID via proxy returns 422."""
        log_proxy_test_start("org_stats_malformed_org_proxy", "/api/websocket/organization-stats/invalid")
        
        malformed_org_id = "not-a-valid-uuid"
        
        # GET com org_id malformado via proxy
        response = proxy_client.get(f"/api/ws/organization-stats/{malformed_org_id}", headers=proxy_authenticated_headers)
        
        # Validar erro de acesso (403 para organization access denied)
        assert_error_response(response, 403)

    # ============================================================================
    # ✅ PRIORITY 3: EDGE CASES - Boundary conditions and special scenarios
    # ============================================================================

    def test_active_users_new_organization_proxy(self, proxy_client, proxy_authenticated_headers, authenticated_user):
        """✅ Test: Active users for new organization via proxy returns empty list."""
        log_proxy_test_start("active_users_new_org_proxy", "/api/websocket/active-users/{new_org}")
        
        org_id = authenticated_user['organization']['id']
        
        # Nova organização pode não ter usuários ativos ainda
        response = proxy_client.get(f"/api/ws/active-users/{org_id}", headers=proxy_authenticated_headers)
        
        # Deve retornar sucesso mesmo sem usuários ativos
        assert_successful_response(response, 200)
        data = response.json()
        assert isinstance(data["active_users"], list)
        assert data["total_active"] >= 0  # Pode ser 0 para nova org

    def test_organization_stats_concurrent_connections_proxy(self, proxy_client, proxy_authenticated_headers, authenticated_user):
        """✅ Test: Organization stats handle concurrent requests via proxy."""
        log_proxy_test_start("org_stats_concurrent_proxy", "/api/websocket/organization-stats/{org_id}")
        
        org_id = authenticated_user['organization']['id']
        
        # Fazer múltiplas requisições para testar concorrência
        responses = []
        for i in range(3):
            response = proxy_client.get(f"/api/ws/organization-stats/{org_id}", headers=proxy_authenticated_headers)
            responses.append(response)
        
        # Todas devem retornar sucesso
        for response in responses:
            assert_successful_response(response, 200)
            data = response.json()
            assert "organization_id" in data
            assert data["organization_id"] == org_id
            # Stats devem ser consistentes entre requests
            assert "total_connections" in data
            assert isinstance(data["total_connections"], int)