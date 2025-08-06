"""🔐 Role Management Router - Advanced Authorization System.

Endpoints for managing organization roles with hierarchy validation and permissions.
"""
from typing import Annotated, Any, Dict, List, Set
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import get_current_active_user, get_current_organization
from ..models.organization import Organization
from ..models.organization_invite import OrganizationRole
from ..models.user import User
from ..schemas.organization import OrganizationMemberResponse
from ..services.role_management_service import RoleManagementService

router = APIRouter(prefix="/organizations/roles", tags=["Role Management"])


# Pydantic schemas for role management
class RoleChangeRequest(BaseModel):
    """Request to change a member's role."""

    new_role: OrganizationRole
    reason: str = None


class RolePermissionsResponse(BaseModel):
    """Response with user's permissions."""

    user_id: UUID
    organization_id: UUID
    role: OrganizationRole
    permissions: Set[str]


class OrganizationRolesSummary(BaseModel):
    """Summary of roles in organization."""

    organization_id: UUID
    role_counts: Dict[str, int]
    total_members: int


class ManageableRolesResponse(BaseModel):
    """Roles that user can manage."""

    manageable_roles: List[OrganizationRole]
    current_user_role: OrganizationRole


@router.put("/members/{user_id}", response_model=OrganizationMemberResponse)
async def change_member_role(
    user_id: UUID,
    role_change: RoleChangeRequest,
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationMemberResponse:
    """Change a member's role in the organization.

    Requires appropriate permissions based on role hierarchy:
    - Owners can manage all roles
    - Admins can manage members and viewers
    - Members and viewers cannot manage roles
    """
    role_service = RoleManagementService(db)

    try:
        updated_membership = role_service.change_member_role(
            organization_id=UUID(str(organization.id)),
            target_user_id=user_id,
            new_role=role_change.new_role,
            manager_user=current_user,
        )

        return OrganizationMemberResponse.model_validate(updated_membership)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to change member role"
        ) from e


@router.delete("/members/{user_id}")
async def remove_member(
    user_id: UUID,
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Remove a member from the organization.

    Requires appropriate permissions based on role hierarchy.
    Cannot remove the last owner.
    """
    role_service = RoleManagementService(db)

    try:
        success = role_service.remove_member(
            organization_id=UUID(str(organization.id)),
            target_user_id=user_id,
            manager_user=current_user,
        )

        if success:
            return {"message": "Member removed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to remove member"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to remove member"
        ) from e


@router.get("/permissions", response_model=RolePermissionsResponse)
async def get_user_permissions(
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> RolePermissionsResponse:
    """Get current user's permissions in the organization."""
    role_service = RoleManagementService(db)

    permissions = role_service.get_user_permissions(
        UUID(str(organization.id)), UUID(str(current_user.id))
    )

    # Get user's current role
    from sqlalchemy import and_

    from ..models.organization import OrganizationMember

    membership = (
        db.query(OrganizationMember)
        .filter(
            and_(
                OrganizationMember.organization_id == UUID(str(organization.id)),
                OrganizationMember.user_id == UUID(str(current_user.id)),
                OrganizationMember.is_active.is_(True),
            )
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this organization",
        )

    return RolePermissionsResponse(
        user_id=UUID(str(current_user.id)),
        organization_id=UUID(str(organization.id)),
        role=OrganizationRole(membership.role),
        permissions=permissions,
    )


@router.get("/permissions/{user_id}", response_model=RolePermissionsResponse)
async def get_member_permissions(
    user_id: UUID,
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> RolePermissionsResponse:
    """Get another member's permissions in the organization.

    Requires 'view_members' permission.
    """
    role_service = RoleManagementService(db)

    # Check if current user has permission to view members
    if not role_service.check_permission(
        UUID(str(organization.id)), UUID(str(current_user.id)), "view_members"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view member details",
        )

    permissions = role_service.get_user_permissions(UUID(str(organization.id)), user_id)

    if not permissions:  # User is not a member
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this organization",
        )

    # Get target user's role
    from sqlalchemy import and_

    from ..models.organization import OrganizationMember

    membership = (
        db.query(OrganizationMember)
        .filter(
            and_(
                OrganizationMember.organization_id == UUID(str(organization.id)),
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
            )
        )
        .first()
    )

    return RolePermissionsResponse(
        user_id=user_id,
        organization_id=UUID(str(organization.id)),
        role=OrganizationRole(membership.role),
        permissions=permissions,
    )


@router.get("/summary", response_model=OrganizationRolesSummary)
async def get_roles_summary(
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationRolesSummary:
    """Get summary of roles in the organization.

    Shows count of members by role.
    """
    role_service = RoleManagementService(db)

    # Check if user has permission to view members
    if not role_service.check_permission(
        UUID(str(organization.id)), UUID(str(current_user.id)), "view_members"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view organization summary",
        )

    role_counts = role_service.get_organization_roles_summary(UUID(str(organization.id)))
    total_members = sum(role_counts.values())

    return OrganizationRolesSummary(
        organization_id=UUID(str(organization.id)),
        role_counts=role_counts,
        total_members=total_members,
    )


@router.get("/manageable", response_model=ManageableRolesResponse)
async def get_manageable_roles(
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ManageableRolesResponse:
    """Get roles that current user can assign/manage."""
    role_service = RoleManagementService(db)

    manageable_roles = role_service.get_manageable_roles_for_user(
        UUID(str(organization.id)), UUID(str(current_user.id))
    )

    # Get current user's role
    from sqlalchemy import and_

    from ..models.organization import OrganizationMember

    membership = (
        db.query(OrganizationMember)
        .filter(
            and_(
                OrganizationMember.organization_id == UUID(str(organization.id)),
                OrganizationMember.user_id == UUID(str(current_user.id)),
                OrganizationMember.is_active.is_(True),
            )
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this organization",
        )

    return ManageableRolesResponse(
        manageable_roles=manageable_roles, current_user_role=OrganizationRole(membership.role)
    )


@router.get("/check-permission")
async def check_specific_permission(
    permission: str,
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, Any]:
    """Check if current user has a specific permission."""
    role_service = RoleManagementService(db)

    has_permission = role_service.check_permission(
        UUID(str(organization.id)), UUID(str(current_user.id)), permission
    )

    return {"permission": permission, "has_permission": has_permission}
