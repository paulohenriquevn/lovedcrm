"""WebSocket Router for Real-time Collaboration B2B.

Organization-isolated real-time events for team collaboration.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional
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
    """Authenticate WebSocket connection with organization validation."""
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


async def _prepare_user_info(user: User) -> Dict[str, Any]:
    """Prepare user information dictionary for WebSocket broadcasting."""
    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "avatar_url": getattr(user, "avatar_url", None),
    }


async def _send_connection_established_message(
    organization: Organization,
    user_info: Dict[str, Any],
    message_type: str = "connection_established",
) -> Dict[str, Any]:
    """Create connection established message for WebSocket."""
    room_type = "pipeline room" if "pipeline" in message_type else "collaboration room"
    return {
        "type": message_type,
        "message": f"Connected to {organization.name} {room_type}",
        "organization": {"id": str(organization.id), "name": organization.name},
        "user": user_info,
        "active_users": websocket_manager.get_active_users(UUID(str(organization.id))),
    }


async def _handle_websocket_disconnect_error(e: Exception, user_id: UUID) -> bool:
    """Handle WebSocket disconnect-related errors and return if should break loop."""
    error_msg = str(e).lower()
    exception_type = type(e).__name__.lower()

    # Log error but avoid Sentry loops by checking for Sentry issues
    if "sentry" not in error_msg and "sentry" not in exception_type:
        logger.error(f"Exception type: {exception_type}, message: {e}")

    # Comprehensive disconnect detection
    disconnect_keywords = [
        "disconnect",
        "closed",
        "connection",
        "receive",
        "message has been received",
        "not connected",
        "need to call",
        "websocket",
        "accept first",
    ]

    # Specific exception types that indicate disconnection
    disconnect_exceptions = [
        "runtimeerror",
        "connectionclosederror",
        "websocketdisconnect",
        "connectionerror",
        "connectionresetbyremote",
    ]

    is_disconnect = any(keyword in error_msg for keyword in disconnect_keywords) or any(
        exc_type in exception_type for exc_type in disconnect_exceptions
    )

    if is_disconnect:
        logger.info(f"WebSocket connection closed for user {user_id}: {exception_type} - {e}")
        return True
    else:
        logger.error(f"Unexpected WebSocket error for user {user_id}: {exception_type} - {e}")
        return True  # 🚨 SEGURANÇA: Break loop on ANY unhandled exception to prevent infinite loops


async def _check_websocket_connection(websocket: WebSocket, user: User) -> bool:
    """Check if WebSocket connection is still valid."""
    if websocket.client_state.name in ["DISCONNECTED", "CLOSED"]:
        logger.info(f"WebSocket already closed for user {user.id}")
        return False
    return True


async def _receive_websocket_data(
    websocket: WebSocket, user: User, timeout: float = 30.0
) -> Optional[str]:
    """Receive data from WebSocket with timeout protection."""
    import asyncio

    try:
        return await asyncio.wait_for(websocket.receive_text(), timeout=timeout)
    except asyncio.TimeoutError:
        logger.warning(f"WebSocket receive timeout for user {user.id}")
        # Send ping to check if connection is still alive
        try:
            await websocket.send_text(
                json.dumps({"type": "ping", "timestamp": datetime.utcnow().isoformat()})
            )
            return None  # Continue loop
        except Exception:
            logger.info(f"WebSocket ping failed, connection closed for user {user.id}")
            raise  # Break loop


async def _validate_message_size(
    data: str, user: User, organization: Organization, max_size: int
) -> bool:
    """Validate message size and send error if too large."""
    if len(data) <= max_size:
        return True

    logger.warning(f"Message too large ({len(data)} bytes) from user {user.id}")
    await websocket_manager.send_personal_message(
        {"type": "error", "message": "Message too large"},
        UUID(str(organization.id)),
        UUID(str(user.id)),
    )
    return False


async def _handle_json_decode_error(
    user: User, organization: Organization, consecutive_errors: int, max_errors: int
) -> tuple[int, bool]:
    """Handle JSON decode error and return updated error count and should_break flag."""
    consecutive_errors += 1
    logger.error(f"Invalid JSON from user {user.id} (error #{consecutive_errors})")

    if consecutive_errors >= max_errors:
        logger.error(f"Too many JSON errors from user {user.id}, closing connection")
        return consecutive_errors, True

    await websocket_manager.send_personal_message(
        {"type": "error", "message": "Invalid JSON format"},
        UUID(str(organization.id)),
        UUID(str(user.id)),
    )
    return consecutive_errors, False


async def _process_websocket_message(
    data: str, user: User, organization: Organization, handler_func, max_size: int
) -> bool:
    """Process a single WebSocket message and return success status."""
    # Validate message size
    if not await _validate_message_size(data, user, organization, max_size):
        return True  # Continue loop, don't count as error

    # Parse and handle message
    try:
        message = json.loads(data)
        await handler_func(None, user, organization, message)  # websocket not used in handler_func
        return True  # Success
    except json.JSONDecodeError:
        return False  # JSON error, handled by caller


async def _handle_websocket_exception(
    e: Exception, user: User, consecutive_errors: int, max_errors: int
) -> tuple[int, bool]:
    """Handle WebSocket exception and return updated error count and should_break flag."""
    consecutive_errors += 1
    should_break = await _handle_websocket_disconnect_error(e, UUID(str(user.id)))

    # Circuit breaker - break after max errors or any critical error
    if should_break or consecutive_errors >= max_errors:
        if consecutive_errors >= max_errors:
            logger.error(
                f"Circuit breaker triggered for user {user.id} after {consecutive_errors} errors"
            )
        return consecutive_errors, True

    return consecutive_errors, False


async def _websocket_message_loop(
    websocket: WebSocket, user: User, organization: Organization, handler_func
):
    """Handle WebSocket message loop with circuit breaker and safety mechanisms."""
    import asyncio

    consecutive_errors = 0
    max_consecutive_errors = 3
    error_cooldown = 1.0
    max_message_size = 1024 * 64  # 64KB limit

    while True:
        try:
            # Check WebSocket connection state
            if not await _check_websocket_connection(websocket, user):
                break

            # Receive data with timeout protection
            data = await _receive_websocket_data(websocket, user)
            if data is None:
                continue

            # Process message
            success = await _process_websocket_message(
                data, user, organization, handler_func, max_message_size
            )

            if success:
                consecutive_errors = 0  # Reset error counter on success
            else:
                # Handle JSON decode error
                consecutive_errors, should_break = await _handle_json_decode_error(
                    user, organization, consecutive_errors, max_consecutive_errors
                )
                if should_break:
                    await websocket.close(code=1003, reason="Too many malformed messages")
                    break

        except WebSocketDisconnect:
            logger.info(
                f"WebSocket client disconnected for user {user.id} in org {organization.id}"
            )
            break

        except Exception as e:
            consecutive_errors, should_break = await _handle_websocket_exception(
                e, user, consecutive_errors, max_consecutive_errors
            )
            if should_break:
                break

            # Brief cooldown before retrying
            await asyncio.sleep(error_cooldown)


@router.websocket("/collaborate")
async def websocket_collaboration_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
    org_id: str = Query(..., description="Organization ID"),
):
    """Provide WebSocket endpoint for real-time collaboration within organization.

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
        user_info = await _prepare_user_info(user)

        # Connect user to organization room
        await websocket_manager.connect(
            websocket, UUID(str(organization.id)), UUID(str(user.id)), user_info
        )

        try:
            # Send initial connection success message
            connection_message = await _send_connection_established_message(organization, user_info)
            await websocket_manager.send_personal_message(
                connection_message,
                UUID(str(organization.id)),
                UUID(str(user.id)),
            )

            # Handle WebSocket message loop
            await _websocket_message_loop(websocket, user, organization, handle_client_message)

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
    """Handle incoming messages from WebSocket clients."""
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
    """Get list of currently active users in organization."""
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
    """Provide WebSocket endpoint specific for Pipeline Kanban real-time updates.

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
        user_info = await _prepare_user_info(user)

        # Connect user to organization room
        await websocket_manager.connect(
            websocket, UUID(str(organization.id)), UUID(str(user.id)), user_info
        )

        try:
            # Send initial connection success message
            connection_message = await _send_connection_established_message(
                organization, user_info, "pipeline_connection_established"
            )
            await websocket_manager.send_personal_message(
                connection_message,
                UUID(str(organization.id)),
                UUID(str(user.id)),
            )

            # Handle WebSocket message loop for pipeline
            await _websocket_message_loop(websocket, user, organization, handle_pipeline_message)

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
    """Handle incoming messages from Pipeline WebSocket clients."""
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
    """Get real-time collaboration statistics for organization."""
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
