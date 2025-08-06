"""Unit tests for core.database module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper database operations
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

from api.core.database import (
    get_db,
    get_async_db,
    check_database_health,
    get_database_info,
    Base,
    DB_POOL_CONFIG,
)


class TestDatabaseConfiguration:
    """Test database configuration setup - FUNCTIONALITY FIRST."""

    def test_db_pool_config_test_environment(self):
        """Test database pool configuration values are set correctly."""
        # ✅ SUCCESS SCENARIO: DB_POOL_CONFIG has valid configuration
        # Since the config is set at import time based on actual settings.ENVIRONMENT,
        # we just verify it has the expected structure and reasonable values
        assert "pool_size" in DB_POOL_CONFIG
        assert "max_overflow" in DB_POOL_CONFIG
        assert "pool_timeout" in DB_POOL_CONFIG
        assert "pool_pre_ping" in DB_POOL_CONFIG
        assert "pool_recycle" in DB_POOL_CONFIG
        
        # Verify values are reasonable
        assert DB_POOL_CONFIG["pool_size"] > 0
        assert DB_POOL_CONFIG["max_overflow"] > 0
        assert DB_POOL_CONFIG["pool_timeout"] > 0
        assert isinstance(DB_POOL_CONFIG["pool_pre_ping"], bool)
        assert DB_POOL_CONFIG["pool_recycle"] > 0

    def test_db_pool_config_production_environment(self):
        """Test database pool configuration for production environment."""
        with patch('api.core.database.settings') as mock_settings:
            mock_settings.ENVIRONMENT = "production"
            
            # Reload module to get production config
            import importlib
            import api.core.database
            importlib.reload(api.core.database)
            
            # ✅ SUCCESS SCENARIO: Production environment has robust pool config
            assert api.core.database.DB_POOL_CONFIG["pool_size"] == 20
            assert api.core.database.DB_POOL_CONFIG["max_overflow"] == 30
            assert api.core.database.DB_POOL_CONFIG["pool_timeout"] == 30
            assert api.core.database.DB_POOL_CONFIG["pool_pre_ping"] is True
            assert api.core.database.DB_POOL_CONFIG["pool_recycle"] == 3600

    def test_base_declarative_class(self):
        """Test Base declarative class is properly configured."""
        # ✅ SUCCESS SCENARIO: Base class is available and functional
        assert Base is not None
        assert hasattr(Base, 'metadata')
        assert hasattr(Base, 'registry')


class TestSyncDatabaseSession:
    """Test synchronous database session management - FUNCTIONALITY FIRST."""

    @patch('api.core.database.SessionLocal')
    def test_get_db_success_scenario(self, mock_session_local):
        """Test get_db dependency yields database session successfully."""
        # Setup mock session
        mock_session = Mock()
        mock_session_local.return_value = mock_session
        
        # ✅ SUCCESS SCENARIO: Database session is provided and managed correctly
        db_generator = get_db()
        
        # Get the session from generator
        session = next(db_generator)
        assert session == mock_session
        
        # Close the generator to trigger cleanup
        try:
            next(db_generator)
        except StopIteration:
            pass  # Expected behavior
        
        # Verify session management
        mock_session.commit.assert_called_once()
        mock_session.close.assert_called_once()

    @patch('api.core.database.SessionLocal')
    @patch('api.core.database.logger')
    def test_get_db_commits_on_success(self, mock_logger, mock_session_local):
        """Test get_db commits transaction on successful operation."""
        # Setup mock session
        mock_session = Mock()
        mock_session_local.return_value = mock_session
        
        # ✅ SUCCESS SCENARIO: Transaction is committed on success
        db_generator = get_db()
        session = next(db_generator)
        
        # Simulate successful operation by closing generator normally
        try:
            next(db_generator)
        except StopIteration:
            pass
        
        # Verify commit was called
        mock_session.commit.assert_called_once()
        mock_logger.debug.assert_called_with("✅ Database transaction committed successfully")

    @patch('api.core.database.SessionLocal')
    @patch('api.core.database.logger')
    def test_get_db_rollbacks_on_exception(self, mock_logger, mock_session_local):
        """Test get_db rolls back transaction on exception."""
        # Setup mock session that raises exception on commit
        mock_session = Mock()
        mock_session.commit.side_effect = SQLAlchemyError("Test error")
        mock_session_local.return_value = mock_session
        
        # ❌ ERROR SCENARIO: Transaction is rolled back on exception
        db_generator = get_db()
        session = next(db_generator)
        
        # Simulate exception during commit
        with pytest.raises(SQLAlchemyError):
            try:
                next(db_generator)
            except StopIteration:
                pass
        
        # Verify rollback was called
        mock_session.rollback.assert_called_once()
        mock_session.close.assert_called_once()

    @patch('api.core.database.SessionLocal')
    def test_get_db_always_closes_session(self, mock_session_local):
        """Test get_db always closes session even on exceptions."""
        # Setup mock session
        mock_session = Mock()
        mock_session.commit.side_effect = Exception("Test error")
        mock_session_local.return_value = mock_session
        
        # ✅ SUCCESS SCENARIO: Session is always closed
        db_generator = get_db()
        session = next(db_generator)
        
        # Even with exception, session should be closed
        with pytest.raises(Exception):
            try:
                next(db_generator)
            except StopIteration:
                pass
        
        # Verify session was closed
        mock_session.close.assert_called_once()


class TestAsyncDatabaseSession:
    """Test asynchronous database session management - FUNCTIONALITY FIRST."""

    @pytest.mark.asyncio
    @patch('api.core.database.AsyncSessionLocal')
    async def test_get_async_db_success_scenario(self, mock_async_session_local):
        """Test get_async_db dependency yields async session successfully."""
        # Setup mock async session
        mock_session = Mock()
        mock_async_session_local.return_value.__aenter__.return_value = mock_session
        mock_async_session_local.return_value.__aexit__.return_value = None
        
        # ✅ SUCCESS SCENARIO: Async database session is provided
        async_gen = get_async_db()
        session = await async_gen.__anext__()
        
        assert session == mock_session

    @pytest.mark.asyncio
    async def test_get_async_db_unavailable_raises_error(self):
        """Test get_async_db raises error when async session is unavailable."""
        with patch('api.core.database.AsyncSessionLocal', None):
            # ❌ ERROR SCENARIO: Should raise RuntimeError when async session unavailable
            with pytest.raises(RuntimeError, match="Async database session not available"):
                async_gen = get_async_db()
                await async_gen.__anext__()


class TestDatabaseHealthCheck:
    """Test database health check functionality - FUNCTIONALITY FIRST."""

    @patch('api.core.database.SessionLocal')
    def test_check_database_health_success(self, mock_session_local):
        """Test database health check returns True for healthy database."""
        # Setup mock session that executes query successfully
        mock_session = Mock()
        mock_session.execute.return_value = Mock()  # Successful query
        mock_session_local.return_value = mock_session
        
        # ✅ SUCCESS SCENARIO: Healthy database returns True
        result = check_database_health()
        
        assert result is True
        mock_session.execute.assert_called_once()
        mock_session.close.assert_called_once()

    @patch('api.core.database.SessionLocal')
    @patch('api.core.database.logger')
    def test_check_database_health_failure(self, mock_logger, mock_session_local):
        """Test database health check returns False for unhealthy database."""
        # Setup mock session that raises exception
        mock_session = Mock()
        mock_session.execute.side_effect = SQLAlchemyError("Connection failed")
        mock_session_local.return_value = mock_session
        
        # ❌ ERROR SCENARIO: Unhealthy database returns False
        result = check_database_health()
        
        assert result is False
        mock_logger.error.assert_called_once()
        
        # Verify error logging details
        log_call = mock_logger.error.call_args
        assert log_call[0][0] == "Database health check failed"
        assert log_call[1]["extra"]["error"] == "Connection failed"
        assert log_call[1]["extra"]["error_type"] == "SQLAlchemyError"

    @patch('api.core.database.SessionLocal')
    def test_check_database_health_handles_any_exception(self, mock_session_local):
        """Test database health check handles any type of exception."""
        # Setup mock session that raises generic exception
        mock_session_local.side_effect = RuntimeError("Unexpected error")
        
        # ✅ SUCCESS SCENARIO: Any exception results in False (no crash)
        result = check_database_health()
        
        assert result is False


class TestDatabaseInfo:
    """Test database information retrieval - FUNCTIONALITY FIRST."""

    @patch('api.core.database.engine')
    def test_get_database_info_success(self, mock_engine):
        """Test get_database_info returns pool information successfully."""
        # Setup mock pool with all attributes
        mock_pool = Mock()
        mock_pool.size.return_value = 20
        mock_pool.checkedin.return_value = 15
        mock_pool.checkedout.return_value = 5
        mock_pool.overflow.return_value = 2
        mock_pool.invalid.return_value = 0
        mock_engine.pool = mock_pool
        
        # ✅ SUCCESS SCENARIO: Pool information is retrieved correctly
        info = get_database_info()
        
        expected_info = {
            "pool_size": 20,
            "checked_in": 15,
            "checked_out": 5,
            "overflow": 2,
            "invalid": 0
        }
        
        assert info == expected_info

    @patch('api.core.database.engine')
    def test_get_database_info_partial_attributes(self, mock_engine):
        """Test get_database_info handles missing pool attributes."""
        # Setup mock pool with only some attributes
        mock_pool = Mock()
        mock_pool.size.return_value = 10
        # Missing other attributes
        delattr(mock_pool, 'checkedin')
        delattr(mock_pool, 'checkedout') 
        delattr(mock_pool, 'overflow')
        delattr(mock_pool, 'invalid')
        mock_engine.pool = mock_pool
        
        # ✅ SUCCESS SCENARIO: Missing attributes default to 0
        info = get_database_info()
        
        assert info["pool_size"] == 10
        assert info["checked_in"] == 0
        assert info["checked_out"] == 0
        assert info["overflow"] == 0
        assert info["invalid"] == 0

    @patch('api.core.database.engine')
    def test_get_database_info_exception_handling(self, mock_engine):
        """Test get_database_info handles exceptions gracefully."""
        # Setup mock engine that raises exception
        mock_engine.pool = Mock()
        mock_engine.pool.size.side_effect = Exception("Pool error")
        
        # ✅ SUCCESS SCENARIO: Exception results in default values (no crash)
        info = get_database_info()
        
        expected_default = {
            "pool_size": 0,
            "checked_in": 0,
            "checked_out": 0,
            "overflow": 0,
            "invalid": 0
        }
        
        assert info == expected_default

    @patch('api.core.database.engine')
    def test_get_database_info_no_pool_attributes(self, mock_engine):
        """Test get_database_info when pool has no expected attributes."""
        # Setup mock pool without expected methods
        mock_pool = Mock(spec=[])  # Empty spec means no attributes
        mock_engine.pool = mock_pool
        
        # ✅ SUCCESS SCENARIO: No pool attributes results in all zeros
        info = get_database_info()
        
        expected_info = {
            "pool_size": 0,
            "checked_in": 0,
            "checked_out": 0,
            "overflow": 0,
            "invalid": 0
        }
        
        assert info == expected_info