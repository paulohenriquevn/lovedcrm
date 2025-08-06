"""Unit tests for OrganizationContextMiddleware - BaseHTTPMiddleware Implementation.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with multi-tenant security
"""

import pytest
import uuid
import json
from unittest.mock import Mock, AsyncMock, patch
from fastapi import Request, HTTPException, Response
from fastapi.responses import JSONResponse

from api.core.organization_middleware import OrganizationContextMiddleware


class TestOrganizationContextMiddleware:
    """Test OrganizationContextMiddleware - CRITICAL SECURITY COMPONENT."""

    @pytest.fixture
    def mock_app(self):
        """Create a mock FastAPI app."""
        return AsyncMock()

    @pytest.fixture
    def middleware(self, mock_app):
        """Create OrganizationContextMiddleware instance."""
        return OrganizationContextMiddleware(mock_app)

    @pytest.fixture
    def mock_request(self):
        """Create a mock Request."""
        request = Mock(spec=Request)
        request.url = Mock()
        request.headers = {}
        return request

    @pytest.fixture
    def mock_call_next(self):
        """Create a mock call_next function."""
        async def call_next(request):
            return Response("OK", status_code=200)
        return call_next

    @pytest.fixture
    def valid_jwt_payload(self):
        """Valid JWT payload with org_id."""
        return {
            "user_id": str(uuid.uuid4()),
            "org_id": str(uuid.uuid4()),
            "exp": 9999999999,  # Far future
        }

    # ✅ PRIORITY 1: SUCCESS SCENARIOS (2XX) - Public Routes
    
    @pytest.mark.asyncio
    async def test_public_routes_bypass_middleware_success(
        self, middleware, mock_request, mock_call_next
    ):
        """✅ Test public routes bypass middleware successfully."""
        public_routes = [
            "/",
            "/health",
            "/docs",
            "/auth/login",
            "/auth/register",
            "/billing/available-plans",
            "/billing/stripe-webhook",
            "/invites/token123",
        ]
        
        for route in public_routes:
            # Set up mock request
            mock_request.url.path = route
            
            # ✅ SUCCESS: Public route should pass through without validation
            response = await middleware.dispatch(mock_request, mock_call_next)
            
            # Verify response is successful (call_next was called)
            assert response.status_code == 200
            assert response.body == b"OK"

    @pytest.mark.asyncio
    async def test_auth_only_routes_bypass_org_validation_success(
        self, middleware, mock_request, mock_call_next
    ):
        """✅ Test auth-only routes bypass org validation successfully."""
        auth_only_routes = [
            "/users/me/organizations",  # User's organizations list (cross-org)
            "/auth/me",
            "/auth/logout",
            "/auth/refresh",
        ]
        
        for route in auth_only_routes:
            # Set up mock request
            mock_request.url.path = route
            
            # ✅ SUCCESS: Auth-only route should pass through without org validation
            response = await middleware.dispatch(mock_request, mock_call_next)
            
            # Verify response is successful (call_next was called)
            assert response.status_code == 200
            assert response.body == b"OK"

    @pytest.mark.asyncio
    async def test_valid_organization_access_success(
        self, middleware, mock_request, mock_call_next, valid_jwt_payload
    ):
        """✅ Test valid organization access succeeds."""
        org_id = valid_jwt_payload["org_id"]
        
        # Set up mock request with valid headers
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {
            "Authorization": f"Bearer valid_token",
            "X-Org-Id": org_id
        }
        
        with patch('api.core.organization_middleware.verify_token') as mock_verify_token:
            mock_verify_token.return_value = valid_jwt_payload
            
            # ✅ SUCCESS: Valid org access should succeed
            response = await middleware.dispatch(mock_request, mock_call_next)
            
            # Verify response is successful (call_next was called)
            assert response.status_code == 200
            assert response.body == b"OK"
            
            # Verify token was validated
            mock_verify_token.assert_called_once_with("valid_token", "access")

    # ✅ PRIORITY 2: SECURITY SCENARIOS (4XX) - Critical Security Tests

    @pytest.mark.asyncio
    async def test_missing_auth_header_returns_403(
        self, middleware, mock_request, mock_call_next
    ):
        """❌ Test missing Authorization header returns 403."""
        # Set up mock request without Authorization header
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {}  # No headers
        
        # ❌ SECURITY: Should return 403 for missing auth
        response = await middleware.dispatch(mock_request, mock_call_next)
        
        # Verify response is 403 error
        assert response.status_code == 403
        assert isinstance(response, JSONResponse)
        
        # Check error message
        response_data = json.loads(response.body.decode())
        assert "Missing or invalid authorization header" in response_data["detail"]

    @pytest.mark.asyncio
    async def test_missing_org_id_header_returns_400(
        self, middleware, mock_request, mock_call_next
    ):
        """❌ Test missing X-Org-Id header returns 400."""
        # Set up mock request with Authorization but missing X-Org-Id
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {
            "Authorization": "Bearer valid_token"
            # Missing X-Org-Id header
        }
        
        # ❌ SECURITY: Should return 400 for missing X-Org-Id
        response = await middleware.dispatch(mock_request, mock_call_next)
        
        # Verify response is 400 error
        assert response.status_code == 400
        assert isinstance(response, JSONResponse)
        
        # Check error message
        response_data = json.loads(response.body.decode())
        assert "Missing X-Org-Id header" in response_data["detail"]

    @pytest.mark.asyncio
    async def test_organization_mismatch_returns_403(
        self, middleware, mock_request, mock_call_next, valid_jwt_payload
    ):
        """❌ Test organization mismatch returns 403 - CRITICAL SECURITY TEST."""
        jwt_org_id = valid_jwt_payload["org_id"]
        different_org_id = str(uuid.uuid4())  # Different org ID
        
        # Set up mock request with mismatched org IDs
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {
            "Authorization": "Bearer valid_token",
            "X-Org-Id": different_org_id  # DIFFERENT org ID than JWT
        }
        
        with patch('api.core.organization_middleware.verify_token') as mock_verify_token:
            mock_verify_token.return_value = valid_jwt_payload
            
            # ❌ CRITICAL SECURITY: Organization mismatch should return 403
            response = await middleware.dispatch(mock_request, mock_call_next)
            
            # Verify response is 403 error
            assert response.status_code == 403
            assert isinstance(response, JSONResponse)
            
            # Check error message
            response_data = json.loads(response.body.decode())
            assert "organization mismatch" in response_data["detail"]

    @pytest.mark.asyncio
    async def test_invalid_jwt_returns_401(
        self, middleware, mock_request, mock_call_next
    ):
        """❌ Test invalid JWT returns 401."""
        org_id = str(uuid.uuid4())
        
        # Set up mock request
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {
            "Authorization": "Bearer invalid_token",
            "X-Org-Id": org_id
        }
        
        with patch('api.core.organization_middleware.verify_token') as mock_verify_token:
            # Simulate invalid token
            mock_verify_token.side_effect = HTTPException(status_code=401, detail="Invalid authentication token")
            
            # ❌ SECURITY: Invalid JWT should return 401
            response = await middleware.dispatch(mock_request, mock_call_next)
            
            # Verify response is 401 error
            assert response.status_code == 401
            assert isinstance(response, JSONResponse)
            
            # Check error message
            response_data = json.loads(response.body.decode())
            assert "Invalid authentication token" in response_data["detail"]

    @pytest.mark.asyncio
    async def test_jwt_missing_org_id_returns_401(
        self, middleware, mock_request, mock_call_next
    ):
        """❌ Test JWT missing org_id returns 401."""
        org_id = str(uuid.uuid4())
        
        # Set up mock request
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {
            "Authorization": "Bearer token_without_org",
            "X-Org-Id": org_id
        }
        
        # JWT payload without org_id
        jwt_payload_no_org = {
            "user_id": str(uuid.uuid4()),
            # Missing org_id
            "exp": 9999999999,
        }
        
        with patch('api.core.organization_middleware.verify_token') as mock_verify_token:
            mock_verify_token.return_value = jwt_payload_no_org
            
            # ❌ SECURITY: JWT without org_id should return 401
            response = await middleware.dispatch(mock_request, mock_call_next)
            
            # Verify response is 401 error
            assert response.status_code == 401
            assert isinstance(response, JSONResponse)
            
            # Check error message
            response_data = json.loads(response.body.decode())
            assert "missing organization context" in response_data["detail"]

    @pytest.mark.asyncio
    async def test_invalid_uuid_format_returns_400(
        self, middleware, mock_request, mock_call_next, valid_jwt_payload
    ):
        """❌ Test invalid UUID format returns 400."""
        # Set up mock request with invalid UUID
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {
            "Authorization": "Bearer valid_token",
            "X-Org-Id": "invalid-uuid-format"  # Invalid UUID
        }
        
        with patch('api.core.organization_middleware.verify_token') as mock_verify_token:
            mock_verify_token.return_value = valid_jwt_payload
            
            # ❌ SECURITY: Invalid UUID should return 400
            response = await middleware.dispatch(mock_request, mock_call_next)
            
            # Verify response is 400 error
            assert response.status_code == 400
            assert isinstance(response, JSONResponse)
            
            # Check error message
            response_data = json.loads(response.body.decode())
            assert "Invalid organization ID format" in response_data["detail"]

    # 🔒 SECURE BY DEFAULT TESTS

    def test_secure_by_default_route_classification(self, middleware):
        """🔒 Test secure by default - new routes are automatically protected."""
        # Test that unknown routes are NOT in public or auth_only lists
        unknown_routes = [
            "/new-feature/items",
            "/future-api/endpoint",
            "/admin/super-secret",
            "/api/v2/new-feature",
            "/organizations/items",  # This should require org validation
            "/members/list",  # This should require org validation
        ]
        
        for route in unknown_routes:
            # ✅ New routes should NOT be public
            is_public = middleware._is_public_route(route)
            assert not is_public, f"Route {route} should NOT be public (secure by default)"
            
            # ✅ New routes should NOT be auth-only 
            is_auth_only = middleware._is_auth_only_route(route)
            assert not is_auth_only, f"Route {route} should NOT be auth-only (requires org validation)"
            
            # ✅ Therefore, new routes REQUIRE organization validation (secure by default)

    def test_public_routes_configuration(self, middleware):
        """✅ Test public routes are correctly configured."""
        expected_public_routes = [
            "/",
            "/health", 
            "/docs",
            "/auth/login",
            "/auth/register",
            "/billing/available-plans",
            "/billing/stripe-webhook",
            "/invites/token123",
        ]
        
        for route in expected_public_routes:
            assert middleware._is_public_route(route), f"Route {route} should be public"

    def test_auth_only_routes_configuration(self, middleware):
        """✅ Test auth-only routes are correctly configured."""
        expected_auth_only_routes = [
            "/users/me/organizations",  # User's organizations list (cross-org)
            "/auth/me",
            "/auth/logout",
            "/auth/refresh",
        ]
        
        for route in expected_auth_only_routes:
            assert middleware._is_auth_only_route(route), f"Route {route} should be auth-only"

    def test_route_matching_edge_cases(self, middleware):
        """✅ Test route matching handles edge cases correctly."""
        # Test root path exactly
        assert middleware._is_public_route("/")
        assert not middleware._is_public_route("/something")  # Should NOT match "/" - secure by default
        
        # Test prefix matching for auth routes
        assert middleware._is_public_route("/auth/login")
        assert middleware._is_public_route("/auth/register")
        assert not middleware._is_public_route("/authenticate")  # Not prefixed correctly
        
        # Test prefix matching for auth-only
        assert middleware._is_auth_only_route("/users/me/organizations")  # This is auth-only
        assert not middleware._is_auth_only_route("/users/me")  # This requires org validation
        
        # Test that /users/me is NOT public and NOT auth-only (requires org validation)
        assert not middleware._is_public_route("/users/me")
        assert not middleware._is_auth_only_route("/users/me")


class TestOrganizationMiddlewareEdgeCases:
    """Test edge cases and attack scenarios."""

    @pytest.fixture
    def middleware(self):
        """Create middleware instance."""
        return OrganizationContextMiddleware(AsyncMock())

    @pytest.fixture
    def mock_request(self):
        """Create a mock Request."""
        request = Mock(spec=Request)
        request.url = Mock()
        request.headers = {}
        return request

    @pytest.fixture
    def mock_call_next(self):
        """Create a mock call_next function."""
        async def call_next(request):
            return Response("OK", status_code=200)
        return call_next

    @pytest.mark.asyncio
    async def test_malformed_bearer_token_returns_403(
        self, middleware, mock_request, mock_call_next
    ):
        """❌ Test malformed Bearer token returns 403."""
        # Set up mock request with malformed Authorization header
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {
            "Authorization": "NotBearer invalid_format",  # Malformed
            "X-Org-Id": str(uuid.uuid4())
        }
        
        # ❌ SECURITY: Should return 403 for malformed auth header
        response = await middleware.dispatch(mock_request, mock_call_next)
        
        # Verify response is 403 error
        assert response.status_code == 403
        assert isinstance(response, JSONResponse)
        
        # Check error message
        response_data = json.loads(response.body.decode())
        assert "Missing or invalid authorization header" in response_data["detail"]

    @pytest.mark.asyncio
    async def test_empty_bearer_token_returns_403(
        self, middleware, mock_request, mock_call_next
    ):
        """❌ Test empty Bearer token returns 403."""
        # Set up mock request with empty Bearer token
        mock_request.url.path = "/organizations/items"
        mock_request.headers = {
            "Authorization": "Bearer",  # No space after Bearer - triggers invalid header
            "X-Org-Id": str(uuid.uuid4())
        }
        
        # ❌ SECURITY: Should return 403 for empty token
        response = await middleware.dispatch(mock_request, mock_call_next)
        
        # Verify response is 403 error
        assert response.status_code == 403
        assert isinstance(response, JSONResponse)
        
        # Check error message
        response_data = json.loads(response.body.decode())
        assert "Missing or invalid authorization header" in response_data["detail"]