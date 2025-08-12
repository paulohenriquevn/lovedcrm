#!/usr/bin/env python3
"""
Debug Assignment Test - Check organization members
"""

import requests
import json
import uuid

TEST_BASE_URL = "http://localhost:8001"

def test_assignment_debug():
    """Debug assignment test - check if there are organization members"""
    
    print("🐛 Debug Assignment Test")
    
    # 1. Register and login
    unique_id = str(uuid.uuid4())[:8]
    register_data = {
        "email": f"assigntest_{unique_id}@example.com",
        "password": "TestPass123!",
        "full_name": "Assignment Test User", 
        "terms_accepted": True
    }
    
    register_response = requests.post(f"{TEST_BASE_URL}/auth/register", json=register_data)
    print(f"Register: {register_response.status_code}")
    
    login_data = {"email": f"assigntest_{unique_id}@example.com", "password": "TestPass123!"}
    login_response = requests.post(f"{TEST_BASE_URL}/auth/login", json=login_data)
    print(f"Login: {login_response.status_code}")
    
    login_result = login_response.json()
    token = login_result['access_token']
    org_id = login_result['organization']['id']
    
    print(f"✅ Authenticated with org: {org_id}")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Org-Id': org_id,
        'Content-Type': 'application/json'
    }
    
    # 2. Check organization members directly
    try:
        # Let's make a simple database query to check organization members
        import os
        import psycopg2
        
        # Connect to test database 
        conn = psycopg2.connect(
            host="localhost",
            port="5434", 
            database="saas_test",
            user="postgres",
            password="postgres"
        )
        
        cursor = conn.cursor()
        
        # Check users table
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = true")
        user_count = cursor.fetchone()[0]
        print(f"📊 Active users in database: {user_count}")
        
        # Check organization_members table
        cursor.execute(f"SELECT COUNT(*) FROM organization_members WHERE organization_id = '{org_id}' AND is_active = true")
        member_count = cursor.fetchone()[0]
        print(f"📊 Active organization members for org {org_id}: {member_count}")
        
        # Check if the current user is a member
        cursor.execute(f"SELECT user_id::text FROM organization_members WHERE organization_id = '{org_id}' AND is_active = true")
        member_user_ids = [row[0] for row in cursor.fetchall()]
        print(f"📊 Member user IDs: {member_user_ids}")
        
        # Get user info
        if member_user_ids:
            cursor.execute(f"SELECT id::text, email FROM users WHERE id::text = ANY(%s)", (member_user_ids,))
            member_users = cursor.fetchall()
            print(f"📊 Member users: {member_users}")
        else:
            member_users = []
            print(f"📊 Member users: {member_users}")
        
        cursor.close()
        conn.close()
        
        if member_count == 0:
            print("🚨 PROBLEM: No organization members found! This would cause assignment to hang.")
            return False
            
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False
    
    # 3. Create a test lead
    lead_data = {
        "name": "Test Lead for Assignment",
        "email": "test@assignment.com",
        "stage": "lead"
    }
    
    create_response = requests.post(f"{TEST_BASE_URL}/crm/leads", json=lead_data, headers=headers)
    print(f"Create lead: {create_response.status_code}")
    
    if create_response.status_code != 201:
        print(f"❌ Lead creation failed: {create_response.text}")
        return False
        
    lead = create_response.json()
    lead_id = lead['id']
    print(f"✅ Created lead: {lead_id}")
    
    # 4. Test assignment analytics (should work now)
    analytics_response = requests.get(f"{TEST_BASE_URL}/crm/leads/assignment-analytics", headers=headers)
    print(f"Assignment analytics: {analytics_response.status_code}")
    
    if analytics_response.status_code == 200:
        analytics = analytics_response.json()
        print(f"📈 Team members in analytics: {analytics['summary']['total_team_members']}")
        if analytics['summary']['total_team_members'] == 0:
            print("🚨 PROBLEM: Analytics shows 0 team members!")
            return False
    else:
        print(f"❌ Analytics failed: {analytics_response.text}")
        return False
    
    # 5. Try assignment (this was hanging before)
    print("⏳ Testing assignment (this might hang)...")
    try:
        assignment_response = requests.post(
            f"{TEST_BASE_URL}/crm/leads/assign-batch",
            json=[lead_id],
            params={"strategy": "workload_balanced"},
            headers=headers,
            timeout=10  # 10 second timeout
        )
        print(f"Assignment: {assignment_response.status_code}")
        
        if assignment_response.status_code == 200:
            assignment_data = assignment_response.json()
            print(f"✅ Assignment succeeded: {assignment_data['total_assigned']} leads assigned")
            return True
        else:
            print(f"❌ Assignment failed: {assignment_response.text}")
            return False
            
    except requests.Timeout:
        print("⏰ Assignment timed out (this was the problem!)")
        return False
    except Exception as e:
        print(f"❌ Assignment exception: {e}")
        return False

if __name__ == "__main__":
    success = test_assignment_debug()
    exit(0 if success else 1)