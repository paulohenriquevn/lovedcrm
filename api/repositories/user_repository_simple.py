"""Simple User Repository following KISS principle - Essential functionality only."""
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.organization import OrganizationMember
from ..models.user import User
from .base import SQLRepository

logger = logging.getLogger(__name__)


class SimpleUserRepository(SQLRepository[User]):
    """Simple user repository with only essential functionality."""

    def __init__(self, db: Session):
        """Initialize user repository with database session."""
        super().__init__(db, User)

    # Core CRUD Operations
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.session.query(User).filter(User.email == email).first()

    def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create new user."""
        user = User(**user_data)
        return self.create(user)

    def update_user(self, user_id: UUID, update_data: Dict[str, Any]) -> Optional[User]:
        """Update user data."""
        user = self.find_by_id(user_id)
        if not user:
            return None

        for key, value in update_data.items():
            if hasattr(user, key):
                setattr(user, key, value)

        user.updated_at = func.now()
        return self.update(user)

    def set_active_status(self, user_id: UUID, is_active: bool) -> Optional[User]:
        """Set user active status."""
        return self.update_user(user_id, {"is_active": is_active})

    def verify_email(self, user_id: UUID) -> Optional[User]:
        """Mark user email as verified."""
        return self.update_user(user_id, {"is_verified": True})

    def get_user_organizations(self, user_id: UUID) -> List[OrganizationMember]:
        """Get user's organization memberships."""
        return (
            self.session.query(OrganizationMember)
            .filter(OrganizationMember.user_id == user_id, OrganizationMember.is_active.is_(True))
            .all()
        )

    def get_users(
        self, limit: int = 50, offset: int = 0, search: Optional[str] = None
    ) -> List[User]:
        """Get users with pagination and search."""
        query = self.session.query(User)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (User.email.ilike(search_pattern)) | (User.full_name.ilike(search_pattern))
            )

        return query.offset(offset).limit(limit).all()


def get_user_repository(db: Session) -> SimpleUserRepository:
    """Dependency injection for user repository."""
    return SimpleUserRepository(db)
