#!/usr/bin/env python3
"""
Basic templates integration test
"""

import requests
import json
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.abspath('.'))

BASE_URL = "http://localhost:8001"

def create_test_user():
    """Create a test user and get auth token."""
    print("🔑 Creating test user...")
    
    import time
    unique_email = f"test_templates_{int(time.time())}@example.com"
    
    user_data = {
        "email": unique_email,
        "password": "TestPassword123!",
        "full_name": "Templates Test User",
        "terms_accepted": True
    }
    
    try:
        # Register user
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=10)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ User created successfully")
            print(f"   Auth data keys: {list(result.keys())}")
            return result
        else:
            print(f"❌ Failed to create user: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return None

def test_template_operations(auth_data):
    """Test basic template operations."""
    print("🧪 Testing template CRUD operations...")
    
    if not auth_data:
        print("❌ No auth data")
        return False
    
    print(f"📊 Auth data keys: {list(auth_data.keys())}")
    
    if 'access_token' not in auth_data:
        print("❌ No access_token in auth data")
        return False
    
    if 'organization' not in auth_data:
        print("❌ No organization in auth data")
        return False
    
    headers = {
        'Authorization': f"Bearer {auth_data['access_token']}",
        'X-Org-Id': auth_data['organization']['id'],
        'Content-Type': 'application/json'
    }
    
    # Test 1: Create template
    print("📝 Test 1: Create template")
    template_data = {
        "name": "Test Template",
        "category": "greeting",
        "content": "Olá {{lead_name}}, sou {{user_name}}!",
        "is_active": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/templates/", 
                               json=template_data, 
                               headers=headers, 
                               timeout=10)
        
        if response.status_code == 201:
            template = response.json()
            print(f"✅ Template created: {template['id']}")
            template_id = template['id']
        else:
            print(f"❌ Failed to create template: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating template: {e}")
        return False
    
    # Test 2: List templates
    print("📋 Test 2: List templates")
    try:
        response = requests.get(f"{BASE_URL}/templates/", headers=headers, timeout=10)
        
        if response.status_code == 200:
            templates = response.json()
            print(f"✅ Found {len(templates)} templates")
            
            # Verify our template is in the list
            found = any(t['id'] == template_id for t in templates)
            if found:
                print("✅ Created template found in list")
            else:
                print("❌ Created template not found in list")
                return False
        else:
            print(f"❌ Failed to list templates: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error listing templates: {e}")
        return False
    
    # Test 3: Get specific template
    print("🔍 Test 3: Get specific template")
    try:
        response = requests.get(f"{BASE_URL}/templates/{template_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            template = response.json()
            print(f"✅ Retrieved template: {template['name']}")
        else:
            print(f"❌ Failed to get template: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error getting template: {e}")
        return False
    
    # Test 4: Use template (variable substitution)
    print("🔄 Test 4: Use template with variables")
    context_data = {
        "lead_name": "João Silva",
        "user_name": "Maria Santos"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/templates/{template_id}/use", 
                               json=context_data, 
                               headers=headers, 
                               timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            rendered = result['rendered_content']
            print(f"✅ Template rendered: {rendered}")
            
            # Verify variable substitution worked
            if "João Silva" in rendered and "Maria Santos" in rendered:
                print("✅ Variable substitution working correctly")
            else:
                print("❌ Variable substitution failed")
                return False
        else:
            print(f"❌ Failed to use template: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error using template: {e}")
        return False
    
    # Test 5: Update template
    print("📝 Test 5: Update template")
    update_data = {
        "name": "Updated Test Template",
        "content": "Oi {{lead_name}}, tudo bem? Sou {{user_name}} da {{organization}}!",
        "is_active": False
    }
    
    try:
        response = requests.put(f"{BASE_URL}/templates/{template_id}", 
                              json=update_data, 
                              headers=headers, 
                              timeout=10)
        
        if response.status_code == 200:
            updated_template = response.json()
            print(f"✅ Template updated: {updated_template['name']}")
        else:
            print(f"❌ Failed to update template: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating template: {e}")
        return False
    
    # Test 6: Delete template
    print("🗑️ Test 6: Delete template")
    try:
        response = requests.delete(f"{BASE_URL}/templates/{template_id}", headers=headers, timeout=10)
        
        if response.status_code == 204:
            print("✅ Template deleted successfully")
        else:
            print(f"❌ Failed to delete template: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error deleting template: {e}")
        return False
    
    print("✅ All template operations completed successfully!")
    return True

def main():
    """Main test function."""
    print("🚀 Templates Integration Test")
    print("=" * 50)
    
    # Create test user
    auth_data = create_test_user()
    if not auth_data:
        print("❌ Cannot proceed without authentication")
        return False
    
    # Test template operations
    success = test_template_operations(auth_data)
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Templates System MVP is working correctly")
    else:
        print("❌ TESTS FAILED!")
        print("🔧 Check the implementation")
    
    return success

if __name__ == "__main__":
    main()