#!/usr/bin/env python3
"""
Compare authentication between working leads endpoint and hanging templates endpoint.
"""

import requests
import time

BASE_URL = "http://localhost:8001"

def create_test_user():
    """Create a test user and get auth token."""
    print("🔑 Creating test user...")
    
    unique_email = f"test_comparison_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email,
        "password": "TestPassword123!",
        "full_name": "Comparison Test User",
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

def test_leads_endpoint(auth_data):
    """Test the working leads endpoint."""
    print("🧪 Testing LEADS endpoint (known working)...")
    
    headers = {
        'Authorization': f"Bearer {auth_data['access_token']}",
        'X-Org-Id': auth_data['organization']['id'],
        'Content-Type': 'application/json'
    }
    
    lead_data = {
        "name": "Test Lead",
        "email": "test@example.com",
        "stage": "lead"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/crm/leads/", 
                               json=lead_data, 
                               headers=headers, 
                               timeout=10)
        
        print(f"📊 LEADS Response: {response.status_code}")
        if response.status_code == 201:
            print("✅ LEADS endpoint works perfectly")
            return True
        else:
            print(f"❌ LEADS endpoint failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ LEADS endpoint error: {e}")
        return False

def test_templates_endpoint(auth_data):
    """Test the hanging templates endpoint."""
    print("🧪 Testing TEMPLATES endpoint (hangs)...")
    
    headers = {
        'Authorization': f"Bearer {auth_data['access_token']}",
        'X-Org-Id': auth_data['organization']['id'],
        'Content-Type': 'application/json'
    }
    
    template_data = {
        "name": "Test Template",
        "category": "greeting",
        "content": "Hello {{name}}",
        "is_active": True
    }
    
    try:
        print("🔄 Making request to templates endpoint...")
        response = requests.post(f"{BASE_URL}/templates/", 
                               json=template_data, 
                               headers=headers, 
                               timeout=10)
        
        print(f"📊 TEMPLATES Response: {response.status_code}")
        if response.status_code == 201:
            print("✅ TEMPLATES endpoint works (unexpected!)")
            return True
        else:
            print(f"❌ TEMPLATES endpoint failed: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ TEMPLATES endpoint TIMED OUT - confirmed hang!")
        return False
    except Exception as e:
        print(f"❌ TEMPLATES endpoint error: {e}")
        return False

def test_templates_get_endpoint(auth_data):
    """Test the templates GET endpoint to see if it hangs too."""
    print("🧪 Testing TEMPLATES GET endpoint...")
    
    headers = {
        'Authorization': f"Bearer {auth_data['access_token']}",
        'X-Org-Id': auth_data['organization']['id'],
        'Content-Type': 'application/json'
    }
    
    try:
        print("🔄 Making GET request to templates endpoint...")
        response = requests.get(f"{BASE_URL}/templates/", 
                              headers=headers, 
                              timeout=10)
        
        print(f"📊 TEMPLATES GET Response: {response.status_code}")
        if response.status_code == 200:
            print("✅ TEMPLATES GET endpoint works")
            return True
        else:
            print(f"❌ TEMPLATES GET endpoint failed: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ TEMPLATES GET endpoint TIMED OUT - GET also hangs!")
        return False
    except Exception as e:
        print(f"❌ TEMPLATES GET endpoint error: {e}")
        return False

def main():
    """Main comparison test."""
    print("🚀 Authentication Comparison Test")
    print("=" * 60)
    
    # Create test user
    auth_data = create_test_user()
    if not auth_data:
        print("❌ Cannot proceed without authentication")
        return
    
    print("\n" + "-" * 60)
    
    # Test working endpoint
    leads_success = test_leads_endpoint(auth_data)
    
    print("\n" + "-" * 60)
    
    # Test hanging endpoint (GET first)
    templates_get_success = test_templates_get_endpoint(auth_data)
    
    print("\n" + "-" * 60)
    
    # Test hanging endpoint (POST)
    templates_post_success = test_templates_endpoint(auth_data)
    
    print("\n" + "=" * 60)
    
    if leads_success and not templates_get_success:
        print("🔍 DIAGNOSIS: Templates router has issues with authentication/middleware")
    elif leads_success and templates_get_success and not templates_post_success:
        print("🔍 DIAGNOSIS: Templates POST endpoint specifically has issues")
    elif leads_success and templates_get_success and templates_post_success:
        print("🤔 DIAGNOSIS: Templates work now? Test environment issue?")
    else:
        print("🔍 DIAGNOSIS: Broader authentication or server issues")

if __name__ == "__main__":
    main()