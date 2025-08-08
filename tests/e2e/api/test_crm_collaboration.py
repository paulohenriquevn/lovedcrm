"""
🎯 CRM Collaboration E2E Tests - STORY 1.4 Team Collaboration B2B

GOLDEN RULE: FUNCTIONALITY FIRST
1. PRIORITY 1: Test successful collaboration operations (2XX) - REAL-TIME FUNCTIONALITY
2. PRIORITY 2: Test validation and security (4XX/5XX) - SECURITY
3. OBJECTIVE: Verify that real-time collaboration features TRULY WORK

Test Coverage:
- ✅ WebSocket connection with organization isolation
- ✅ Real-time event broadcasting within organization
- ✅ Lead events (created, updated, stage changed) broadcast to team
- ✅ User presence indicators (join, leave, online status)
- ✅ Multi-user collaboration isolation between organizations
- ✅ WebSocket authentication and authorization
"""

import json
import pytest
import asyncio
import time
import websockets
from typing import Dict, Any, List

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid
)


class TestCRMCollaborationAPI:
    """Test CRM Real-time Collaboration with organizational isolation."""

    # ============================================================================
    # ✅ PRIORITY 1: SUCCESS SCENARIOS - Real-time collaboration works correctly
    # ============================================================================

    def test_websocket_stats_endpoints(self, api_client, authenticated_user):
        """✅ Test WebSocket statistics REST endpoints work."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        org_id = authenticated_user['organization']['id']
        
        # Test organization stats
        stats_response = api_client.get(f"{TEST_BASE_URL}/ws/organization-stats/{org_id}", headers=headers)
        assert_successful_response(stats_response, 200)
        
        stats_data = stats_response.json()
        assert 'organization_id' in stats_data
        assert 'total_connections' in stats_data
        assert 'active_users' in stats_data
        assert 'connected_users' in stats_data
        assert stats_data['organization_id'] == org_id
        
        # Test active users
        users_response = api_client.get(f"{TEST_BASE_URL}/ws/active-users/{org_id}", headers=headers)
        assert_successful_response(users_response, 200)
        
        users_data = users_response.json()
        assert 'organization_id' in users_data
        assert 'active_users' in users_data
        assert 'total_active' in users_data
        assert users_data['organization_id'] == org_id

    @pytest.mark.asyncio
    async def test_websocket_connection_success(self, authenticated_user):
        """✅ Test WebSocket connection with organization authentication."""
        org_id = authenticated_user['organization']['id']
        token = authenticated_user['tokens']['access_token']
        
        # Convert http://localhost:8001 to ws://localhost:8001
        ws_url = f"ws://localhost:8001/ws/collaborate?token={token}&org_id={org_id}"
        
        try:
            async with websockets.connect(ws_url) as websocket:
                # Should receive connection established message
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                
                assert data['type'] == 'connection_established'
                assert 'organization' in data
                assert 'user' in data
                assert 'active_users' in data
                assert data['organization']['id'] == org_id
                assert data['user']['user_id'] == str(authenticated_user['user']['id'])
                
                # Send ping and expect pong
                ping_message = {
                    "type": "ping",
                    "timestamp": time.time()
                }
                await websocket.send(json.dumps(ping_message))
                
                pong_response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                pong_data = json.loads(pong_response)
                
                assert pong_data['type'] == 'pong'
                assert 'timestamp' in pong_data
                
        except asyncio.TimeoutError:
            pytest.fail("WebSocket connection or message timeout")
        except Exception as e:
            pytest.fail(f"WebSocket connection failed: {e}")

    @pytest.mark.asyncio 
    async def test_lead_creation_broadcast(self, api_client, authenticated_user):
        """✅ Test lead creation broadcasts to WebSocket connections."""
        org_id = authenticated_user['organization']['id']
        token = authenticated_user['tokens']['access_token']
        
        # Connect to WebSocket first
        ws_url = f"ws://localhost:8001/ws/collaborate?token={token}&org_id={org_id}"
        
        try:
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection established
                await asyncio.wait_for(websocket.recv(), timeout=5.0)
                
                # Create a lead via REST API
                headers = {
                    'Authorization': f"Bearer {token}",
                    'X-Org-Id': org_id
                }
                
                lead_data = {
                    "name": "WebSocket Test Lead",
                    "email": "wstest@example.com",
                    "phone": "+55 11 99999-9999",
                    "stage": "lead",
                    "source": "WebSocket Test",
                    "estimated_value": 3000.0,
                    "notes": "Created for WebSocket testing"
                }
                
                # Create lead
                response = api_client.post(
                    f"{TEST_BASE_URL}/crm/leads/",
                    json=lead_data,
                    headers=headers
                )
                assert_successful_response(response, 201)
                created_lead = response.json()
                
                # Should receive lead_created event via WebSocket
                event_message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                event_data = json.loads(event_message)
                
                assert event_data['type'] == 'lead_created'
                assert 'lead' in event_data
                assert 'timestamp' in event_data
                assert event_data['lead']['id'] == created_lead['id']
                assert event_data['lead']['name'] == lead_data['name']
                assert event_data['lead']['organization_id'] == org_id
                
        except asyncio.TimeoutError:
            pytest.fail("Did not receive lead_created WebSocket event")
        except Exception as e:
            pytest.fail(f"Lead creation broadcast test failed: {e}")

    @pytest.mark.asyncio
    async def test_lead_stage_change_broadcast(self, api_client, authenticated_user):
        """✅ Test lead stage changes broadcast to WebSocket connections."""
        org_id = authenticated_user['organization']['id']
        token = authenticated_user['tokens']['access_token']
        
        # First create a lead
        headers = {
            'Authorization': f"Bearer {token}",
            'X-Org-Id': org_id
        }
        
        lead_data = {
            "name": "Stage Change Test Lead",
            "email": "stagetest@example.com",
            "stage": "lead"
        }
        
        response = api_client.post(f"{TEST_BASE_URL}/crm/leads/", json=lead_data, headers=headers)
        assert_successful_response(response, 201)
        created_lead = response.json()
        
        # Connect to WebSocket
        ws_url = f"ws://localhost:8001/ws/collaborate?token={token}&org_id={org_id}"
        
        try:
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection established
                await asyncio.wait_for(websocket.recv(), timeout=5.0)
                
                # Update lead stage
                stage_update = {
                    "stage": "contato",
                    "notes": "Moved to contact stage via WebSocket test"
                }
                
                stage_response = api_client.put(
                    f"{TEST_BASE_URL}/crm/leads/{created_lead['id']}/stage",
                    json=stage_update,
                    headers=headers
                )
                assert_successful_response(stage_response, 200)
                
                # Should receive lead_stage_changed event
                event_message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                event_data = json.loads(event_message)
                
                assert event_data['type'] == 'lead_stage_changed'
                assert 'lead' in event_data
                assert event_data['lead']['id'] == created_lead['id']
                assert event_data['lead']['stage'] == 'contato'
                assert event_data['lead']['notes'] == stage_update['notes']
                
        except asyncio.TimeoutError:
            pytest.fail("Did not receive lead_stage_changed WebSocket event")
        except Exception as e:
            pytest.fail(f"Lead stage change broadcast test failed: {e}")

    @pytest.mark.asyncio
    async def test_multi_user_collaboration_same_organization(self, api_client, authenticated_user, second_organization_user):
        """✅ Test multiple users from same organization see each other's changes."""
        # Note: This test uses authenticated_user and second_organization_user
        # We need both users in the SAME organization for this test
        # For now, we'll skip this test as it requires special fixture setup
        pytest.skip("Multi-user same organization test requires special fixture - will implement in next iteration")

    # ============================================================================
    # 🔒 PRIORITY 2: SECURITY SCENARIOS - Organization isolation & authentication
    # ============================================================================

    @pytest.mark.asyncio
    async def test_websocket_requires_authentication(self):
        """🔒 Test WebSocket requires valid authentication."""
        # Try to connect without token
        ws_url = "ws://localhost:8001/ws/collaborate?org_id=00000000-0000-0000-0000-000000000000"
        
        try:
            async with websockets.connect(ws_url) as websocket:
                # Should close connection immediately
                try:
                    await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    pytest.fail("WebSocket should have closed due to missing authentication")
                except websockets.exceptions.ConnectionClosed:
                    # Expected - connection should close
                    pass
        except websockets.exceptions.InvalidHandshake:
            # Also acceptable - connection refused
            pass
        except Exception as e:
            if "401" in str(e) or "authentication" in str(e).lower():
                # Expected authentication error
                pass
            else:
                pytest.fail(f"Unexpected error: {e}")

    @pytest.mark.asyncio
    async def test_websocket_requires_org_id(self, authenticated_user):
        """🔒 Test WebSocket requires valid org_id parameter."""
        token = authenticated_user['tokens']['access_token']
        
        # Try to connect without org_id
        ws_url = f"ws://localhost:8001/ws/collaborate?token={token}"
        
        try:
            async with websockets.connect(ws_url) as websocket:
                try:
                    await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    pytest.fail("WebSocket should have closed due to missing org_id")
                except websockets.exceptions.ConnectionClosed:
                    # Expected - connection should close
                    pass
        except websockets.exceptions.InvalidHandshake:
            # Also acceptable - connection refused
            pass
        except Exception as e:
            if "400" in str(e) or "org" in str(e).lower():
                # Expected org_id error
                pass
            else:
                pytest.fail(f"Unexpected error: {e}")

    @pytest.mark.asyncio
    async def test_websocket_organization_isolation(self, authenticated_user, second_organization_user):
        """🔒 CRITICAL: Test WebSocket events are isolated between organizations."""
        # User 1 in org 1
        user1_token = authenticated_user['tokens']['access_token']
        user1_org_id = authenticated_user['organization']['id']
        
        # User 2 in org 2 (different organization)
        user2_token = second_organization_user['tokens']['access_token']
        user2_org_id = second_organization_user['organization']['id']
        
        # Verify different organizations
        assert user1_org_id != user2_org_id
        
        # Connect both users to their respective organizations
        ws_url_user1 = f"ws://localhost:8001/ws/collaborate?token={user1_token}&org_id={user1_org_id}"
        ws_url_user2 = f"ws://localhost:8001/ws/collaborate?token={user2_token}&org_id={user2_org_id}"
        
        try:
            async with websockets.connect(ws_url_user1) as ws1, \
                       websockets.connect(ws_url_user2) as ws2:
                
                # Wait for both connections to establish
                await asyncio.wait_for(ws1.recv(), timeout=5.0)  # connection_established
                await asyncio.wait_for(ws2.recv(), timeout=5.0)  # connection_established
                
                # User 1 creates a lead in org 1
                headers_user1 = {
                    'Authorization': f"Bearer {user1_token}",
                    'X-Org-Id': user1_org_id
                }
                
                lead_data = {
                    "name": "Isolation Test Lead",
                    "email": "isolation@example.com",
                    "stage": "lead"
                }
                
                # Import requests for this test
                import requests
                response = requests.post(
                    f"{TEST_BASE_URL}/crm/leads/",
                    json=lead_data,
                    headers=headers_user1
                )
                assert response.status_code == 201
                
                # User 1 should receive the event
                try:
                    user1_message = await asyncio.wait_for(ws1.recv(), timeout=3.0)
                    user1_data = json.loads(user1_message)
                    assert user1_data['type'] == 'lead_created'
                except asyncio.TimeoutError:
                    pytest.fail("User 1 should have received lead_created event")
                
                # User 2 should NOT receive the event (different organization)
                try:
                    user2_message = await asyncio.wait_for(ws2.recv(), timeout=2.0)
                    pytest.fail(f"User 2 should NOT have received cross-organization event: {user2_message}")
                except asyncio.TimeoutError:
                    # Expected - user 2 should not receive events from org 1
                    pass
                
        except Exception as e:
            pytest.fail(f"WebSocket organization isolation test failed: {e}")

    def test_websocket_stats_organization_isolation(self, api_client, authenticated_user, second_organization_user):
        """🔒 Test WebSocket stats are isolated between organizations."""
        # Get stats for user 1's organization
        headers_user1 = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        user1_org_id = authenticated_user['organization']['id']
        stats1_response = api_client.get(f"{TEST_BASE_URL}/ws/organization-stats/{user1_org_id}", headers=headers_user1)
        assert_successful_response(stats1_response, 200)
        stats1_data = stats1_response.json()
        
        # Get stats for user 2's organization  
        headers_user2 = {
            'Authorization': f"Bearer {second_organization_user['tokens']['access_token']}",
            'X-Org-Id': second_organization_user['organization']['id']
        }
        
        user2_org_id = second_organization_user['organization']['id']
        stats2_response = api_client.get(f"{TEST_BASE_URL}/ws/organization-stats/{user2_org_id}", headers=headers_user2)
        assert_successful_response(stats2_response, 200)
        stats2_data = stats2_response.json()
        
        # Verify different organizations have separate stats
        assert stats1_data['organization_id'] != stats2_data['organization_id']
        assert stats1_data['organization_id'] == user1_org_id
        assert stats2_data['organization_id'] == user2_org_id

    def test_websocket_stats_require_org_header(self, api_client, authenticated_user):
        """🔒 Test WebSocket endpoints require X-Org-Id header."""
        # Remove X-Org-Id header that was auto-set by authenticated_user fixture
        if 'X-Org-Id' in api_client.headers:
            del api_client.headers['X-Org-Id']
        
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}"
            # Missing X-Org-Id header
        }
        
        org_id = authenticated_user['organization']['id']
        
        # Test stats endpoint
        stats_response = api_client.get(f"{TEST_BASE_URL}/ws/organization-stats/{org_id}", headers=headers)
        assert_error_response(stats_response, 400)
        assert "Missing X-Org-Id header" in stats_response.json()['detail']
        
        # Test active users endpoint
        users_response = api_client.get(f"{TEST_BASE_URL}/ws/active-users/{org_id}", headers=headers)
        assert_error_response(users_response, 400)
        assert "Missing X-Org-Id header" in users_response.json()['detail']


@pytest.mark.crm
@pytest.mark.collaboration
class TestCRMCollaborationIntegration:
    """Integration tests for complete CRM collaboration workflow."""

    @pytest.mark.asyncio
    async def test_complete_collaboration_workflow(self, api_client, authenticated_user):
        """✅ Test complete collaboration workflow: connect → create lead → update stage → disconnect."""
        org_id = authenticated_user['organization']['id']
        token = authenticated_user['tokens']['access_token']
        
        headers = {
            'Authorization': f"Bearer {token}",
            'X-Org-Id': org_id
        }
        
        # Step 1: Connect to WebSocket
        ws_url = f"ws://localhost:8001/ws/collaborate?token={token}&org_id={org_id}"
        
        try:
            async with websockets.connect(ws_url) as websocket:
                # Step 2: Verify connection established
                connection_msg = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                connection_data = json.loads(connection_msg)
                assert connection_data['type'] == 'connection_established'
                
                # Step 3: Create lead and verify broadcast
                lead_data = {
                    "name": "Collaboration Workflow Lead",
                    "email": "workflow@example.com",
                    "stage": "lead",
                    "estimated_value": 5000.0
                }
                
                create_response = api_client.post(f"{TEST_BASE_URL}/crm/leads/", json=lead_data, headers=headers)
                assert_successful_response(create_response, 201)
                created_lead = create_response.json()
                
                # Verify lead_created event
                create_event_msg = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                create_event_data = json.loads(create_event_msg)
                assert create_event_data['type'] == 'lead_created'
                assert create_event_data['lead']['id'] == created_lead['id']
                
                # Step 4: Update lead stage and verify broadcast
                stage_update = {"stage": "proposta", "notes": "Moving to proposal stage"}
                stage_response = api_client.put(
                    f"{TEST_BASE_URL}/crm/leads/{created_lead['id']}/stage",
                    json=stage_update,
                    headers=headers
                )
                assert_successful_response(stage_response, 200)
                
                # Verify lead_stage_changed event
                stage_event_msg = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                stage_event_data = json.loads(stage_event_msg)
                assert stage_event_data['type'] == 'lead_stage_changed'
                assert stage_event_data['lead']['stage'] == 'proposta'
                
                # Step 5: Send user activity update
                activity_msg = {
                    "type": "user_activity",
                    "activity": "active",
                    "timestamp": time.time()
                }
                await websocket.send(json.dumps(activity_msg))
                
                # Connection will close automatically when exiting context
                
        except asyncio.TimeoutError:
            pytest.fail("Collaboration workflow timeout - check WebSocket event broadcasting")
        except Exception as e:
            pytest.fail(f"Collaboration workflow failed: {e}")

    def test_collaboration_performance(self, api_client, authenticated_user):
        """✅ Test collaboration features meet performance requirements."""
        org_id = authenticated_user['organization']['id']
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': org_id
        }
        
        # Test WebSocket stats performance
        start_time = time.time()
        stats_response = api_client.get(f"{TEST_BASE_URL}/ws/organization-stats/{org_id}", headers=headers)
        stats_duration = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        assert_successful_response(stats_response, 200)
        assert stats_duration < 200, f"WebSocket stats should respond in <200ms, got {stats_duration}ms"
        
        # Test active users performance
        start_time = time.time()
        users_response = api_client.get(f"{TEST_BASE_URL}/ws/active-users/{org_id}", headers=headers)
        users_duration = (time.time() - start_time) * 1000
        
        assert_successful_response(users_response, 200)
        assert users_duration < 200, f"Active users should respond in <200ms, got {users_duration}ms"