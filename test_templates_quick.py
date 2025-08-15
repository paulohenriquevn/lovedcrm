#!/usr/bin/env python3
"""
Quick template test using existing working patterns
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def test_basic_template_functionality():
    """Test basic template functionality without complex fixtures."""
    print("🧪 Quick Templates Test")
    
    # Step 1: Register a user (copy from working tests)
    print("1️⃣ Creating test user...")
    import time
    unique_email = f"quicktest_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email, 
        "password": "TestPassword123!",
        "full_name": "Quick Test User",
        "terms_accepted": True
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    if response.status_code != 201:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    auth_data = response.json()
    print("✅ User registered")
    print(f"📊 Auth data keys: {list(auth_data.keys())}")
    
    # Check what we got
    if 'access_token' not in auth_data:
        print(f"❌ No access_token in response: {auth_data}")
        return False
    
    if 'organization' not in auth_data:
        print(f"❌ No organization in response: {auth_data}")
        return False
    
    # Step 2: Get auth headers
    headers = {
        'Authorization': f"Bearer {auth_data['access_token']}",
        'X-Org-Id': auth_data['organization']['id'],
        'Content-Type': 'application/json'
    }
    
    # Step 3: Test template creation (the problematic part)
    print("2️⃣ Testing template creation...")
    template_data = {
        "name": "Quick Test Template",
        "category": "greeting", 
        "content": "Hello {{lead_name}}",
        "is_active": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/templates/", 
                               json=template_data, 
                               headers=headers,
                               timeout=5)  # Short timeout to catch hangs
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📊 Response time: {response.elapsed.total_seconds():.2f}s")
        
        if response.status_code == 201:
            template = response.json()
            print(f"✅ Template created: {template.get('id', 'NO_ID')}")
            return True
        else:
            print(f"❌ Template creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Template creation TIMED OUT (5s) - this is the issue!")
        return False
    except Exception as e:
        print(f"❌ Template creation ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_basic_template_functionality()
    
    if not success:
        print("\n🔍 DEBUGGING INFO:")
        print("- Test is hanging on template creation")
        print("- Likely causes:")
        print("  1. Database connection issue")
        print("  2. Missing table/schema")
        print("  3. Service layer infinite loop")
        print("  4. Dependency injection problem")
        
    else:
        print("\n✅ Templates working correctly!")