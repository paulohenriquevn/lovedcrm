"""
Email verification fixtures for E2E tests.
"""
import uuid
import pytest
from sqlalchemy import text
from datetime import datetime, timedelta


@pytest.fixture
def test_user_with_unverified_email(db_session):
    """Create a test user with unverified email and return user data + verification token."""
    import secrets
    
    # Generate unique test data
    test_id = str(uuid.uuid4())
    email = f"unverified{test_id[:8]}@example.com"
    verification_token = secrets.token_urlsafe(32)
    
    # Create user directly in database (unverified)
    user_query = text("""
        INSERT INTO users (id, email, hashed_password, full_name, is_active, is_verified, 
                          email_verification_token, email_verification_expires, created_at, updated_at)
        VALUES (:id, :email, :hashed_password, :full_name, true, false, 
                :verification_token, :expires, NOW(), NOW())
        RETURNING id, email, full_name
    """)
    
    # Create organization for the user
    org_id = str(uuid.uuid4())
    org_query = text("""
        INSERT INTO organizations (id, name, slug, owner_id, is_active, created_at, updated_at)
        VALUES (:id, :name, :slug, :owner_id, true, NOW(), NOW())
    """)
    
    # Create organization membership
    member_query = text("""
        INSERT INTO organization_members (id, user_id, organization_id, role, is_active, created_at, updated_at)
        VALUES (:id, :user_id, :org_id, 'owner', true, NOW(), NOW())
    """)
    
    try:
        # Hash password (simplified for testing)
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed_password = pwd_context.hash("testpass123")
        
        # Insert user
        db_session.execute(user_query, {
            "id": test_id,
            "email": email,
            "hashed_password": hashed_password,
            "full_name": "Test Unverified User",
            "verification_token": verification_token,
            "expires": datetime.utcnow() + timedelta(hours=24)
        })
        
        # Insert organization
        db_session.execute(org_query, {
            "id": org_id,
            "name": f"Test Unverified Org {test_id[:8]}",
            "slug": f"test-unverified-org-{test_id[:8]}",
            "owner_id": test_id
        })
        
        # Insert membership
        db_session.execute(member_query, {
            "id": str(uuid.uuid4()),
            "user_id": test_id,
            "org_id": org_id
        })
        
        db_session.commit()
        
        user_data = {
            "id": test_id,
            "email": email,
            "full_name": "Test Unverified User",
            "is_verified": False
        }
        
        return user_data, verification_token
        
    except Exception as e:
        db_session.rollback()
        raise RuntimeError(f"Failed to create test user with unverified email: {e}")


@pytest.fixture
def test_user_with_verified_email(db_session):
    """Create a test user with verified email and return user data + old verification token."""
    import secrets
    
    # Generate unique test data
    test_id = str(uuid.uuid4())
    email = f"verified{test_id[:8]}@example.com"
    old_verification_token = secrets.token_urlsafe(32)
    
    # Create user directly in database (verified)
    user_query = text("""
        INSERT INTO users (id, email, hashed_password, full_name, is_active, is_verified, 
                          email_verification_token, email_verification_expires, created_at, updated_at)
        VALUES (:id, :email, :hashed_password, :full_name, true, true, 
                :verification_token, :expires, NOW(), NOW())
        RETURNING id, email, full_name
    """)
    
    # Create organization for the user
    org_id = str(uuid.uuid4())
    org_query = text("""
        INSERT INTO organizations (id, name, slug, owner_id, is_active, created_at, updated_at)
        VALUES (:id, :name, :slug, :owner_id, true, NOW(), NOW())
    """)
    
    # Create organization membership
    member_query = text("""
        INSERT INTO organization_members (id, user_id, organization_id, role, is_active, created_at, updated_at)
        VALUES (:id, :user_id, :org_id, 'owner', true, NOW(), NOW())
    """)
    
    try:
        # Hash password (simplified for testing)
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed_password = pwd_context.hash("testpass123")
        
        # Insert user
        db_session.execute(user_query, {
            "id": test_id,
            "email": email,
            "hashed_password": hashed_password,
            "full_name": "Test Verified User",
            "verification_token": old_verification_token,
            "expires": datetime.utcnow() + timedelta(hours=24)
        })
        
        # Insert organization
        db_session.execute(org_query, {
            "id": org_id,
            "name": f"Test Verified Org {test_id[:8]}",
            "slug": f"test-verified-org-{test_id[:8]}",
            "owner_id": test_id
        })
        
        # Insert membership
        db_session.execute(member_query, {
            "id": str(uuid.uuid4()),
            "user_id": test_id,
            "org_id": org_id
        })
        
        db_session.commit()
        
        user_data = {
            "id": test_id,
            "email": email,
            "full_name": "Test Verified User",
            "is_verified": True
        }
        
        return user_data, old_verification_token
        
    except Exception as e:
        db_session.rollback()
        raise RuntimeError(f"Failed to create test user with verified email: {e}")
