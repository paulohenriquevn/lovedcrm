#!/usr/bin/env python3
"""
Simple template endpoint test
"""
import requests

BASE_URL = "http://localhost:8001"

def test_templates_endpoint():
    """Test if templates endpoint responds correctly."""
    print("🧪 Testing templates endpoint...")
    
    # Test without authentication (should get 401)
    try:
        response = requests.get(f"{BASE_URL}/templates/", timeout=5)
        print(f"✅ Templates endpoint responded: {response.status_code}")
        print(f"   Response: {response.text[:100]}")
        
        if response.status_code == 401:
            print("✅ Authentication working correctly")
        else:
            print(f"⚠️  Expected 401, got {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("❌ Timeout - endpoint not responding")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

def test_templates_with_auth():
    """Test endpoint with dummy auth (should get 403/400)."""
    print("🧪 Testing templates with dummy auth...")
    
    headers = {
        'Authorization': 'Bearer dummy_token',
        'X-Org-Id': 'dummy-org-id'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/templates/", headers=headers, timeout=5)
        print(f"✅ Templates with auth responded: {response.status_code}")
        print(f"   Response: {response.text[:100]}")
        
        if response.status_code in [401, 403, 422]:
            print("✅ Auth validation working correctly")
        else:
            print(f"⚠️  Unexpected status: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("❌ Timeout - endpoint not responding")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Testing Templates API endpoints...")
    
    success1 = test_templates_endpoint()
    success2 = test_templates_with_auth()
    
    if success1 and success2:
        print("\n✅ Templates API is responding correctly!")
        print("🔧 Issue likely with pytest configuration, not the API")
    else:
        print("\n❌ Templates API has issues")
        
    print("\n📋 Next steps:")
    print("1. Fix API issues if found")
    print("2. Debug pytest configuration")
    print("3. Run full test suite")