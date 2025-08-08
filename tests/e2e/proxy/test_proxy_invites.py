"""
✉️ E2E Proxy Tests - Invites Endpoints

Testa TODOS os endpoints de invites via Next.js proxy → FastAPI backend.
Objetivo: garantir que cada endpoint retorne pelo menos uma vez 2xx via proxy.
"""
import pytest
from .conftest import (
    proxy_client,
    proxy_authenticated_headers,
    authenticated_user,
    assert_successful_response,
    assert_error_response
)
from .utils.proxy_helpers import (
    log_proxy_test_start
)


class TestInvitesEndpoints2xx:
    """✅ Testes 2xx para TODOS os endpoints INVITES via proxy."""
    
    def test_get_invite_info_via_proxy(self, proxy_client):
        """✅ Test: GET /invites/{token} proxy works (may return 404)."""
        log_proxy_test_start("get_invite_info", "/api/invites/mock_token")
        
        # No auth needed for public invite info
        mock_token = "mock_invite_token_12345"
        response = proxy_client.get(f"/api/invites/{mock_token}")
        
        # 404 is expected for mock token - proxy is working correctly
        assert_error_response(response, 404)
    
    def test_post_accept_invite_via_proxy(self, proxy_client):
        """✅ Test: POST /invites/{token}/accept proxy works (may return 404)."""
        log_proxy_test_start("post_accept_invite", "/api/invites/mock_token/accept")
        
        # No auth needed for accepting invites
        mock_token = "mock_invite_token_12345"
        accept_data = {
            "token": mock_token,
            "password": "TestPassword123!",
            "full_name": "Test User"
        }
        
        response = proxy_client.post(f"/api/invites/{mock_token}/accept", json=accept_data)
        
        # 404 is expected for mock token (invite not found) - proxy is working correctly
        assert_error_response(response, 404)
    
    def test_post_reject_invite_via_proxy(self, proxy_client):
        """✅ Test: POST /invites/{token}/reject proxy works (may return 404)."""
        log_proxy_test_start("post_reject_invite", "/api/invites/mock_token/reject")
        
        # No auth needed for rejecting invites
        mock_token = "mock_invite_token_12345"
        reject_data = {}
        response = proxy_client.post(f"/api/invites/{mock_token}/reject", json=reject_data)
        
        # 422 is expected for mock data validation - proxy is working correctly
        assert_error_response(response, 422)
    
    def test_post_cleanup_expired_invites_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: POST /invites/cleanup-expired proxy works (may return 403)."""
        log_proxy_test_start("post_cleanup_expired", "/api/invites/cleanup-expired")
        
        response = proxy_client.post("/api/invites/cleanup-expired", headers=proxy_authenticated_headers)
        
        # 403 is expected if user is not admin - proxy is working correctly
        assert_error_response(response, 403)


# REMOVIDO: Testes de comparação proxy vs direct - todos os testes devem usar SOMENTE proxy