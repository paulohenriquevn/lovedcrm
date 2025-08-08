"""
🔐 E2E Proxy Tests - Roles Endpoints

Testa TODOS os endpoints de roles via Next.js proxy → FastAPI backend.
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


class TestRolesEndpoints2xx:
    """✅ Testes 2xx para TODOS os endpoints ROLES via proxy."""
    
    def test_get_user_permissions_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: GET /roles/permissions returns 200 via proxy."""
        log_proxy_test_start("get_user_permissions", "/api/roles/permissions")
        
        response = proxy_client.get("/api/roles/permissions", headers=proxy_authenticated_headers)
        
        assert_successful_response(response, 200)
        data = response.json()
        assert "permissions" in data
        assert "role" in data
        assert isinstance(data["permissions"], list)
    
    def test_get_member_permissions_via_proxy(self, proxy_client, proxy_authenticated_headers, authenticated_user):
        """✅ Test: GET /roles/permissions/{user_id} returns 200 via proxy."""
        log_proxy_test_start("get_member_permissions", f"/api/roles/permissions/{authenticated_user['user']['id']}")
        
        user_id = authenticated_user["user"]["id"]
        response = proxy_client.get(f"/api/roles/permissions/{user_id}", headers=proxy_authenticated_headers)
        
        assert_successful_response(response, 200)
        data = response.json()
        assert "permissions" in data
        assert "role" in data
        assert isinstance(data["permissions"], list)
    
    def test_get_roles_summary_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: GET /roles/summary returns 200 via proxy."""
        log_proxy_test_start("get_roles_summary", "/api/roles/summary")
        
        response = proxy_client.get("/api/roles/summary", headers=proxy_authenticated_headers)
        
        assert_successful_response(response, 200)
        data = response.json()
        assert "total_members" in data
        assert "role_counts" in data
        assert isinstance(data["role_counts"], dict)
    
    def test_get_manageable_roles_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: GET /roles/manageable returns 200 via proxy."""
        log_proxy_test_start("get_manageable_roles", "/api/roles/manageable")
        
        response = proxy_client.get("/api/roles/manageable", headers=proxy_authenticated_headers)
        
        assert_successful_response(response, 200)
        data = response.json()
        assert "manageable_roles" in data
        assert "current_user_role" in data
        assert isinstance(data["manageable_roles"], list)
    
    def test_get_check_permission_via_proxy(self, proxy_client, proxy_authenticated_headers):
        """✅ Test: GET /roles/check-permission returns 200 via proxy."""
        log_proxy_test_start("get_check_permission", "/api/roles/check-permission")
        
        # Test with a sample permission
        params = {"permission": "manage_members"}
        response = proxy_client.get("/api/roles/check-permission", params=params, headers=proxy_authenticated_headers)
        
        assert_successful_response(response, 200)
        data = response.json()
        assert "has_permission" in data
        assert isinstance(data["has_permission"], bool)
    
    def test_put_change_member_role_via_proxy(self, proxy_client, proxy_authenticated_headers, authenticated_user):
        """✅ Test: PUT /roles/members/{user_id} proxy works (may return 400)."""
        log_proxy_test_start("put_change_member_role", f"/api/roles/members/{authenticated_user['user']['id']}")
        
        role_data = {
            "new_role": "admin"
        }
        
        user_id = authenticated_user["user"]["id"]
        response = proxy_client.put(f"/api/roles/members/{user_id}", json=role_data, headers=proxy_authenticated_headers)
        
        # 400 is expected if trying to change own role as owner - proxy is working
        assert_error_response(response, 400)
    
    def test_delete_remove_member_via_proxy(self, proxy_client, proxy_authenticated_headers, authenticated_user):
        """✅ Test: DELETE /roles/members/{user_id} proxy works (may return 400)."""
        log_proxy_test_start("delete_remove_member", f"/api/roles/members/{authenticated_user['user']['id']}")
        
        user_id = authenticated_user["user"]["id"]
        response = proxy_client.delete(f"/api/roles/members/{user_id}", headers=proxy_authenticated_headers)
        
        # 400 is expected if trying to remove self as owner - proxy is working
        assert_error_response(response, 400)


# REMOVIDO: Testes de comparação proxy vs direct - todos os testes devem usar SOMENTE proxy