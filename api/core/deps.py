"""Simplified dependencies following KISS principle.

Clean, simple, and functional dependency injection.
"""
import logging
from typing import Annotated, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from ..models.organization import Organization, OrganizationMember
from ..models.user import User
from .config import settings
from .database import get_db
from .security import verify_token
from .token_blacklist import is_token_blacklisted

security = HTTPBearer()
logger = logging.getLogger(__name__)


def _create_auth_exception(detail: str) -> HTTPException:
    """Create standardized authentication exception."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=f"Unauthorized: {detail}",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def _validate_token_and_get_user_data(token: str, require_org: bool = False) -> dict:
    """Validate token and extract user data including org_id."""
    # Check if token is blacklisted
    if await is_token_blacklisted(token, settings.REDIS_URL):
        raise _create_auth_exception("Token has been invalidated")

    try:
        payload = verify_token(token, "access")
        user_id = payload.get("sub")
        org_id = payload.get("org_id")

        if user_id is None:
            raise _create_auth_exception("Invalid authentication token")

        # 🔴 CRITICAL: ALWAYS require org_id in JWT - no exceptions for security
        if org_id is None:
            logger.error(
                f"CRITICAL SECURITY: JWT missing org_id for user {user_id} - INVALID TOKEN"
            )
            raise _create_auth_exception("Invalid token: missing organization context")

        # Additional validation when explicitly requested (for org-specific endpoints)
        if require_org and org_id is None:
            logger.error(f"JWT missing org_id for user {user_id} on org-required endpoint")
            raise _create_auth_exception("Invalid token: missing organization context")

        return {
            "user_id": str(user_id),
            "org_id": str(org_id),  # ALWAYS present now
            "role": payload.get("role", "member"),
        }
    except JWTError as exc:
        raise _create_auth_exception("Invalid authentication token") from exc


def _get_user_from_db(db: Session, user_id: str) -> User:
    """Fetch user from database and validate."""
    try:
        user_uuid = UUID(user_id)
    except ValueError as exc:
        raise _create_auth_exception("Invalid user ID format") from exc

    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        logger.error(f"User not found in database: {user_uuid}")
        raise _create_auth_exception("User not found")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    return user


async def get_current_user(
    token: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Get current authenticated user from bearer token (no org required)."""
    token_data = await _validate_token_and_get_user_data(token.credentials, require_org=False)
    user = _get_user_from_db(db, token_data["user_id"])

    # Store org_id in user object for easy access (pode ser None)
    setattr(user, "_token_org_id", token_data["org_id"])  # noqa: B010
    setattr(user, "_token_role", token_data["role"])  # noqa: B010

    return user


async def get_current_user_with_org(
    token: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Get current authenticated user with required organization context."""
    token_data = await _validate_token_and_get_user_data(token.credentials, require_org=True)
    user = _get_user_from_db(db, token_data["user_id"])

    # Store org_id in user object for easy access
    setattr(user, "_token_org_id", token_data["org_id"])  # noqa: B010
    setattr(user, "_token_role", token_data["role"])  # noqa: B010

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Inactive user"
        )
    return current_user


async def get_current_active_user_optional(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> Optional[User]:
    """Get current active user if authenticated, otherwise return None."""
    try:
        # Try to extract token from Authorization header
        authorization: str = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            return None

        token = authorization.split(" ")[1]
        token_data = verify_token(token, "access")

        user_id = token_data.get("sub")
        if not user_id:
            return None

        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            return None

        return user
    except Exception:
        # Any error means no authentication
        return None


def get_current_superuser(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """Get current superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The user doesn't have enough privileges",
        )
    return current_user


def get_organization_by_id(org_id: str, db: Session) -> Organization:
    """Get organization by ID."""
    try:
        org_uuid = UUID(org_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid organization ID format"
        ) from exc

    org = db.query(Organization).filter(Organization.id == org_uuid).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    return org


def get_user_membership(org_id: str, user: User, db: Session) -> OrganizationMember:
    """Get user's membership in organization."""
    try:
        org_uuid = UUID(org_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid organization ID format"
        ) from exc

    membership = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.user_id == user.id,
            OrganizationMember.organization_id == org_uuid,
            OrganizationMember.is_active.is_(True),
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )

    return membership


def get_org_id_from_header(request: Request) -> str:
    """Extract and validate org_id from X-Org-Id header."""
    org_id = request.headers.get("X-Org-Id")

    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Org-Id header for organization context",
        )

    # Validate UUID format
    try:
        UUID(org_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization ID format in X-Org-Id header",
        )

    return org_id


def _validate_organization_access(org_id: str, current_user: User) -> None:
    """Validate that user's JWT org_id matches the header org_id."""
    token_org_id = getattr(current_user, "_token_org_id", None)

    if not token_org_id:
        logger.error(f"User {current_user.id} token missing org_id")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing organization context",
        )

    if str(token_org_id) != str(org_id):
        logger.warning(
            f"Organization access denied: JWT org_id={token_org_id}, header org_id={org_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: organization mismatch"
        )


async def get_current_organization(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user_with_org)],
    db: Annotated[Session, Depends(get_db)],
) -> Organization:
    """Get current organization and verify user access."""
    # Extract org_id from header AFTER authentication is validated
    org_id = request.headers.get("X-Org-Id")

    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Org-Id header for organization context",
        )

    # Validate UUID format
    try:
        UUID(org_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid organization ID format in X-Org-Id header",
        )

    # 🔴 CRITICAL: Validate JWT org_id matches header org_id
    _validate_organization_access(org_id, current_user)

    org = get_organization_by_id(org_id, db)
    get_user_membership(org_id, current_user, db)  # Validates membership
    return org


async def get_organization_member(
    current_user: Annotated[User, Depends(get_current_active_user)],
    org_id: Annotated[str, Depends(get_org_id_from_header)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationMember:
    """Get current organization membership."""
    # 🔴 CRITICAL: Validate JWT org_id matches header org_id
    _validate_organization_access(org_id, current_user)

    return get_user_membership(org_id, current_user, db)


def require_role(required_roles: list[str]):
    """Dependency factory to require specific organization roles."""

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_active_user)],
        org_id: Annotated[str, Depends(get_org_id_from_header)],
        db: Annotated[Session, Depends(get_db)],
    ) -> OrganizationMember:
        # 🔴 CRITICAL: Validate JWT org_id matches header org_id
        _validate_organization_access(org_id, current_user)

        membership = get_user_membership(org_id, current_user, db)

        if membership.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {required_roles}",
            )

        return membership

    return role_checker


# Role-specific dependencies
async def require_owner(
    current_user: Annotated[User, Depends(get_current_active_user)],
    org_id: Annotated[str, Depends(get_org_id_from_header)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationMember:
    """Require organization owner role."""
    # 🔴 CRITICAL: Validate JWT org_id matches header org_id
    _validate_organization_access(org_id, current_user)

    membership = get_user_membership(org_id, current_user, db)

    if membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Owner permissions required"
        )

    return membership


async def require_admin(
    current_user: Annotated[User, Depends(get_current_active_user)],
    org_id: Annotated[str, Depends(get_org_id_from_header)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationMember:
    """Require organization admin or owner role."""
    # 🔴 CRITICAL: Validate JWT org_id matches header org_id
    _validate_organization_access(org_id, current_user)

    membership = get_user_membership(org_id, current_user, db)

    if membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or owner permissions required",
        )

    return membership


async def require_member(
    current_user: Annotated[User, Depends(get_current_active_user)],
    org_id: Annotated[str, Depends(get_org_id_from_header)],
    db: Annotated[Session, Depends(get_db)],
) -> OrganizationMember:
    """Require organization member role or higher."""
    # 🔴 CRITICAL: Validate JWT org_id matches header org_id
    _validate_organization_access(org_id, current_user)

    return get_user_membership(org_id, current_user, db)  # Any active member is allowed
