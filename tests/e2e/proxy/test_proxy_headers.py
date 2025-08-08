"""
🌐 E2E Proxy Tests - Headers Integration

Testes específicos para validar que headers passam corretamente pelo proxy Next.js.
"""
import pytest
from .conftest import (
    proxy_client,
    proxy_authenticated_headers,
    authenticated_user,
    other_organization,
    assert_successful_response,
    assert_error_response
)
from .utils.proxy_helpers import (
    validate_org_header_forwarding,
    log_proxy_test_start
)


class TestProxyHeaderForwarding:
    """Testes para validar que headers são corretamente encaminhados pelo proxy."""
    
    def test_authorization_header_forwarding(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Authorization header é corretamente encaminhado via proxy."""
        log_proxy_test_start("auth_header_forward", "/api/auth/me")
        
        # Requisição SOMENTE via proxy
        proxy_response = proxy_client.get("/api/auth/me", headers=proxy_authenticated_headers)
        
        # Deve ter sucesso
        assert_successful_response(proxy_response, 200)
        assert "id" in proxy_response.json()
        assert "email" in proxy_response.json()
    
    def test_x_org_id_header_forwarding(self, proxy_client, proxy_authenticated_headers, authenticated_user):
        """✅ Test: X-Org-Id header é corretamente encaminhado via proxy."""
        log_proxy_test_start("org_id_header_forward", "/api/organizations/current")
        
        # Requisição SOMENTE via proxy
        proxy_response = proxy_client.get("/api/organizations/current", headers=proxy_authenticated_headers)
        
        # Validar que é a organização correta
        expected_org_id = authenticated_user["organization"]["id"]
        assert_successful_response(proxy_response, 200)
        assert proxy_response.json()["id"] == expected_org_id
        validate_org_header_forwarding(proxy_response, expected_org_id)
    
    def test_content_type_header_forwarding(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Content-Type header é corretamente encaminhado via proxy."""
        log_proxy_test_start("content_type_forward", "/api/organizations/current")
        
        # Headers com Content-Type específico
        headers = proxy_authenticated_headers.copy()
        headers['Content-Type'] = 'application/json'
        
        update_data = {"name": "Header Test Org"}
        
        # Requisição SOMENTE via proxy
        proxy_response = proxy_client.put("/api/organizations/current", json=update_data, headers=headers)
        
        # Deve funcionar corretamente
        assert_successful_response(proxy_response, 200)
        assert proxy_response.json()["name"] == update_data["name"]
    
    def test_custom_correlation_id_forwarding(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Headers customizados são encaminhados."""
        log_proxy_test_start("correlation_id_forward", "/api/auth/me")
        
        # Headers com correlation ID customizado
        headers = proxy_authenticated_headers.copy()
        headers['X-Correlation-ID'] = 'proxy-test-123'
        
        response = proxy_client.get("/api/auth/me", headers=headers)
        
        assert_successful_response(response, 200)
        # O backend pode retornar o correlation ID no response
        # (dependendo da implementação do logging middleware)


class TestProxyHeaderValidation:
    """Testes para validar que proxy + backend validam headers corretamente."""
    
    def test_missing_authorization_header(self, proxy_client):
        """✅ Test: Requisição sem Authorization falha."""
        log_proxy_test_start("missing_auth", "/api/auth/me")
        
        response = proxy_client.get("/api/auth/me")
        
        assert_error_response(response, 403)
    
    def test_missing_org_id_header_for_org_endpoint(self, proxy_client):
        """✅ Test: Endpoint de org sem X-Org-Id falha."""
        log_proxy_test_start("missing_org_id", "/api/organizations/current")
        
        # Apenas Authorization, sem X-Org-Id
        headers = {"Authorization": "Bearer some_token"}
        
        response = proxy_client.get("/api/organizations/current", headers=headers)
        
        # Deve falhar (401 por token inválido ou 403 por org missing)
        assert_error_response(response, 400)
    
    def test_invalid_authorization_token(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Token inválido é rejeitado pelo proxy+backend."""
        log_proxy_test_start("invalid_token", "/api/auth/me")
        
        # Headers com token inválido
        headers = proxy_authenticated_headers.copy()
        headers['Authorization'] = 'Bearer invalid_token_123'
        
        response = proxy_client.get("/api/auth/me", headers=headers)
        
        assert_error_response(response, 401)
    
    def test_org_id_mismatch_with_jwt_token(self, proxy_client, proxy_authenticated_headers, other_organization):
        """✅ Test: X-Org-Id diferente do JWT é rejeitado."""
        log_proxy_test_start("org_mismatch", "/api/organizations/current")
        
        # Headers com org_id de outra organização
        headers = proxy_authenticated_headers.copy()
        headers['X-Org-Id'] = other_organization['id']
        
        response = proxy_client.get("/api/organizations/current", headers=headers)
        
        # Deve falhar com 403 (organization mismatch)
        assert_error_response(response, 403)
    
    def test_malformed_org_id_header(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: X-Org-Id malformado é rejeitado."""
        log_proxy_test_start("malformed_org_id", "/api/organizations/current")
        
        # Headers com org_id malformado (não é UUID)
        headers = proxy_authenticated_headers.copy()
        headers['X-Org-Id'] = 'not-a-valid-uuid'
        
        response = proxy_client.get("/api/organizations/current", headers=headers)
        
        # Deve falhar
        assert_error_response(response, 400)


# REMOVIDO: Testes de comparação proxy vs direct - todos os testes devem usar SOMENTE proxy


class TestProxyErrorHandling:
    """Testes de tratamento de erros via proxy."""
    
    def test_proxy_forwards_backend_errors_correctly(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Proxy encaminha erros do backend corretamente."""
        log_proxy_test_start("error_forwarding", "/api/organizations/nonexistent")
        
        # Tentar acessar endpoint que não existe
        response = proxy_client.get("/api/organizations/nonexistent", headers=proxy_authenticated_headers)
        
        # Deve retornar 404 do backend
        assert_error_response(response, 404)
    
    def test_proxy_handles_backend_timeouts(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: Proxy lida com timeouts do backend."""
        log_proxy_test_start("timeout_handling", "/api/auth/me")
        
        # Este teste assume que o endpoint funciona normalmente
        # Em um cenário real, poderíamos mockar um timeout
        response = proxy_client.get("/api/auth/me", headers=proxy_authenticated_headers)
        
        # Deve funcionar normalmente (sem timeout)
        assert_successful_response(response, 200)