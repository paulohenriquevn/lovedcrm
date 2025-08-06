"""Simplified Organizations Router - following KISS principle."""

from typing import Annotated, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import (
    get_current_active_user,
    get_current_organization,
    get_organization_member,
    require_admin,
    require_owner,
)
from ..models.organization import Organization, OrganizationMember
from ..models.user import User
from ..schemas.organization import (
    OrganizationCreate,
    OrganizationMemberResponse,
    OrganizationMemberWithUser,
    OrganizationResponse,
    OrganizationUpdate,
    OrganizationWithRole,
)
from ..schemas.organization_invite import (
    OrganizationInviteCancel,
    OrganizationInviteCreate,
    OrganizationInviteResponse,
    OrganizationInviteStats,
)
from ..services.organization_invite_service import OrganizationInviteService
from ..services.organization_service import OrganizationService

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    request: Request,
    org_data: OrganizationCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationResponse:
    """Create a new organization."""
    try:
        OrganizationService(db)

        # Generate slug if not provided
        if not org_data.slug:
            # Simple slug generation from name
            import re

            slug = re.sub(r"[^a-zA-Z0-9\-_]", "-", org_data.name.lower())
            slug = re.sub(r"-+", "-", slug).strip("-")
            org_data.slug = f"{slug}-{str(current_user.id)[:8]}"

        # Check if slug is already taken
        existing_org = db.query(Organization).filter(Organization.slug == org_data.slug).first()
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Organization slug already exists"
            )

        # Create organization
        org = Organization(
            name=org_data.name,
            slug=org_data.slug,
            description=org_data.description,
            owner_id=current_user.id,
            is_active=True,
        )

        db.add(org)
        db.flush()  # Get the ID without committing

        # Add owner as member
        member = OrganizationMember(
            organization_id=org.id, user_id=current_user.id, role="owner", is_active=True
        )
        db.add(member)
        db.commit()
        db.refresh(org)

        return OrganizationResponse.model_validate(org)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create organization: {str(e)}",
        ) from e


@router.get("/list", response_model=List[OrganizationWithRole])
async def list_my_organizations(
    request: Request,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> List[OrganizationWithRole]:
    """Get all organizations where the current user is a member."""
    org_service = OrganizationService(db)
    orgs_with_roles = org_service.get_user_organizations_with_roles(current_user)
    return [OrganizationWithRole.model_validate(org_dict) for org_dict in orgs_with_roles]


@router.get("/current", response_model=OrganizationResponse)
async def get_current_organization_info(
    request: Request,
    organization: Annotated[Organization, Depends(get_current_organization)],
) -> OrganizationResponse:
    """Get current organization from X-Org-Id header."""
    return OrganizationResponse.model_validate(organization)


@router.put("/current", response_model=OrganizationResponse)
async def update_current_organization(
    request: Request,
    update_data: OrganizationUpdate,
    membership: Annotated[OrganizationMember, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationResponse:
    """Update current organization (admin+ required)."""
    import logging

    logger = logging.getLogger(__name__)

    logger.info(
        "Organization update requested",
        extra={
            "org_id": str(UUID(str(membership.organization_id))),
            "user_role": membership.role,
            "requested_updates": update_data.dict(exclude_unset=True),
        },
    )

    org_service = OrganizationService(db)

    # Update organization
    updated_org = org_service.update_organization(
        UUID(str(membership.organization_id)), update_data.dict(exclude_unset=True)
    )
    if not updated_org:
        logger.error(
            "Organization update failed - organization not found",
            extra={"org_id": str(UUID(str(membership.organization_id)))},
        )
        raise HTTPException(status_code=404, detail="Organization not found")

    logger.info(
        "Organization update completed successfully",
        extra={"org_id": str(UUID(str(membership.organization_id))), "org_name": updated_org.name},
    )

    return OrganizationResponse.model_validate(updated_org)


@router.delete("/current")
async def delete_current_organization(
    request: Request,
    membership: Annotated[OrganizationMember, Depends(require_owner)],
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Delete current organization (owner only)."""
    org_service = OrganizationService(db)

    success = org_service.delete_organization(UUID(str(membership.organization_id)))
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found")

    return {"message": "Organization deleted successfully"}


# Member management endpoints
@router.get("/members", response_model=List[OrganizationMemberWithUser])
async def list_organization_members(
    request: Request,
    membership: Annotated[OrganizationMember, Depends(get_organization_member)],
    db: Annotated[Session, Depends(get_db)],
) -> List[OrganizationMemberWithUser]:
    """List current organization members with user data."""
    org_service = OrganizationService(db)

    members = org_service.get_organization_members(UUID(str(membership.organization_id)))
    return [OrganizationMemberWithUser.model_validate(member) for member in members]


@router.post("/members/{user_id}", response_model=OrganizationMemberResponse)
async def add_member_to_organization(
    request: Request,
    user_id: UUID,
    membership: Annotated[OrganizationMember, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
    role: str = "member",
) -> OrganizationMemberResponse:
    """Add member to current organization (admin+ required)."""
    org_service = OrganizationService(db)

    member = org_service.add_member(UUID(str(membership.organization_id)), user_id, role)
    return OrganizationMemberResponse.model_validate(member)


@router.put("/members/{user_id}/role")
async def update_member_role(
    user_id: UUID,
    new_role: str,
    membership: Annotated[OrganizationMember, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationMemberResponse:
    """Update member role (admin+ required)."""
    org_service = OrganizationService(db)

    updated_member = org_service.update_member_role(
        UUID(str(membership.organization_id)), user_id, new_role
    )
    if not updated_member:
        raise HTTPException(status_code=404, detail="Member not found")

    return OrganizationMemberResponse.model_validate(updated_member)


@router.delete("/members/{user_id}")
async def remove_member_from_organization(
    user_id: UUID,
    membership: Annotated[OrganizationMember, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Remove member from current organization (admin+ required)."""
    org_service = OrganizationService(db)

    success = org_service.remove_member(UUID(str(membership.organization_id)), user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")

    return {"message": "Member removed successfully"}


@router.post("/leave")
async def leave_organization(
    membership: Annotated[OrganizationMember, Depends(get_organization_member)],
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Leave current organization."""
    org_service = OrganizationService(db)

    # Prevent owner from leaving
    if membership.role == "owner":
        raise HTTPException(
            status_code=400, detail="Owner cannot leave organization. Transfer ownership first."
        )

    success = org_service.remove_member(
        UUID(str(membership.organization_id)), UUID(str(membership.user_id))
    )
    if not success:
        raise HTTPException(status_code=404, detail="Membership not found")

    return {"message": "Successfully left organization"}


# 🚀 PHASE 3: Advanced Member Management - Invite System


@router.post(
    "/invites", response_model=OrganizationInviteResponse, status_code=status.HTTP_201_CREATED
)
async def create_invite(
    request: Request,
    invite_data: OrganizationInviteCreate,
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationInviteResponse:
    """Create a new organization invite (admin+ required)."""
    invite_service = OrganizationInviteService(db)

    invite = invite_service.create_invite(
        organization_id=UUID(str(organization.id)), invite_data=invite_data, invited_by=current_user
    )

    return OrganizationInviteResponse.model_validate(invite)


@router.get("/invites", response_model=List[OrganizationInviteResponse])
async def list_organization_invites(
    request: Request,
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)],
    status_filter: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> List[OrganizationInviteResponse]:
    """List organization invites with filtering and pagination (admin+ required)."""
    invite_service = OrganizationInviteService(db)

    # Convert string status to enum if provided
    status_enum = None
    if status_filter:
        try:
            from ..models.organization_invite import InviteStatus

            status_enum = InviteStatus(status_filter.lower())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status filter: {status_filter}",
            )

    invites, total = invite_service.get_organization_invites(
        organization_id=UUID(str(organization.id)),
        user=current_user,
        status_filter=status_enum,
        limit=limit,
        offset=offset,
    )

    return invites


@router.delete("/invites/{invite_id}")
async def cancel_invite(
    invite_id: UUID,
    cancel_data: OrganizationInviteCancel,
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Cancel a pending invite (admin+ required)."""
    invite_service = OrganizationInviteService(db)

    invite = invite_service.cancel_invite(
        invite_id=invite_id,
        organization_id=UUID(str(organization.id)),
        user=current_user,
        reason=cancel_data.reason,
    )

    return {"message": f"Invite to {invite.email} has been cancelled"}


@router.get("/invites/stats", response_model=OrganizationInviteStats)
async def get_invite_stats(
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationInviteStats:
    """Get invitation statistics for the organization (admin+ required)."""
    invite_service = OrganizationInviteService(db)

    return invite_service.get_invite_stats(
        organization_id=UUID(str(organization.id)), user=current_user
    )
