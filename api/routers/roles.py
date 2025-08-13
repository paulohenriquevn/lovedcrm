"""🔐 Role Management Router - Advanced Authorization System.

Endpoints for managing organization roles with hierarchy validation and permissions.
"""
import logging
from typing import Annotated, Any, Dict, List, Set
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import get_current_active_user, get_current_organization
from ..models.organization import Organization
from ..models.organization_invite import OrganizationRole
from ..models.user import User
from ..schemas.organization import OrganizationMemberResponse
from ..services.audit_service import AuditService
from ..services.role_management_service import RoleManagementService

router = APIRouter(prefix="/roles", tags=["Role Management"])
logger = logging.getLogger(__name__)


def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def get_user_agent(request: Request) -> str:
    """Get user agent from request."""
    return request.headers.get("user-agent", "unknown")


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
    request: Request,
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
    audit_service = AuditService(db)

    # Get current member data for audit logging
    from sqlalchemy import and_
    from ..models.organization import OrganizationMember

    current_membership = (
        db.query(OrganizationMember)
        .filter(
            and_(
                OrganizationMember.organization_id == organization.id,
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
            )
        )
        .first()
    )

    if not current_membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in organization",
        )

    old_role = current_membership.role

    try:
        # Perform role change
        updated_membership = role_service.change_member_role(
            organization_id=UUID(str(organization.id)),
            target_user_id=user_id,
            new_role=role_change.new_role,
            manager_user=current_user,
        )

        # Audit log the role change
        try:
            await audit_service.log_role_change(
                org_id=organization.id,
                target_user_id=user_id,
                old_role=old_role,
                new_role=role_change.new_role.value,
                manager_user_id=current_user.id,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request),
            )

            logger.info(
                "Role change audit logged successfully",
                extra={
                    "organization_id": str(organization.id),
                    "target_user_id": str(user_id),
                    "old_role": old_role,
                    "new_role": role_change.new_role.value,
                    "manager_user_id": str(current_user.id),
                }
            )

        except Exception as audit_error:
            # Log audit failure but don't fail the role change operation
            logger.error(
                "Failed to log role change audit",
                extra={
                    "organization_id": str(organization.id),
                    "target_user_id": str(user_id),
                    "error": str(audit_error),
                },
                exc_info=True,
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
    request: Request,
    organization: Annotated[Organization, Depends(get_current_organization)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Remove a member from the organization.

    Requires appropriate permissions based on role hierarchy.
    Cannot remove the last owner.
    """
    role_service = RoleManagementService(db)
    audit_service = AuditService(db)

    # Get member data for audit logging before removal
    from sqlalchemy import and_
    from ..models.organization import OrganizationMember

    member_to_remove = (
        db.query(OrganizationMember)
        .filter(
            and_(
                OrganizationMember.organization_id == organization.id,
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
            )
        )
        .first()
    )

    if not member_to_remove:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in organization",
        )

    # Prepare audit data
    removed_user_data = {
        "user_id": str(user_id),
        "role": member_to_remove.role,
        "joined_at": member_to_remove.joined_at.isoformat() if member_to_remove.joined_at else None,
    }

    # Get user details if needed
    try:
        from ..models.user import User as UserModel
        user_details = db.query(UserModel).filter(UserModel.id == user_id).first()
        if user_details:
            removed_user_data.update({
                "email": user_details.email,
                "full_name": user_details.full_name,
            })
    except Exception:
        # Continue without user details if query fails
        pass

    try:
        # Perform member removal
        success = role_service.remove_member(
            organization_id=UUID(str(organization.id)),
            target_user_id=user_id,
            manager_user=current_user,
        )

        if success:
            # Audit log the member removal
            try:
                await audit_service.log_member_removal(
                    org_id=organization.id,
                    removed_user_id=user_id,
                    manager_user_id=current_user.id,
                    removed_user_data=removed_user_data,
                    ip_address=get_client_ip(request),
                    user_agent=get_user_agent(request),
                )

                logger.info(
                    "Member removal audit logged successfully",
                    extra={
                        "organization_id": str(organization.id),
                        "removed_user_id": str(user_id),
                        "manager_user_id": str(current_user.id),
                    }
                )

            except Exception as audit_error:
                # Log audit failure but don't fail the removal operation
                logger.error(
                    "Failed to log member removal audit",
                    extra={
                        "organization_id": str(organization.id),
                        "removed_user_id": str(user_id),
                        "error": str(audit_error),
                    },
                    exc_info=True,
                )

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
