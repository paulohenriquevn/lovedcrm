"""🔐 Role Management Service - Advanced Authorization System.

Service for managing organization roles with hierarchy validation and permissions.
"""
from typing import Dict, List, Set
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from ..models.organization import OrganizationMember
from ..models.organization_invite import OrganizationRole
from ..models.user import User


class RoleManagementService:
    """Service for managing organization roles and permissions."""

    # Define role hierarchy (higher number = more permissions)
    ROLE_HIERARCHY = {
        OrganizationRole.viewer: 1,
        OrganizationRole.member: 2,
        OrganizationRole.admin: 3,
        OrganizationRole.owner: 4,
    }

    # Define permissions for each role
    ROLE_PERMISSIONS = {
        OrganizationRole.viewer: {
            "view_organization",
            "view_members",
        },
        OrganizationRole.member: {
            "view_organization",
            "view_members",
            "edit_profile",
            "leave_organization",
        },
        OrganizationRole.admin: {
            "view_organization",
            "view_members",
            "edit_profile",
            "leave_organization",
            "invite_members",
            "manage_members",
            "edit_organization",
            "view_analytics",
            "view_audit_logs",
            "view_member_activity",
        },
        OrganizationRole.owner: {
            "view_organization",
            "view_members",
            "edit_profile",
            "invite_members",
            "manage_members",
            "edit_organization",
            "view_analytics",
            "view_audit_logs",
            "view_member_activity",
            "delete_organization",
            "manage_admins",
            "transfer_ownership",
        },
    }

    def __init__(self, db: Session):
        """Initialize role management service with database session."""
        self.db = db

    def _get_user_membership(self, organization_id: UUID, user_id: UUID) -> OrganizationMember:
        """Get user's membership in organization."""
        membership = (
            self.db.query(OrganizationMember)
            .filter(
                and_(
                    OrganizationMember.organization_id == organization_id,
                    OrganizationMember.user_id == user_id,
                    OrganizationMember.is_active.is_(True),
                )
            )
            .first()
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is not a member",
            )

        return membership

    def _validate_role_change_permissions(
        self,
        manager_role: OrganizationRole,
        target_current_role: OrganizationRole,
        new_role: OrganizationRole,
    ) -> None:
        """Validate that manager can change target's role."""
        # Owner can manage anyone
        if manager_role == OrganizationRole.owner:
            return

        # Admin can manage members and viewers, but not other admins or owners
        if manager_role == OrganizationRole.admin:
            if target_current_role in [OrganizationRole.admin, OrganizationRole.owner]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admins cannot manage other admins or owners",
                )
            if new_role in [OrganizationRole.admin, OrganizationRole.owner]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admins cannot promote users to admin or owner",
                )
            return

        # Members and viewers cannot manage roles
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to manage roles"
        )

    def change_member_role(
        self,
        organization_id: UUID,
        target_user_id: UUID,
        new_role: OrganizationRole,
        manager_user: User,
    ) -> OrganizationMember:
        """Change a member's role in the organization."""
        # Get manager's membership
        manager_membership = self._get_user_membership(organization_id, manager_user.id)

        # Get target user's membership
        target_membership = self._get_user_membership(organization_id, target_user_id)

        # Validate permissions
        manager_role = OrganizationRole(manager_membership.role)
        target_current_role = OrganizationRole(target_membership.role)

        self._validate_role_change_permissions(manager_role, target_current_role, new_role)

        # Prevent self-demotion for owners
        if (
            manager_user.id == target_user_id
            and manager_role == OrganizationRole.owner
            and new_role != OrganizationRole.owner
        ):
            # Check if there are other owners
            other_owners = (
                self.db.query(OrganizationMember)
                .filter(
                    and_(
                        OrganizationMember.organization_id == organization_id,
                        OrganizationMember.role == OrganizationRole.owner.value,
                        OrganizationMember.user_id != manager_user.id,
                        OrganizationMember.is_active.is_(True),
                    )
                )
                .count()
            )

            if other_owners == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot remove the last owner. Transfer ownership first.",
                )

        # Update role
        target_membership.role = new_role.value
        self.db.commit()
        self.db.refresh(target_membership)

        return target_membership

    def remove_member(
        self, organization_id: UUID, target_user_id: UUID, manager_user: User
    ) -> bool:
        """Remove a member from the organization."""
        # Get manager's membership
        manager_membership = self._get_user_membership(organization_id, manager_user.id)

        # Get target user's membership
        target_membership = self._get_user_membership(organization_id, target_user_id)

        # Validate permissions
        manager_role = OrganizationRole(manager_membership.role)
        target_role = OrganizationRole(target_membership.role)

        # Only owners and admins can remove members
        if manager_role not in [OrganizationRole.owner, OrganizationRole.admin]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to remove members",
            )

        # Admins cannot remove other admins or owners
        if manager_role == OrganizationRole.admin and target_role in [
            OrganizationRole.admin,
            OrganizationRole.owner,
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admins cannot remove other admins or owners",
            )

        # Prevent removing the last owner
        if target_role == OrganizationRole.owner:
            other_owners = (
                self.db.query(OrganizationMember)
                .filter(
                    and_(
                        OrganizationMember.organization_id == organization_id,
                        OrganizationMember.role == OrganizationRole.owner.value,
                        OrganizationMember.user_id != target_user_id,
                        OrganizationMember.is_active.is_(True),
                    )
                )
                .count()
            )

            if other_owners == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the last owner"
                )

        # Remove member
        target_membership.is_active = False
        self.db.commit()

        return True

    def get_user_permissions(self, organization_id: UUID, user_id: UUID) -> Set[str]:
        """Get user's permissions in the organization."""
        try:
            membership = self._get_user_membership(organization_id, user_id)
            role = OrganizationRole(membership.role)
            return self.ROLE_PERMISSIONS.get(role, set())
        except HTTPException:
            return set()  # User is not a member

    def check_permission(self, organization_id: UUID, user_id: UUID, permission: str) -> bool:
        """Check if user has a specific permission."""
        permissions = self.get_user_permissions(organization_id, user_id)
        return permission in permissions

    def get_organization_roles_summary(self, organization_id: UUID) -> Dict[str, int]:
        """Get count of members by role in the organization."""
        from sqlalchemy import func

        result = (
            self.db.query(OrganizationMember.role, func.count(OrganizationMember.id).label("count"))
            .filter(
                and_(
                    OrganizationMember.organization_id == organization_id,
                    OrganizationMember.is_active.is_(True),
                )
            )
            .group_by(OrganizationMember.role)
            .all()
        )

        return dict(result)

    def get_manageable_roles_for_user(
        self, organization_id: UUID, user_id: UUID
    ) -> List[OrganizationRole]:
        """Get roles that user can assign to others."""
        try:
            membership = self._get_user_membership(organization_id, user_id)
            user_role = OrganizationRole(membership.role)

            if user_role == OrganizationRole.owner:
                return list(OrganizationRole)  # Owners can assign any role
            elif user_role == OrganizationRole.admin:
                return [
                    OrganizationRole.viewer,
                    OrganizationRole.member,
                ]  # Admins can only assign lower roles
            else:
                return []  # Members and viewers cannot assign roles

        except HTTPException:
            return []  # User is not a member
