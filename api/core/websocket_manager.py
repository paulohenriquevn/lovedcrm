"""
WebSocket Manager for Real-time Collaboration B2B
Organization-isolated event broadcasting for team collaboration
"""

import json
import logging
from typing import Dict, List, Set, Any, Optional
from uuid import UUID
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)


class WebSocketConnectionManager:
    """
    Manages WebSocket connections with organization isolation
    Ensures real-time events are only broadcast within the same organization
    """

    def __init__(self):
        # Organization-scoped connections: {org_id: {user_id: WebSocket}}
        self.connections: Dict[str, Dict[str, WebSocket]] = {}
        # Track active users per organization: {org_id: {user_id: {last_seen, user_info}}}
        self.active_users: Dict[str, Dict[str, Dict[str, Any]]] = {}

    async def connect(self, websocket: WebSocket, organization_id: UUID, user_id: UUID, user_info: Dict[str, Any]):
        """Connect user to organization-specific WebSocket room"""
        await websocket.accept()
        
        org_str = str(organization_id)
        user_str = str(user_id)
        
        # Initialize organization connections if not exists
        if org_str not in self.connections:
            self.connections[org_str] = {}
            self.active_users[org_str] = {}
        
        # Add connection
        self.connections[org_str][user_str] = websocket
        
        # Track user activity
        self.active_users[org_str][user_str] = {
            "last_seen": datetime.utcnow().isoformat(),
            "user_info": user_info,
            "connected_at": datetime.utcnow().isoformat()
        }
        
        logger.info(
            f"User connected to organization WebSocket",
            extra={
                "organization_id": org_str,
                "user_id": user_str,
                "user_name": user_info.get("full_name", "Unknown"),
                "total_org_connections": len(self.connections[org_str])
            }
        )
        
        # Broadcast user joined event to organization
        await self.broadcast_to_organization(
            organization_id,
            {
                "type": "user_joined",
                "user_id": user_str,
                "user_info": user_info,
                "timestamp": datetime.utcnow().isoformat(),
                "total_online": len(self.connections[org_str])
            },
            exclude_user_id=user_id
        )

    def disconnect(self, organization_id: UUID, user_id: UUID):
        """Disconnect user from organization WebSocket room"""
        org_str = str(organization_id)
        user_str = str(user_id)
        
        if org_str in self.connections and user_str in self.connections[org_str]:
            user_info = self.active_users.get(org_str, {}).get(user_str, {}).get("user_info", {})
            
            # Remove connection
            del self.connections[org_str][user_str]
            
            # Remove from active users
            if org_str in self.active_users and user_str in self.active_users[org_str]:
                del self.active_users[org_str][user_str]
            
            # Clean up empty organization rooms
            if not self.connections[org_str]:
                del self.connections[org_str]
                if org_str in self.active_users:
                    del self.active_users[org_str]
            
            logger.info(
                f"User disconnected from organization WebSocket",
                extra={
                    "organization_id": org_str,
                    "user_id": user_str,
                    "user_name": user_info.get("full_name", "Unknown"),
                    "remaining_connections": len(self.connections.get(org_str, {}))
                }
            )
            
            # Broadcast user left event to remaining organization members
            if org_str in self.connections:
                # Use asyncio to run async function
                import asyncio
                try:
                    loop = asyncio.get_event_loop()
                    loop.create_task(self.broadcast_to_organization(
                        organization_id,
                        {
                            "type": "user_left",
                            "user_id": user_str,
                            "user_info": user_info,
                            "timestamp": datetime.utcnow().isoformat(),
                            "total_online": len(self.connections[org_str])
                        }
                    ))
                except Exception as e:
                    logger.error(f"Failed to broadcast user_left event: {e}")

    async def send_personal_message(self, message: Dict[str, Any], organization_id: UUID, user_id: UUID):
        """Send message to specific user within organization"""
        org_str = str(organization_id)
        user_str = str(user_id)
        
        if org_str in self.connections and user_str in self.connections[org_str]:
            websocket = self.connections[org_str][user_str]
            try:
                await websocket.send_text(json.dumps(message))
                logger.debug(f"Personal message sent to user {user_str} in org {org_str}")
            except Exception as e:
                logger.error(f"Failed to send personal message: {e}")
                # Remove failed connection
                self.disconnect(organization_id, user_id)

    async def broadcast_to_organization(self, organization_id: UUID, message: Dict[str, Any], exclude_user_id: Optional[UUID] = None):
        """Broadcast message to all users in organization (except excluded user)"""
        org_str = str(organization_id)
        exclude_str = str(exclude_user_id) if exclude_user_id else None
        
        logger.debug(f"Broadcasting to org {org_str}, exclude_user: {exclude_str}")
        logger.debug(f"Available connections: {list(self.connections.keys())}")
        
        if org_str not in self.connections:
            logger.warning(f"No connections for organization {org_str}")
            return

        # Add organization context to message
        message["organization_id"] = org_str
        message_json = json.dumps(message)
        
        connected_users = list(self.connections[org_str].keys())
        logger.debug(f"Connected users in org {org_str}: {connected_users}")
        
        failed_connections = []
        successful_broadcasts = 0
        
        for user_str, websocket in self.connections[org_str].items():
            # Skip excluded user
            if exclude_str and user_str == exclude_str:
                logger.debug(f"Skipping excluded user {user_str}")
                continue
                
            try:
                logger.debug(f"Sending message to user {user_str}")
                await websocket.send_text(message_json)
                successful_broadcasts += 1
                logger.debug(f"Successfully sent message to user {user_str}")
            except Exception as e:
                logger.error(f"Failed to broadcast to user {user_str}: {e}")
                failed_connections.append((user_str, organization_id))
        
        logger.info(f"Broadcast completed: {successful_broadcasts} successful, {len(failed_connections)} failed")
        
        # Clean up failed connections
        for user_str, org_id in failed_connections:
            self.disconnect(org_id, UUID(user_str))
        
        logger.info(
            f"Broadcast completed",
            extra={
                "organization_id": org_str,
                "message_type": message.get("type", "unknown"),
                "successful_broadcasts": successful_broadcasts,
                "failed_connections": len(failed_connections),
                "excluded_user": exclude_str
            }
        )

    def get_active_users(self, organization_id: UUID) -> List[Dict[str, Any]]:
        """Get list of active users in organization"""
        org_str = str(organization_id)
        
        if org_str not in self.active_users:
            return []
        
        users = []
        for user_id, user_data in self.active_users[org_str].items():
            users.append({
                "user_id": user_id,
                "last_seen": user_data["last_seen"],
                "connected_at": user_data["connected_at"],
                **user_data["user_info"]
            })
        
        return users

    def get_organization_stats(self, organization_id: UUID) -> Dict[str, Any]:
        """Get real-time stats for organization"""
        org_str = str(organization_id)
        
        return {
            "organization_id": org_str,
            "total_connections": len(self.connections.get(org_str, {})),
            "active_users": len(self.active_users.get(org_str, {})),
            "connected_users": self.get_active_users(organization_id)
        }


# Global WebSocket manager instance
websocket_manager = WebSocketConnectionManager()