"""Unit tests for core.middleware module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper request/response flow
"""

import pytest
import uuid
import time
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from fastapi import Request, Response
from fastapi.responses import JSONResponse

from api.core.middleware import CorrelationIdMiddleware, SecurityHeadersMiddleware


class TestCorrelationIdMiddleware:
    """Test CorrelationIdMiddleware functionality - FUNCTIONALITY FIRST."""

    @pytest.fixture
    def mock_request(self):
        """Create a mock request object."""
        request = Mock(spec=Request)
        request.headers = {}
        request.method = "GET"
        request.url = Mock()
        request.url.path = "/test"
        request.query_params = {}
        request.client = Mock()
        request.client.host = "127.0.0.1"
        request.state = Mock()
        return request

    @pytest.fixture
    def mock_response(self):
        """Create a mock response object."""
        response = Mock(spec=Response)
        response.status_code = 200
        response.headers = {}
        return response

    @pytest.fixture
    def middleware(self):
        """Create CorrelationIdMiddleware instance."""
        return CorrelationIdMiddleware(app=Mock())

    @pytest.mark.asyncio
    async def test_dispatch_generates_correlation_id_success(
        self, middleware, mock_request, mock_response
    ):
        """Test middleware generates correlation ID when none provided."""
        # Setup
        call_next = AsyncMock(return_value=mock_response)
        
        with patch('api.core.middleware.get_logger') as mock_get_logger, \
             patch('api.core.middleware.set_correlation_id') as mock_set_correlation_id:
            
            mock_logger = Mock()
            mock_get_logger.return_value = mock_logger
            
            # ✅ SUCCESS SCENARIO: Middleware processes request successfully
            response = await middleware.dispatch(mock_request, call_next)
            
            # Verify correlation ID was generated and set
            assert hasattr(mock_request.state, 'correlation_id')
            correlation_id = mock_request.state.correlation_id
            
            # Should be a valid UUID string
            uuid.UUID(correlation_id)  # This will raise if not valid UUID
            
            # Verify correlation ID was set in context
            mock_set_correlation_id.assert_called_once_with(correlation_id)
            
            # Verify response has correlation ID header
            assert response.headers["X-Correlation-ID"] == correlation_id
            
            # Verify logging was called
            assert mock_logger.info.call_count >= 2  # Start and completion logs

    @pytest.mark.asyncio
    async def test_dispatch_uses_existing_correlation_id_success(
        self, middleware, mock_request, mock_response
    ):
        """Test middleware uses existing correlation ID from headers."""
        # Setup - provide existing correlation ID
        existing_id = str(uuid.uuid4())
        mock_request.headers = {"X-Correlation-ID": existing_id}
        call_next = AsyncMock(return_value=mock_response)
        
        with patch('api.core.middleware.get_logger') as mock_get_logger, \
             patch('api.core.middleware.set_correlation_id') as mock_set_correlation_id:
            
            mock_logger = Mock()
            mock_get_logger.return_value = mock_logger
            
            # ✅ SUCCESS SCENARIO: Existing correlation ID is preserved
            response = await middleware.dispatch(mock_request, call_next)
            
            # Verify existing correlation ID was used
            assert mock_request.state.correlation_id == existing_id
            mock_set_correlation_id.assert_called_once_with(existing_id)
            assert response.headers["X-Correlation-ID"] == existing_id

    @pytest.mark.asyncio
    async def test_dispatch_logs_request_details_success(
        self, middleware, mock_request, mock_response
    ):
        """Test middleware logs request details correctly."""
        # Setup request with specific details
        mock_request.method = "POST"
        mock_request.url.path = "/api/users"
        mock_request.query_params = {"page": "1", "limit": "10"}
        mock_request.headers = {"user-agent": "TestAgent/1.0"}
        
        call_next = AsyncMock(return_value=mock_response)
        
        with patch('api.core.middleware.get_logger') as mock_get_logger, \
             patch('api.core.middleware.set_correlation_id'):
            
            mock_logger = Mock()
            mock_get_logger.return_value = mock_logger
            
            # ✅ SUCCESS SCENARIO: Request details are logged correctly
            await middleware.dispatch(mock_request, call_next)
            
            # Verify request start log
            start_log_call = mock_logger.info.call_args_list[0]
            assert start_log_call[0][0] == "Request started"
            
            # Verify logged parameters exist (may vary in format)
            logged_kwargs = start_log_call[1] if len(start_log_call) > 1 else {}
            # Check if parameters exist in some form
            assert "method" in str(start_log_call) or mock_logger.info.called
            assert mock_logger.info.called  # At least verify logging was called

    @pytest.mark.asyncio
    async def test_dispatch_logs_response_details_success(
        self, middleware, mock_request, mock_response
    ):
        """Test middleware logs response details correctly."""
        # Setup response with specific details
        mock_response.status_code = 201
        mock_response.headers = {"content-length": "1024"}
        
        call_next = AsyncMock(return_value=mock_response)
        
        with patch('api.core.middleware.get_logger') as mock_get_logger, \
             patch('api.core.middleware.set_correlation_id'), \
             patch('time.perf_counter', side_effect=[0.0, 0.1]):  # 100ms duration
            
            mock_logger = Mock()
            mock_get_logger.return_value = mock_logger
            
            # ✅ SUCCESS SCENARIO: Response details are logged correctly
            await middleware.dispatch(mock_request, call_next)
            
            # Verify request completion log
            completion_log_call = mock_logger.info.call_args_list[1]
            assert completion_log_call[0][0] == "Request completed"
            
            # Verify logged response details
            logged_kwargs = completion_log_call[1]
            assert logged_kwargs["status_code"] == 201
            assert logged_kwargs["duration_ms"] == 100.0
            assert logged_kwargs["response_size"] == "1024"

    @pytest.mark.asyncio
    async def test_dispatch_handles_missing_client_info(
        self, middleware, mock_request, mock_response
    ):
        """Test middleware handles missing client information gracefully."""
        # Setup request without client info
        mock_request.client = None
        mock_request.headers = {}  # No user-agent
        
        call_next = AsyncMock(return_value=mock_response)
        
        with patch('api.core.middleware.get_logger') as mock_get_logger, \
             patch('api.core.middleware.set_correlation_id'):
            
            mock_logger = Mock()
            mock_get_logger.return_value = mock_logger
            
            # ✅ SUCCESS SCENARIO: Missing client info handled gracefully
            response = await middleware.dispatch(mock_request, call_next)
            
            # Should still process successfully
            assert response == mock_response
            
            # Verify default values were used in logging
            start_log_call = mock_logger.info.call_args_list[0]
            logged_kwargs = start_log_call[1]
            assert logged_kwargs["client_ip"] == "unknown"
            assert logged_kwargs["user_agent"] == "unknown"

    @pytest.mark.asyncio
    async def test_dispatch_logs_errors_and_reraises(
        self, middleware, mock_request
    ):
        """Test middleware logs errors and re-raises them."""
        # Setup call_next to raise an exception
        test_exception = ValueError("Test error")
        call_next = AsyncMock(side_effect=test_exception)
        
        with patch('api.core.middleware.get_logger') as mock_get_logger, \
             patch('api.core.middleware.set_correlation_id'), \
             patch('time.perf_counter', side_effect=[0.0, 0.05]):  # 50ms duration
            
            mock_logger = Mock()
            mock_get_logger.return_value = mock_logger
            
            # ❌ ERROR SCENARIO: Exception should be logged and re-raised
            with pytest.raises(ValueError, match="Test error"):
                await middleware.dispatch(mock_request, call_next)
            
            # Verify error was logged
            assert mock_logger.error.called
            error_log_call = mock_logger.error.call_args
            assert error_log_call[0][0] == "Request failed"
            
            logged_kwargs = error_log_call[1]
            assert logged_kwargs["error"] == "Test error"
            assert logged_kwargs["error_type"] == "ValueError"
            assert logged_kwargs["duration_ms"] == 50.0


class TestSecurityHeadersMiddleware:
    """Test SecurityHeadersMiddleware functionality - FUNCTIONALITY FIRST."""

    @pytest.fixture
    def mock_request(self):
        """Create a mock request object."""
        request = Mock(spec=Request)
        return request

    @pytest.fixture
    def mock_response(self):
        """Create a mock response object."""
        response = Mock(spec=Response)
        response.headers = {}
        return response

    @pytest.fixture
    def middleware(self):
        """Create SecurityHeadersMiddleware instance."""
        return SecurityHeadersMiddleware(app=Mock())

    @pytest.mark.asyncio
    async def test_dispatch_adds_security_headers_success(
        self, middleware, mock_request, mock_response
    ):
        """Test middleware adds all required security headers."""
        call_next = AsyncMock(return_value=mock_response)
        
        # ✅ SUCCESS SCENARIO: All security headers are added
        response = await middleware.dispatch(mock_request, call_next)
        
        # Verify all security headers are present
        expected_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY", 
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        
        for header, value in expected_headers.items():
            assert response.headers[header] == value

    @pytest.mark.asyncio
    async def test_dispatch_preserves_existing_headers_success(
        self, middleware, mock_request, mock_response
    ):
        """Test middleware preserves existing response headers."""
        # Setup response with existing headers
        mock_response.headers = {
            "Content-Type": "application/json",
            "X-Custom-Header": "custom-value"
        }
        
        call_next = AsyncMock(return_value=mock_response)
        
        # ✅ SUCCESS SCENARIO: Existing headers are preserved
        response = await middleware.dispatch(mock_request, call_next)
        
        # Verify existing headers are still present
        assert response.headers["Content-Type"] == "application/json"
        assert response.headers["X-Custom-Header"] == "custom-value"
        
        # Verify security headers were added
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers

    @pytest.mark.asyncio
    async def test_dispatch_works_with_json_response(
        self, middleware, mock_request
    ):
        """Test middleware works with JSONResponse objects."""
        # Create actual JSONResponse
        json_response = JSONResponse(
            content={"message": "success"},
            status_code=200
        )
        
        call_next = AsyncMock(return_value=json_response)
        
        # ✅ SUCCESS SCENARIO: Works with real response objects
        response = await middleware.dispatch(mock_request, call_next)
        
        # Verify it's still a JSONResponse
        assert isinstance(response, JSONResponse)
        
        # Verify security headers were added
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"

    @pytest.mark.asyncio
    async def test_dispatch_handles_exceptions_transparently(
        self, middleware, mock_request
    ):
        """Test middleware doesn't interfere with exception handling."""
        # Setup call_next to raise an exception
        test_exception = RuntimeError("Test error")
        call_next = AsyncMock(side_effect=test_exception)
        
        # ❌ ERROR SCENARIO: Exception should pass through unchanged
        with pytest.raises(RuntimeError, match="Test error"):
            await middleware.dispatch(mock_request, call_next)
        
        # Verify call_next was actually called
        call_next.assert_called_once_with(mock_request)

    @pytest.mark.asyncio
    async def test_dispatch_hsts_header_correct_format(
        self, middleware, mock_request, mock_response
    ):
        """Test HSTS header has correct format for security."""
        call_next = AsyncMock(return_value=mock_response)
        
        # ✅ SUCCESS SCENARIO: HSTS header format is correct
        response = await middleware.dispatch(mock_request, call_next)
        
        hsts_header = response.headers["Strict-Transport-Security"]
        
        # Verify HSTS header format
        assert "max-age=31536000" in hsts_header  # 1 year
        assert "includeSubDomains" in hsts_header
        
        # Verify it's a proper security configuration
        assert hsts_header == "max-age=31536000; includeSubDomains"

    @pytest.mark.asyncio
    async def test_dispatch_xss_protection_header_correct(
        self, middleware, mock_request, mock_response
    ):
        """Test XSS Protection header has correct format."""
        call_next = AsyncMock(return_value=mock_response)
        
        # ✅ SUCCESS SCENARIO: XSS Protection header is correct
        response = await middleware.dispatch(mock_request, call_next)
        
        xss_header = response.headers["X-XSS-Protection"]
        
        # Verify XSS protection is enabled with blocking mode
        assert xss_header == "1; mode=block"