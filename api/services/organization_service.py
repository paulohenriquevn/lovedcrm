"""Ultra-simple organization service - basic functionality only.

Simplified service following KISS principles from CLAUDE.md
"""
import logging
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.organization import Organization, OrganizationMember
from ..models.user import User

logger = logging.getLogger(__name__)


class OrganizationService:
    """Ultra-simple organization service without complex features."""

    def __init__(self, db: Session):
        """Initialize organization service with database session."""
        self.db = db

    def get_organization_by_id(self, org_id: UUID) -> Optional[Organization]:
        """Get organization by ID."""
        return self.db.query(Organization).filter(Organization.id == org_id).first()

    def get_user_organizations(self, user: User) -> List[Organization]:
        """Get all organizations for a user."""
        return (
            self.db.query(Organization)
            .join(OrganizationMember)
            .filter(OrganizationMember.user_id == user.id)
            .all()
        )

    def get_user_organizations_with_roles(self, user: User) -> List[Dict]:
        """Get all organizations for a user with their roles."""
        results = (
            self.db.query(Organization, OrganizationMember.role)
            .join(OrganizationMember)
            .filter(OrganizationMember.user_id == user.id)
            .all()
        )

        organizations_with_roles = []
        for org, role in results:
            org_dict = {
                "id": org.id,
                "name": org.name,
                "slug": org.slug,
                "description": org.description,
                "website": org.website,
                "is_active": org.is_active,
                "created_at": org.created_at,
                "updated_at": org.updated_at,
                "owner_id": org.owner_id,
                "role": role,
            }
            organizations_with_roles.append(org_dict)

        return organizations_with_roles

    def get_organization_members(self, org_id: UUID) -> List[OrganizationMember]:
        """Get all members of an organization with user data."""
        from sqlalchemy.orm import joinedload

        return (
            self.db.query(OrganizationMember)
            .options(joinedload(OrganizationMember.user))
            .filter(OrganizationMember.organization_id == org_id)
            .all()
        )

    def create_organization(self, name: str, owner_id: UUID) -> Organization:
        """Create new organization with owner."""
        # Create organization
        org = Organization(
            name=name, slug=name.lower().replace(" ", "-"), owner_id=owner_id, is_active=True
        )
        self.db.add(org)
        self.db.flush()

        # Add owner as member
        member = OrganizationMember(
            organization_id=org.id, user_id=owner_id, role="owner", is_active=True
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(org)

        return org

    def update_organization(self, org_id: UUID, update_data: Dict) -> Optional[Organization]:
        """Update organization."""
        org = self.get_organization_by_id(org_id)
        if not org:
            logger.warning(f"Attempted to update non-existent organization: {org_id}")
            return None

        logger.info(
            "Updating organization",
            extra={
                "org_id": str(org_id),
                "org_name": org.name,
                "updated_fields": list(update_data.keys()),
                "update_data": update_data,
            },
        )

        for key, value in update_data.items():
            if hasattr(org, key):
                old_value = getattr(org, key)
                setattr(org, key, value)
                logger.debug(f"Updated field {key}: '{old_value}' → '{value}'")

        self.db.commit()
        self.db.refresh(org)

        logger.info(
            "Organization updated successfully",
            extra={
                "org_id": str(org_id),
                "org_name": org.name,
                "updated_fields": list(update_data.keys()),
            },
        )

        return org

    def delete_organization(self, org_id: UUID) -> bool:
        """Delete organization and all members."""
        org = self.get_organization_by_id(org_id)
        if not org:
            return False

        # Delete members first
        self.db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == org_id
        ).delete()

        # Delete organization
        self.db.delete(org)
        self.db.commit()
        return True

    def add_member(self, org_id: UUID, user_id: UUID, role: str = "member") -> OrganizationMember:
        """Add member to organization."""
        member = OrganizationMember(
            organization_id=org_id, user_id=user_id, role=role, is_active=True
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def remove_member(self, org_id: UUID, user_id: UUID) -> bool:
        """Remove member from organization."""
        member = (
            self.db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id, OrganizationMember.user_id == user_id
            )
            .first()
        )

        if not member:
            return False

        self.db.delete(member)
        self.db.commit()
        return True

    def update_member_role(
        self, org_id: UUID, user_id: UUID, new_role: str
    ) -> Optional[OrganizationMember]:
        """Update member role."""
        member = (
            self.db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id, OrganizationMember.user_id == user_id
            )
            .first()
        )

        if not member:
            return None

        member.role = new_role
        self.db.commit()
        self.db.refresh(member)
        return member

    def is_user_member(self, org_id: UUID, user_id: UUID) -> bool:
        """Check if user is member of organization."""
        member = (
            self.db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
            )
            .first()
        )
        return member is not None

    def get_user_role(self, org_id: UUID, user_id: UUID) -> Optional[str]:
        """Get user role in organization."""
        member = (
            self.db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
            )
            .first()
        )
        return member.role if member else None

    def get_organization_with_members(self, org: Organization) -> Organization:
        """Get organization with members loaded."""
        # Simple version - just return the org, members loaded via relationship
        return org

    def invite_member(
        self, org: Organization, email: str, role: str, current_user: User
    ) -> OrganizationMember:
        """Invite member to organization (simplified)."""
        # Find user by email
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if already member
        existing_member = (
            self.db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org.id, OrganizationMember.user_id == user.id
            )
            .first()
        )

        if existing_member:
            raise HTTPException(status_code=400, detail="User is already a member")

        # Add as member
        return self.add_member(org.id, user.id, role)

    def update_member(self, org: Organization, user_id: str, update_data) -> OrganizationMember:
        """Update member role."""
        from uuid import UUID

        return self.update_member_role(org.id, UUID(user_id), update_data.role)

    def remove_member_by_org(self, org: Organization, user_id: str) -> bool:
        """Remove member from organization."""
        from uuid import UUID

        return self.remove_member(org.id, UUID(user_id))

    def leave_organization(self, membership: OrganizationMember) -> dict:
        """Leave organization."""
        if membership.role == "owner":
            raise HTTPException(status_code=400, detail="Owner cannot leave organization")

        membership.is_active = False
        self.db.commit()
        return {"message": "Successfully left organization"}
