"""Service for managing user sessions with security and organization context.

This module provides business logic for user session management,
including session creation, validation, and security tracking.
"""
import secrets
import uuid
from typing import Optional

from fastapi import Request
from sqlalchemy.orm import Session
from user_agents import parse

from ..models.organization import Organization
from ..models.user import User
from ..models.user_session import UserSession
from ..repositories.user_session_repository import UserSessionRepository
from ..schemas.user_session import UserSessionListResponse, UserSessionResponse


class UserSessionService:
    """Service for comprehensive user session management."""

    def __init__(self, db: Session):
        """Initialize UserSessionService."""
        self.db = db
        self.repository = UserSessionRepository(db)

    def generate_session_token(self) -> str:
        """Generate a cryptographically secure session token."""
        return secrets.token_urlsafe(32)

    def parse_device_info(self, user_agent_string: Optional[str]) -> str:
        """Parse user agent string into readable device info."""
        if not user_agent_string:
            return "Unknown Device"
        
        try:
            user_agent = parse(user_agent_string)
            browser = f"{user_agent.browser.family} {user_agent.browser.version_string}"
            os = f"{user_agent.os.family} {user_agent.os.version_string}"
            return f"{browser} on {os}"
        except Exception:
            # Fallback for parsing errors
            return "Unknown Device"

    def extract_location_from_ip(self, ip_address: Optional[str]) -> Optional[str]:
        """Extract location from IP address (placeholder for GeoIP service)."""
        if not ip_address:
            return None
        
        # TODO: Integrate with GeoIP service (MaxMind, IP2Location, etc.)
        # For now, return a placeholder
        if ip_address.startswith("192.168.") or ip_address.startswith("10.") or ip_address.startswith("127."):
            return "Local Network"
        
        return "Unknown Location"

    def get_client_ip(self, request: Request) -> Optional[str]:
        """Extract client IP from request headers."""
        # Check for forwarded headers (proxy/load balancer)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            # Take the first IP (original client)
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection
        if hasattr(request, "client") and request.client:
            return request.client.host
        
        return None

    def create_session(
        self,
        user: User,
        organization: Organization,
        request: Optional[Request] = None
    ) -> UserSession:
        """Create a new user session with device and location tracking."""
        session_token = self.generate_session_token()
        
        # Extract request information
        ip_address = None
        user_agent = None
        if request:
            ip_address = self.get_client_ip(request)
            user_agent = request.headers.get("user-agent")
        
        device_info = self.parse_device_info(user_agent)
        location = self.extract_location_from_ip(ip_address)
        
        return self.repository.create_session(
            user_id=user.id,
            organization_id=organization.id,
            session_token=session_token,
            device_info=device_info,
            ip_address=ip_address,
            location=location,
            user_agent=user_agent
        )

    def get_active_sessions(
        self,
        user: User,
        organization: Organization,
        current_session_token: Optional[str] = None
    ) -> UserSessionListResponse:
        """Get all active sessions for a user with current session marking."""
        sessions = self.repository.get_active_sessions_by_user(
            user_id=user.id,
            organization_id=organization.id
        )
        
        # Convert to response format and mark current session
        session_responses = []
        current_session_id = None
        
        for session in sessions:
            is_current = (
                current_session_token is not None
                and session.session_token == current_session_token
            )
            
            if is_current:
                current_session_id = session.id
            
            session_response = UserSessionResponse(
                id=session.id,
                user_id=session.user_id,
                organization_id=session.organization_id,
                session_token=session.session_token,
                device_info=session.device_info,
                ip_address=session.ip_address,
                location=session.location,
                user_agent=session.user_agent,
                is_active=session.is_active,
                last_activity=session.last_activity,
                created_at=session.created_at,
                expires_at=session.expires_at,
                current=is_current
            )
            session_responses.append(session_response)
        
        return UserSessionListResponse(
            sessions=session_responses,
            total=len(session_responses),
            current_session_id=current_session_id
        )

    def revoke_session(
        self,
        session_id: uuid.UUID,
        user: User,
        organization: Organization
    ) -> bool:
        """Revoke a specific user session."""
        return self.repository.revoke_session(
            session_id=session_id,
            user_id=user.id,
            organization_id=organization.id
        )

    def revoke_all_sessions_except_current(
        self,
        user: User,
        organization: Organization,
        current_session_token: str
    ) -> int:
        """Revoke all sessions except the current one."""
        return self.repository.revoke_all_sessions_except_current(
            user_id=user.id,
            organization_id=organization.id,
            current_session_token=current_session_token
        )

    def validate_session(
        self,
        session_token: str,
        organization: Organization
    ) -> Optional[UserSession]:
        """Validate and return session if active and not expired."""
        return self.repository.get_session_by_token(
            session_token=session_token,
            organization_id=organization.id
        )

    def update_session_activity(
        self,
        session_token: str,
        organization: Organization,
        request: Optional[Request] = None
    ) -> bool:
        """Update session activity and location if request provided."""
        ip_address = None
        location = None
        
        if request:
            ip_address = self.get_client_ip(request)
            location = self.extract_location_from_ip(ip_address)
        
        return self.repository.update_session_activity(
            session_token=session_token,
            organization_id=organization.id,
            ip_address=ip_address,
            location=location
        )

    def cleanup_expired_sessions(self, batch_size: int = 1000) -> int:
        """Clean up expired sessions (maintenance task)."""
        return self.repository.cleanup_expired_sessions(batch_size=batch_size)

    def get_session_statistics(
        self,
        user: User,
        organization: Organization
    ) -> dict:
        """Get session statistics for a user."""
        active_count = self.repository.get_session_count_by_user(
            user_id=user.id,
            organization_id=organization.id,
            active_only=True
        )
        
        total_count = self.repository.get_session_count_by_user(
            user_id=user.id,
            organization_id=organization.id,
            active_only=False
        )
        
        return {
            "active_sessions": active_count,
            "total_sessions": total_count,
            "expired_sessions": total_count - active_count
        }
