"""🏢 Public Invite Router - Accept/Reject Invitations.

Public endpoints for accepting and rejecting organization invitations.
These endpoints don't require authentication for external users.
"""
from typing import Annotated, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import get_current_active_user, get_current_active_user_optional
from ..models.user import User
from ..schemas.organization_invite import (
    OrganizationInviteAccept,
    OrganizationInviteReject,
    PublicInviteInfo,
)
from ..services.organization_invite_service import OrganizationInviteService

router = APIRouter(prefix="/invites", tags=["Public Invites"])


@router.get("/{token}", response_model=PublicInviteInfo)
async def get_invite_info(
    token: str,
    db: Annotated[Session, Depends(get_db)],
) -> PublicInviteInfo:
    """Get public information about an invite by token."""
    invite_service = OrganizationInviteService(db)

    try:
        invite = invite_service.get_invite_by_token(token)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired invite"
        )

    # Return public information only
    return PublicInviteInfo.model_validate(
        {
            "organization_name": invite.organization.name,
            "organization_slug": invite.organization.slug,
            "invited_by_name": invite.invited_by.full_name,
            "role": invite.role,
            "created_at": invite.created_at,
            "expires_at": invite.expires_at,
            "is_expired": invite.is_expired,
            "message": invite.message,
            "invited_email": invite.email,
        }
    )


@router.post("/{token}/accept")
async def accept_invite(
    token: str,
    accept_data: OrganizationInviteAccept,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[Optional[User], Depends(get_current_active_user_optional)] = None,
) -> Dict[str, str]:
    """Accept an organization invite.

    Can be used by:
    1. Authenticated users (validates email match)
    2. Unauthenticated users (creates pending membership for when they register)
    """
    invite_service = OrganizationInviteService(db)

    # Validate token matches request
    if accept_data.token != token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token mismatch")

    try:
        invite, membership = invite_service.accept_invite(token, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to accept invite"
        ) from e

    if current_user and membership:
        return {
            "message": f"Successfully joined {invite.organization.name} as {invite.role.value}",
            "organization_id": str(invite.organization_id),
            "role": invite.role.value,
        }
    else:
        return {
            "message": "Invite accepted. You will be added to the organization when you create an account.",
            "organization_id": str(invite.organization_id),
            "role": invite.role.value,
        }


@router.post("/{token}/reject")
async def reject_invite(
    token: str,
    reject_data: OrganizationInviteReject,
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Reject an organization invite."""
    invite_service = OrganizationInviteService(db)

    # Validate token matches request
    if reject_data.token != token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token mismatch")

    try:
        invite = invite_service.reject_invite(token, reject_data.reason)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reject invite"
        ) from e

    return {
        "message": f"Invite to join {invite.organization.name} has been rejected",
        "organization_name": invite.organization.name,
    }


@router.post("/cleanup-expired")
async def cleanup_expired_invites(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> Dict[str, int]:
    """Cleanup expired invites (admin endpoint).

    This is a maintenance endpoint that should be called periodically
    or can be triggered by a cron job.
    Requires admin authentication.
    """
    # Validate admin permissions (superuser only for system maintenance)
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can perform system maintenance operations",
        )

    invite_service = OrganizationInviteService(db)

    expired_count = invite_service.cleanup_expired_invites()

    return {"expired_count": expired_count}
