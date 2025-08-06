"""Simple Organization Repository following KISS principle."""
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ..models.organization import Organization, OrganizationMember
from .base import SQLRepository

logger = logging.getLogger(__name__)


class SimpleOrganizationRepository(SQLRepository[Organization]):
    """Simple organization repository with essential functionality."""

    def __init__(self, db: Session):
        """Initialize organization repository with database session."""
        super().__init__(db, Organization)

    # Organization CRUD Operations
    def get_by_slug(self, slug: str) -> Optional[Organization]:
        """Get organization by slug."""
        return self.session.query(Organization).filter(Organization.slug == slug).first()

    def create_organization(self, org_data: Dict[str, Any], owner_id: UUID) -> Organization:
        """Create a new organization with owner membership."""
        # Create organization
        org_data["owner_id"] = owner_id
        organization = Organization(**org_data)
        organization = self.create(organization)

        # Create owner membership
        owner_membership = OrganizationMember(
            user_id=owner_id,
            organization_id=organization.id,
            role="owner",
            is_active=True,
        )

        self.session.add(owner_membership)
        self.session.commit()
        self.session.refresh(organization)

        return organization

    def update_organization(
        self, org_id: UUID, update_data: Dict[str, Any]
    ) -> Optional[Organization]:
        """Update organization."""
        org = self.find_by_id(org_id)
        if not org:
            return None

        for key, value in update_data.items():
            if hasattr(org, key):
                setattr(org, key, value)

        org.updated_at = func.now()
        return self.update(org)

    def delete_organization(self, org_id: UUID) -> bool:
        """Soft delete organization."""
        org = self.find_by_id(org_id)
        if not org:
            return False

        org.is_active = False
        org.updated_at = func.now()
        self.update(org)
        return True

    # Member Management Operations
    def get_organization_members(self, org_id: UUID) -> List[OrganizationMember]:
        """Get all members of an organization."""
        return (
            self.session.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.is_active.is_(True),
            )
            .options(joinedload(OrganizationMember.user))
            .all()
        )

    def add_member(self, org_id: UUID, user_id: UUID, role: str = "member") -> OrganizationMember:
        """Add member to organization."""
        membership = OrganizationMember(
            organization_id=org_id,
            user_id=user_id,
            role=role,
            is_active=True,
        )

        self.session.add(membership)
        self.session.commit()
        self.session.refresh(membership)
        return membership

    def update_member_role(
        self, org_id: UUID, user_id: UUID, new_role: str
    ) -> Optional[OrganizationMember]:
        """Update member role."""
        membership = (
            self.session.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
            )
            .first()
        )

        if not membership:
            return None

        membership.role = new_role
        membership.updated_at = func.now()
        self.session.commit()
        self.session.refresh(membership)
        return membership

    def remove_member(self, org_id: UUID, user_id: UUID) -> bool:
        """Remove member from organization."""
        membership = (
            self.session.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
            )
            .first()
        )

        if not membership:
            return False

        membership.is_active = False
        membership.updated_at = func.now()
        self.session.commit()
        return True

    def get_user_organizations(self, user_id: UUID) -> List[Organization]:
        """List organizations where user is a member."""
        return (
            self.session.query(Organization)
            .join(OrganizationMember)
            .filter(
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
                Organization.is_active.is_(True),
            )
            .all()
        )

    def get_user_membership(self, org_id: UUID, user_id: UUID) -> Optional[OrganizationMember]:
        """Get user's membership in organization."""
        return (
            self.session.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user_id,
                OrganizationMember.is_active.is_(True),
            )
            .first()
        )

    def check_user_role(self, org_id: UUID, user_id: UUID, required_roles: List[str]) -> bool:
        """Check if user has required role in organization."""
        membership = self.get_user_membership(org_id, user_id)
        return membership is not None and membership.role in required_roles

    def get_user_role(self, org_id: UUID, user_id: UUID) -> Optional[str]:
        """Get user's role in organization."""
        membership = self.get_user_membership(org_id, user_id)
        return membership.role if membership else None


def get_organization_repository(db: Session) -> SimpleOrganizationRepository:
    """Dependency injection for organization repository."""
    return SimpleOrganizationRepository(db)
