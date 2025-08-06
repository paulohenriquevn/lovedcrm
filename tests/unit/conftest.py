"""Pytest configuration and fixtures for unit tests."""

import pytest
import sys
import os
from unittest.mock import Mock, MagicMock
from typing import Generator, Any
from uuid import uuid4
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

# Mock SQLAlchemy session for unit tests
@pytest.fixture
def mock_db_session() -> Mock:
    """Mock database session for unit tests."""
    mock_session = Mock(spec=Session)
    mock_session.add = Mock()
    mock_session.commit = Mock()
    mock_session.rollback = Mock()
    mock_session.refresh = Mock()
    mock_session.query = Mock()
    mock_session.close = Mock()
    return mock_session


# Mock user data for tests
@pytest.fixture
def mock_user_data() -> dict:
    """Mock user data for testing."""
    return {
        "id": str(uuid4()),
        "email": "test@example.com",
        "full_name": "Test User",
        "hashed_password": "$2b$12$mock_hash",
        "is_active": True,
        "is_verified": True,
        "organization_id": str(uuid4()),
        "role": "owner",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


# Mock organization data for tests
@pytest.fixture
def mock_organization_data() -> dict:
    """Mock organization data for testing."""
    return {
        "id": str(uuid4()),
        "name": "Test Organization",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


# Mock JWT payload
@pytest.fixture
def mock_jwt_payload() -> dict:
    """Mock JWT payload for testing."""
    org_id = str(uuid4())
    user_id = str(uuid4())
    return {
        "sub": user_id,
        "email": "test@example.com",
        "org_id": org_id,
        "role": "owner",
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "iat": datetime.utcnow(),
        "type": "access"
    }


# Mock settings for tests
@pytest.fixture
def mock_settings() -> Mock:
    """Mock settings configuration for testing."""
    mock_config = Mock()
    mock_config.SECRET_KEY = "test_secret_key_32_characters_long"
    mock_config.ALGORITHM = "HS256"
    mock_config.ACCESS_TOKEN_EXPIRE_MINUTES = 15
    mock_config.REFRESH_TOKEN_EXPIRE_DAYS = 7
    mock_config.DATABASE_URL = "sqlite:///:memory:"
    mock_config.ENVIRONMENT = "test"
    mock_config.DEBUG = True
    mock_config.is_production = False
    mock_config.is_development = False
    mock_config.is_testing = True
    return mock_config


# Mock email service
@pytest.fixture
def mock_email_service() -> Mock:
    """Mock email service for testing."""
    mock_service = Mock()
    mock_service.send_email = Mock(return_value=True)
    mock_service.send_password_reset_email = Mock(return_value=True)
    mock_service.send_verification_email = Mock(return_value=True)
    mock_service.send_invitation_email = Mock(return_value=True)
    return mock_service


# Mock Stripe service
@pytest.fixture
def mock_stripe_service() -> Mock:
    """Mock Stripe service for testing."""
    mock_service = Mock()
    mock_service.create_customer = Mock(return_value={"id": "cus_test123"})
    mock_service.create_subscription = Mock(return_value={"id": "sub_test123"})
    mock_service.cancel_subscription = Mock(return_value=True)
    mock_service.get_customer = Mock(return_value={"id": "cus_test123"})
    return mock_service


# Mock Redis for caching/sessions
@pytest.fixture
def mock_redis() -> Mock:
    """Mock Redis for testing."""
    mock_redis = Mock()
    mock_redis.get = Mock(return_value=None)
    mock_redis.set = Mock(return_value=True)
    mock_redis.delete = Mock(return_value=True)
    mock_redis.exists = Mock(return_value=False)
    return mock_redis


# Mock request object
@pytest.fixture
def mock_request() -> Mock:
    """Mock FastAPI request object."""
    mock_req = Mock()
    mock_req.headers = {"authorization": "Bearer mock_token"}
    mock_req.url = Mock()
    mock_req.url.path = "/test"
    mock_req.client = Mock()
    mock_req.client.host = "127.0.0.1"
    return mock_req


# Mock response object
@pytest.fixture
def mock_response() -> Mock:
    """Mock FastAPI response object."""
    mock_resp = Mock()
    mock_resp.status_code = 200
    mock_resp.headers = {}
    return mock_resp