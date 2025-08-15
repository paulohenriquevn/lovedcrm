#!/usr/bin/env python3
"""
Step-by-step template creation test to isolate the exact hanging point.
"""

import requests
import time
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.abspath('.'))

BASE_URL = "http://localhost:8001"

def create_test_user():
    """Create a test user and get auth token."""
    print("🔑 Creating test user...")
    
    unique_email = f"test_step_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email,
        "password": "TestPassword123!",
        "full_name": "Step Test User",
        "terms_accepted": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=10)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ User created successfully")
            return result
        else:
            print(f"❌ Failed to create user: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return None

def test_template_service_directly():
    """Test template service components individually."""
    print("🧪 Testing template service components...")
    
    try:
        # Import and test service components individually
        from api.services.template_service import TemplateService
        from api.models.message_template import MessageTemplate
        from api.models.organization import Organization
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        
        # Database connection
        DATABASE_URL = "postgresql://postgres:postgres@localhost:5434/saas_test"
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        print("✅ Service imports successful")
        
        # Get test organization
        org = db.query(Organization).first()
        if not org:
            print("❌ No organization found")
            return False
            
        print(f"✅ Using organization: {org.id}")
        
        # Create service
        service = TemplateService(db)
        print("✅ Template service created")
        
        # Test _extract_variables method
        test_content = "Hello {{name}}, welcome to {{company}}"
        variables = service._extract_variables(test_content)
        print(f"✅ Variables extraction works: {variables}")
        
        # Test template creation step by step
        print("🔄 Testing template creation step by step...")
        
        import signal
        def timeout_handler(signum, frame):
            raise TimeoutError("Step timed out")
        
        signal.signal(signal.SIGALRM, timeout_handler)
        
        try:
            # Step 1: Extract variables (timeout after 5 seconds)
            signal.alarm(5)
            variables = service._extract_variables("Hello {{test_var}}")
            signal.alarm(0)
            print("✅ Step 1: Variable extraction completed")
            
            # Step 2: Create MessageTemplate object (timeout after 5 seconds) 
            signal.alarm(5)
            template = MessageTemplate(
                organization_id=org.id,
                name="Step Test Template",
                category="test",
                content="Hello {{test_var}}",
                variables=variables
            )
            signal.alarm(0)
            print("✅ Step 2: MessageTemplate object created")
            
            # Step 3: Add to session (timeout after 5 seconds)
            signal.alarm(5)
            db.add(template)
            signal.alarm(0)
            print("✅ Step 3: Added to session")
            
            # Step 4: Commit (timeout after 10 seconds)
            signal.alarm(10)
            db.commit()
            signal.alarm(0)
            print("✅ Step 4: Committed to database")
            
            # Step 5: Refresh (timeout after 5 seconds)
            signal.alarm(5)
            db.refresh(template)
            signal.alarm(0)
            print("✅ Step 5: Refreshed from database")
            
            print(f"✅ Template created successfully: {template.id}")
            
        except TimeoutError as e:
            print(f"❌ TIMEOUT during template creation: {e}")
            return False
        finally:
            signal.alarm(0)
            
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_template_creation_via_api():
    """Test template creation via API with minimal payload."""
    print("🧪 Testing template creation via API...")
    
    auth_data = create_test_user()
    if not auth_data:
        return False
        
    headers = {
        'Authorization': f"Bearer {auth_data['access_token']}",
        'X-Org-Id': auth_data['organization']['id'],
        'Content-Type': 'application/json'
    }
    
    # Use minimal valid template data
    template_data = {
        "name": "Minimal Test",
        "category": "test", 
        "content": "Hello"  # No variables to eliminate regex issues
    }
    
    try:
        print("🔄 Making API call with minimal data...")
        response = requests.post(f"{BASE_URL}/templates/", 
                               json=template_data, 
                               headers=headers, 
                               timeout=15)
        
        if response.status_code == 201:
            print("✅ API call successful with minimal data")
            return True
        else:
            print(f"❌ API call failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ API call timed out even with minimal data")
        return False
    except Exception as e:
        print(f"❌ API call error: {e}")
        return False

def main():
    """Main step-by-step test."""
    print("🚀 Step-by-Step Template Creation Test")
    print("=" * 60)
    
    # Test 1: Direct service components
    service_success = test_template_service_directly()
    
    print("\n" + "-" * 60)
    
    # Test 2: API with minimal data
    api_success = test_template_creation_via_api()
    
    print("\n" + "=" * 60)
    
    if service_success and api_success:
        print("🎉 ALL TESTS PASSED - Template creation works!")
    elif service_success and not api_success:
        print("🔍 SERVICE OK, API HANGS - Issue in router/middleware layer")
    elif not service_success and not api_success:
        print("🔍 SERVICE HANGS - Issue in service/ORM layer")
    else:
        print("🤔 INCONSISTENT RESULTS - Run again")

if __name__ == "__main__":
    main()