"""
WebSocket Router for Real-time Collaboration B2B
Organization-isolated real-time events for team collaboration
"""

import json
import logging
from typing import Any, Dict
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.responses import JSONResponse

from api.core.deps import get_current_active_user, get_current_organization, get_org_id_from_header
from api.core.security import verify_token
from api.core.websocket_manager import websocket_manager
from api.models.organization import Organization
from api.models.user import User

router = APIRouter(prefix="/ws", tags=["WebSocket - Real-time Collaboration"])

logger = logging.getLogger(__name__)


async def authenticate_websocket(token: str, org_id: str) -> tuple[User, Organization]:
    """Authenticate WebSocket connection with organization validation"""
    try:
        # Verify JWT token
        payload = verify_token(token, "access")
        user_id = payload.get("sub")
        jwt_org_id = payload.get("org_id")

        if not user_id or not jwt_org_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user or organization context",
            )

        # Validate organization ID matches
        if str(jwt_org_id) != str(org_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Organization access denied: token organization mismatch",
            )

        # Get database session
        from api.core.database import SessionLocal

        db = SessionLocal()

        try:
            # Get user and organization from database
            user = db.query(User).filter(User.id == UUID(user_id)).first()
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

            organization = db.query(Organization).filter(Organization.id == UUID(org_id)).first()
            if not organization:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
                )

            # Verify user belongs to organization through membership or ownership
            from api.models.organization import OrganizationMember

            # Check if user is the owner of the organization
            is_owner = organization.owner_id == user.id

            # Check if user is a member of the organization
            is_member = (
                db.query(OrganizationMember)
                .filter(
                    OrganizationMember.user_id == user.id,
                    OrganizationMember.organization_id == organization.id,
                    OrganizationMember.is_active == True,
                )
                .first()
                is not None
            )

            if not (is_owner or is_member):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User does not belong to organization",
                )

            return user, organization

        finally:
            db.close()

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"WebSocket authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed"
        )


@router.websocket("/collaborate")
async def websocket_collaboration_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
    org_id: str = Query(..., description="Organization ID"),
):
    """
    WebSocket endpoint for real-time collaboration within organization

    **Required Query Parameters:**
    - token: JWT access token
    - org_id: Organization UUID

    **Events Sent:**
    - lead_created: When a lead is created by team member
    - lead_updated: When a lead is updated by team member
    - lead_stage_changed: When a lead stage is moved by team member
    - user_joined: When team member joins collaboration session
    - user_left: When team member leaves collaboration session
    """
    try:
        # Authenticate WebSocket connection
        user, organization = await authenticate_websocket(token, org_id)

        # Prepare user info for broadcasting
        user_info = {
            "user_id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "avatar_url": getattr(user, "avatar_url", None),
        }

        # Connect user to organization room
        await websocket_manager.connect(
            websocket, UUID(str(organization.id)), UUID(str(user.id)), user_info
        )

        try:
            # Send initial connection success message
            await websocket_manager.send_personal_message(
                {
                    "type": "connection_established",
                    "message": f"Connected to {organization.name} collaboration room",
                    "organization": {"id": str(organization.id), "name": organization.name},
                    "user": user_info,
                    "active_users": websocket_manager.get_active_users(UUID(str(organization.id))),
                },
                UUID(str(organization.id)),
                UUID(str(user.id)),
            )

            # Listen for client messages (keepalive, user activity)
            while True:
                try:
                    # Wait for message from client
                    data = await websocket.receive_text()
                    message = json.loads(data)

                    # Handle different message types
                    await handle_client_message(websocket, user, organization, message)

                except json.JSONDecodeError:
                    logger.error("Invalid JSON received from WebSocket client")
                    await websocket_manager.send_personal_message(
                        {"type": "error", "message": "Invalid JSON format"},
                        UUID(str(organization.id)),
                        UUID(str(user.id)),
                    )
                except WebSocketDisconnect:
                    # Client disconnected - exit the loop
                    logger.info(
                        f"WebSocket client disconnected for user {user.id} in org {organization.id}"
                    )
                    break
                except Exception as e:
                    # Check if it's a disconnect-related error
                    error_msg = str(e).lower()
                    logger.error(f"Exception type: {type(e).__name__}, message: {e}")

                    if any(
                        keyword in error_msg
                        for keyword in [
                            "disconnect",
                            "closed",
                            "connection",
                            "receive",
                            "message has been received",
                        ]
                    ):
                        logger.info(f"WebSocket connection closed for user {user.id}: {e}")
                        break
                    else:
                        logger.error(f"Error handling WebSocket message: {e}")
                        # Don't break on other errors, continue listening

        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for user {user.id} in org {organization.id}")
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
        finally:
            # Disconnect user from organization room
            websocket_manager.disconnect(UUID(str(organization.id)), UUID(str(user.id)))

    except HTTPException as e:
        # Authentication failed - close connection
        await websocket.close(code=1008, reason=e.detail)
    except Exception as e:
        logger.error(f"WebSocket endpoint error: {e}")
        await websocket.close(code=1011, reason="Internal server error")


async def handle_client_message(
    websocket: WebSocket, user: User, organization: Organization, message: Dict[str, Any]
):
    """Handle incoming messages from WebSocket clients"""
    message_type = message.get("type")

    if message_type == "ping":
        # Respond to keepalive ping
        await websocket_manager.send_personal_message(
            {"type": "pong", "timestamp": message.get("timestamp")},
            UUID(str(organization.id)),
            UUID(str(user.id)),
        )

    elif message_type == "user_activity":
        # Update user activity status
        activity_type = message.get("activity", "active")

        # Broadcast user activity to organization
        await websocket_manager.broadcast_to_organization(
            UUID(str(organization.id)),
            {
                "type": "user_activity_update",
                "user_id": str(user.id),
                "user_name": user.full_name,
                "activity": activity_type,
                "timestamp": message.get("timestamp"),
            },
            exclude_user_id=UUID(str(user.id)),
        )

    elif message_type == "typing":
        # Handle typing indicators (for future chat features)
        await websocket_manager.broadcast_to_organization(
            UUID(str(organization.id)),
            {
                "type": "user_typing",
                "user_id": str(user.id),
                "user_name": user.full_name,
                "is_typing": message.get("is_typing", False),
            },
            exclude_user_id=UUID(str(user.id)),
        )

    else:
        logger.warning(f"Unknown message type received: {message_type}")


@router.get("/active-users/{organization_id}")
async def get_active_users(
    organization_id: str,
    request: Request,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
) -> JSONResponse:
    """Get list of currently active users in organization"""
    try:
        # First validate X-Org-Id header is present
        header_org_id = get_org_id_from_header(request)

        # Verify organization_id matches both the header and authenticated organization
        if str(organization.id) != organization_id or header_org_id != organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Organization access denied"
            )

        org_uuid = UUID(organization_id)
        active_users = websocket_manager.get_active_users(org_uuid)

        return JSONResponse(
            {
                "organization_id": organization_id,
                "active_users": active_users,
                "total_active": len(active_users),
            }
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid organization ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting active users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get active users"
        )


@router.websocket("/pipeline")
async def websocket_pipeline_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
    org_id: str = Query(..., description="Organization ID"),
):
    """
    WebSocket endpoint específico para Pipeline Kanban real-time updates

    **Required Query Parameters:**
    - token: JWT access token
    - org_id: Organization UUID

    **Events Sent:**
    - lead_stage_changed: When a lead stage is moved by team member
    - lead_created: When a new lead is created by team member
    - lead_updated: When a lead is updated by team member
    - lead_deleted: When a lead is deleted by team member
    - pipeline_user_activity: When team member activity is detected
    - pipeline_connection_established: When connection is successfully established
    """
    try:
        # Authenticate WebSocket connection
        user, organization = await authenticate_websocket(token, org_id)

        # Prepare user info for broadcasting
        user_info = {
            "user_id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "avatar_url": getattr(user, "avatar_url", None),
        }

        # Connect user to organization room
        await websocket_manager.connect(
            websocket, UUID(str(organization.id)), UUID(str(user.id)), user_info
        )

        try:
            # Send initial connection success message
            await websocket_manager.send_personal_message(
                {
                    "type": "pipeline_connection_established",
                    "message": f"Connected to {organization.name} pipeline room",
                    "organization": {"id": str(organization.id), "name": organization.name},
                    "user": user_info,
                    "active_users": websocket_manager.get_active_users(UUID(str(organization.id))),
                },
                UUID(str(organization.id)),
                UUID(str(user.id)),
            )

            # Listen for client messages (drag events, pipeline updates)
            while True:
                try:
                    # Wait for message from client
                    data = await websocket.receive_text()
                    message = json.loads(data)

                    # Handle pipeline-specific message types
                    await handle_pipeline_message(websocket, user, organization, message)

                except json.JSONDecodeError:
                    logger.error("Invalid JSON received from Pipeline WebSocket client")
                    await websocket_manager.send_personal_message(
                        {"type": "error", "message": "Invalid JSON format"},
                        UUID(str(organization.id)),
                        UUID(str(user.id)),
                    )
                except WebSocketDisconnect:
                    logger.info(
                        f"Pipeline WebSocket client disconnected for user {user.id} in org {organization.id}"
                    )
                    break
                except Exception as e:
                    error_msg = str(e).lower()
                    logger.error(
                        f"Pipeline WebSocket exception type: {type(e).__name__}, message: {e}"
                    )

                    if any(
                        keyword in error_msg
                        for keyword in [
                            "disconnect",
                            "closed",
                            "connection",
                            "receive",
                            "message has been received",
                        ]
                    ):
                        logger.info(f"Pipeline WebSocket connection closed for user {user.id}: {e}")
                        break
                    else:
                        logger.error(f"Error handling Pipeline WebSocket message: {e}")

        except WebSocketDisconnect:
            logger.info(
                f"Pipeline WebSocket disconnected for user {user.id} in org {organization.id}"
            )
        except Exception as e:
            logger.error(f"Pipeline WebSocket connection error: {e}")
        finally:
            # Disconnect user from organization room
            websocket_manager.disconnect(UUID(str(organization.id)), UUID(str(user.id)))

    except HTTPException as e:
        # Authentication failed - close connection
        await websocket.close(code=1008, reason=e.detail)
    except Exception as e:
        logger.error(f"Pipeline WebSocket endpoint error: {e}")
        await websocket.close(code=1011, reason="Internal server error")


async def handle_pipeline_message(
    websocket: WebSocket, user: User, organization: Organization, message: Dict[str, Any]
):
    """Handle incoming messages from Pipeline WebSocket clients"""
    message_type = message.get("type")

    if message_type == "ping":
        # Respond to keepalive ping
        await websocket_manager.send_personal_message(
            {"type": "pong", "timestamp": message.get("timestamp")},
            UUID(str(organization.id)),
            UUID(str(user.id)),
        )

    elif message_type == "lead_drag_start":
        # Broadcast drag start to other organization members
        await websocket_manager.broadcast_to_organization(
            UUID(str(organization.id)),
            {
                "type": "lead_drag_start",
                "lead_id": message.get("lead_id"),
                "user_id": str(user.id),
                "user_name": user.full_name,
                "timestamp": message.get("timestamp"),
            },
            exclude_user_id=UUID(str(user.id)),
        )

    elif message_type == "lead_drag_end":
        # Broadcast drag end to other organization members
        await websocket_manager.broadcast_to_organization(
            UUID(str(organization.id)),
            {
                "type": "lead_drag_end",
                "lead_id": message.get("lead_id"),
                "user_id": str(user.id),
                "user_name": user.full_name,
                "timestamp": message.get("timestamp"),
            },
            exclude_user_id=UUID(str(user.id)),
        )

    elif message_type == "stage_change":
        # Broadcast stage change to other organization members
        await websocket_manager.broadcast_to_organization(
            UUID(str(organization.id)),
            {
                "type": "stage_change",
                "lead_id": message.get("lead_id"),
                "old_stage": message.get("old_stage"),
                "new_stage": message.get("new_stage"),
                "lead_name": message.get("lead_name"),
                "user_id": str(user.id),
                "user_name": user.full_name,
                "timestamp": message.get("timestamp"),
            },
            exclude_user_id=UUID(str(user.id)),
        )

    elif message_type == "user_activity":
        # Update user activity status
        activity_type = message.get("activity", "active")

        # Broadcast user activity to organization
        await websocket_manager.broadcast_to_organization(
            UUID(str(organization.id)),
            {
                "type": "pipeline_user_activity_update",
                "user_id": str(user.id),
                "user_name": user.full_name,
                "activity": activity_type,
                "timestamp": message.get("timestamp"),
            },
            exclude_user_id=UUID(str(user.id)),
        )

    else:
        logger.warning(f"Unknown pipeline message type received: {message_type}")


@router.get("/organization-stats/{organization_id}")
async def get_organization_collaboration_stats(
    organization_id: str,
    request: Request,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
) -> JSONResponse:
    """Get real-time collaboration statistics for organization"""
    try:
        # First validate X-Org-Id header is present
        header_org_id = get_org_id_from_header(request)

        # Verify organization_id matches both the header and authenticated organization
        if str(organization.id) != organization_id or header_org_id != organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Organization access denied"
            )

        org_uuid = UUID(organization_id)
        stats = websocket_manager.get_organization_stats(org_uuid)

        return JSONResponse(stats)

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid organization ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting organization stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get organization statistics",
        )
