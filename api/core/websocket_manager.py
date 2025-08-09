"""WebSocket Manager for Real-time Collaboration B2B.

Organization-isolated event broadcasting for team collaboration.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketConnectionManager:
    """Manages WebSocket connections with organization isolation.

    Ensures real-time events are only broadcast within the same organization.
    """

    def __init__(self) -> None:
        """Initialize the WebSocket connection manager."""
        # Organization-scoped connections: {org_id: {user_id: [WebSocket1, WebSocket2, ...]}}
        self.connections: Dict[str, Dict[str, List[WebSocket]]] = {}
        # Track active users per organization: {org_id: {user_id: {last_seen, user_info}}}
        self.active_users: Dict[str, Dict[str, Dict[str, Any]]] = {}

    async def connect(
        self, websocket: WebSocket, organization_id: UUID, user_id: UUID, user_info: Dict[str, Any]
    ) -> None:
        """Connect user to organization-specific WebSocket room."""
        await websocket.accept()

        org_str = str(organization_id)
        user_str = str(user_id)

        # Initialize organization connections if not exists
        if org_str not in self.connections:
            self.connections[org_str] = {}
            self.active_users[org_str] = {}

        # Initialize user connections list if not exists
        if user_str not in self.connections[org_str]:
            self.connections[org_str][user_str] = []

        # Add connection to user's list
        self.connections[org_str][user_str].append(websocket)

        # Track user activity
        self.active_users[org_str][user_str] = {
            "last_seen": datetime.utcnow().isoformat(),
            "user_info": user_info,
            "connected_at": datetime.utcnow().isoformat(),
        }

        logger.info(f"WebSocket connected: org={org_str} user={user_str}")

        # Calculate total connections
        total_connections = sum(len(ws_list) for ws_list in self.connections[org_str].values())

        # Broadcast user joined event to organization
        await self.broadcast_to_organization(
            organization_id,
            {
                "type": "user_joined",
                "user_id": user_str,
                "user_info": user_info,
                "timestamp": datetime.utcnow().isoformat(),
                "total_online": len(self.connections[org_str]),
                "total_connections": total_connections,
            },
            exclude_user_id=user_id,
        )

    def _remove_user_connection(
        self, org_str: str, user_str: str, websocket: Optional[WebSocket]
    ) -> bool:
        """Remove user connection and return whether user should be cleaned up."""
        if websocket and websocket in self.connections[org_str][user_str]:
            self.connections[org_str][user_str].remove(websocket)
            return not self.connections[org_str][user_str]  # True if no connections left
        else:
            # Remove all connections for user
            del self.connections[org_str][user_str]
            return True

    def _cleanup_user_data(self, org_str: str, user_str: str) -> None:
        """Clean up user data from active users."""
        if org_str in self.active_users and user_str in self.active_users[org_str]:
            del self.active_users[org_str][user_str]

    def _cleanup_empty_organization(self, org_str: str) -> None:
        """Clean up empty organization rooms."""
        if not self.connections[org_str]:
            del self.connections[org_str]
            if org_str in self.active_users:
                del self.active_users[org_str]

    def _broadcast_user_left_event(
        self, organization_id: UUID, org_str: str, user_str: str, user_info: Dict[str, Any]
    ) -> None:
        """Broadcast user left event to remaining organization members."""
        if org_str not in self.connections:
            return

        remaining_total_connections = sum(
            len(ws_list) for ws_list in self.connections[org_str].values()
        )

        # Use asyncio to run async function
        import asyncio

        try:
            loop = asyncio.get_event_loop()
            loop.create_task(
                self.broadcast_to_organization(
                    organization_id,
                    {
                        "type": "user_left",
                        "user_id": user_str,
                        "user_info": user_info,
                        "timestamp": datetime.utcnow().isoformat(),
                        "total_online": len(self.connections[org_str]),
                        "total_connections": remaining_total_connections,
                    },
                )
            )
        except Exception as e:
            logger.error(f"Failed to broadcast user_left event: {e}")

    def disconnect(
        self, organization_id: UUID, user_id: UUID, websocket: Optional[WebSocket] = None
    ) -> None:
        """Disconnect user from organization WebSocket room."""
        org_str = str(organization_id)
        user_str = str(user_id)

        if org_str not in self.connections or user_str not in self.connections[org_str]:
            return

        user_info = self.active_users.get(org_str, {}).get(user_str, {}).get("user_info", {})

        # Remove connection and check if user should be cleaned up
        should_cleanup_user = self._remove_user_connection(org_str, user_str, websocket)

        if should_cleanup_user:
            self._cleanup_user_data(org_str, user_str)

        self._cleanup_empty_organization(org_str)
        logger.info(f"WebSocket disconnected: org={org_str} user={user_str}")

        # Broadcast user left event to remaining organization members
        self._broadcast_user_left_event(organization_id, org_str, user_str, user_info)

    async def send_personal_message(
        self, message: Dict[str, Any], organization_id: UUID, user_id: UUID
    ) -> None:
        """Send message to specific user within organization."""
        org_str = str(organization_id)
        user_str = str(user_id)

        if org_str in self.connections and user_str in self.connections[org_str]:
            websockets = self.connections[org_str][user_str]  # Now a list
            failed_connections = []

            for websocket in websockets:
                try:
                    # 🚨 SEGURANÇA: Check connection state before sending
                    if hasattr(websocket, "client_state") and websocket.client_state.name in [
                        "DISCONNECTED",
                        "CLOSED",
                    ]:
                        logger.warning(f"WebSocket already closed for user {user_str}, cleaning up")
                        failed_connections.append(websocket)
                        continue

                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send personal message: {e}")
                    failed_connections.append(websocket)

            # Clean up failed connections
            for failed_ws in failed_connections:
                self.disconnect(organization_id, user_id, failed_ws)

    async def broadcast_to_organization(
        self, organization_id: UUID, message: Dict[str, Any], exclude_user_id: Optional[UUID] = None
    ) -> None:
        """Broadcast message to all users in organization (except excluded user)."""
        org_str = str(organization_id)
        exclude_str = str(exclude_user_id) if exclude_user_id else None

        if org_str not in self.connections:
            return

        # Add organization context to message
        message["organization_id"] = org_str
        message_json = json.dumps(message)

        failed_connections = []
        successful_broadcasts = 0

        for user_str, websockets in self.connections[org_str].items():
            # Skip excluded user
            if exclude_str and user_str == exclude_str:
                continue

            # Send to all WebSocket connections for this user
            for websocket in websockets:
                try:
                    # Check connection state before broadcasting
                    if hasattr(websocket, "client_state") and websocket.client_state.name in [
                        "DISCONNECTED",
                        "CLOSED",
                    ]:
                        failed_connections.append((user_str, organization_id, websocket))
                        continue

                    await websocket.send_text(message_json)
                    successful_broadcasts += 1
                except Exception as e:
                    logger.error(f"Failed to broadcast to user {user_str}: {e}")
                    failed_connections.append((user_str, organization_id, websocket))

        # Clean up failed connections
        for user_str, org_id, websocket in failed_connections:
            self.disconnect(org_id, UUID(user_str), websocket)

    def get_active_users(self, organization_id: UUID) -> List[Dict[str, Any]]:
        """Get list of active users in organization."""
        org_str = str(organization_id)

        if org_str not in self.active_users:
            return []

        users = []
        for user_id, user_data in self.active_users[org_str].items():
            users.append(
                {
                    "user_id": user_id,
                    "last_seen": user_data["last_seen"],
                    "connected_at": user_data["connected_at"],
                    **user_data["user_info"],
                }
            )

        return users

    def get_organization_stats(self, organization_id: UUID) -> Dict[str, Any]:
        """Get real-time stats for organization."""
        org_str = str(organization_id)

        # Count total connections across all users
        total_connections = 0
        if org_str in self.connections:
            for _user_id, websockets in self.connections[org_str].items():
                total_connections += len(websockets)

        return {
            "organization_id": org_str,
            "total_connections": total_connections,
            "active_users": len(self.active_users.get(org_str, {})),
            "connected_users": self.get_active_users(organization_id),
        }


# Global WebSocket manager instance
websocket_manager = WebSocketConnectionManager()
