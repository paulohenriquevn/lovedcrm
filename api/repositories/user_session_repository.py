"""Repository for UserSession data access operations.

This module provides data access operations for user sessions,
including session management and organization-scoped queries.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from ..models.user_session import UserSession
from .base import SQLRepository


class UserSessionRepository(SQLRepository[UserSession]):
    """Repository for managing user sessions with organization-scoped operations."""

    def __init__(self, db: Session):
        """Initialize UserSessionRepository."""
        super().__init__(db, UserSession)

    def get_active_sessions_by_user(
        self, user_id: uuid.UUID, organization_id: uuid.UUID, include_expired: bool = False
    ) -> List[UserSession]:
        """Get all active sessions for a user in an organization."""
        query = self.db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.organization_id == organization_id,
            UserSession.is_active is True,
        )

        if not include_expired:
            query = query.filter(UserSession.expires_at > datetime.utcnow())

        return query.order_by(desc(UserSession.last_activity)).all()

    def get_session_by_token(
        self, session_token: str, organization_id: uuid.UUID
    ) -> Optional[UserSession]:
        """Get session by token within organization context."""
        return (
            self.db.query(UserSession)
            .filter(
                UserSession.session_token == session_token,
                UserSession.organization_id == organization_id,
                UserSession.is_active is True,
                UserSession.expires_at > datetime.utcnow(),
            )
            .first()
        )

    def get_session_by_id_and_user(
        self, session_id: uuid.UUID, user_id: uuid.UUID, organization_id: uuid.UUID
    ) -> Optional[UserSession]:
        """Get session by ID, ensuring it belongs to the user in the organization."""
        return (
            self.db.query(UserSession)
            .filter(
                UserSession.id == session_id,
                UserSession.user_id == user_id,
                UserSession.organization_id == organization_id,
            )
            .first()
        )

    def create_session(
        self,
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        session_token: str,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None,
        location: Optional[str] = None,
        user_agent: Optional[str] = None,
        expires_at: Optional[datetime] = None,
    ) -> UserSession:
        """Create a new user session."""
        if expires_at is None:
            expires_at = UserSession.create_expiry_time()

        session = UserSession(
            user_id=user_id,
            organization_id=organization_id,
            session_token=session_token,
            device_info=device_info,
            ip_address=ip_address,
            location=location,
            user_agent=user_agent,
            expires_at=expires_at,
        )

        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def revoke_session(
        self, session_id: uuid.UUID, user_id: uuid.UUID, organization_id: uuid.UUID
    ) -> bool:
        """Revoke a specific session."""
        session = (
            self.db.query(UserSession)
            .filter(
                UserSession.id == session_id,
                UserSession.user_id == user_id,
                UserSession.organization_id == organization_id,
                UserSession.is_active is True,
            )
            .first()
        )

        if session:
            session.revoke()
            self.db.commit()
            return True
        return False

    def revoke_all_sessions_except_current(
        self, user_id: uuid.UUID, organization_id: uuid.UUID, current_session_token: str
    ) -> int:
        """Revoke all sessions for a user except the current one."""
        updated_count = (
            self.db.query(UserSession)
            .filter(
                UserSession.user_id == user_id,
                UserSession.organization_id == organization_id,
                UserSession.session_token != current_session_token,
                UserSession.is_active is True,
            )
            .update({"is_active": False})
        )

        self.db.commit()
        return updated_count

    def cleanup_expired_sessions(self, batch_size: int = 1000) -> int:
        """Clean up expired sessions (maintenance task)."""
        expired_count = (
            self.db.query(UserSession)
            .filter(UserSession.expires_at <= datetime.utcnow(), UserSession.is_active is True)
            .limit(batch_size)
            .update({"is_active": False})
        )

        self.db.commit()
        return expired_count

    def get_session_count_by_user(
        self, user_id: uuid.UUID, organization_id: uuid.UUID, active_only: bool = True
    ) -> int:
        """Get count of sessions for a user."""
        query = self.db.query(func.count(UserSession.id)).filter(
            UserSession.user_id == user_id, UserSession.organization_id == organization_id
        )

        if active_only:
            query = query.filter(
                UserSession.is_active is True, UserSession.expires_at > datetime.utcnow()
            )

        return query.scalar() or 0

    def update_session_activity(
        self,
        session_token: str,
        organization_id: uuid.UUID,
        ip_address: Optional[str] = None,
        location: Optional[str] = None,
    ) -> bool:
        """Update session last activity and optionally location/IP."""
        session = self.get_session_by_token(session_token, organization_id)
        if session:
            session.refresh_activity()
            if ip_address:
                session.ip_address = ip_address
            if location:
                session.location = location
            self.db.commit()
            return True
        return False
