"""Simplified Users Router - following KISS principle."""

from typing import Annotated, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import get_current_active_user, get_current_organization, require_admin
from ..core.security import get_password_hash, verify_password
from ..models.organization import Organization, OrganizationMember
from ..models.user import User
from ..repositories.user_repository_simple import get_user_repository
from ..schemas.organization import OrganizationResponse
from ..schemas.user import UserDeactivate, UserPasswordChange, UserResponse, UserUpdate
from ..schemas.user_session import UserSessionListResponse, RevokeAllSessionsRequest
from ..schemas.user_two_factor import (
    TwoFactorBackupCodesResponse,
    TwoFactorConfirmRequest,
    TwoFactorDisableRequest,
    TwoFactorSetupResponse,
    TwoFactorStatusResponse,
)
from ..services.organization_service import OrganizationService
from ..services.user_session_service import UserSessionService
from ..services.user_two_factor_service import UserTwoFactorService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> UserResponse:
    """Get current user profile."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Update current user profile."""
    try:
        repository = get_user_repository(db)

        # Basic sanitization for XSS prevention
        update_data = user_update.dict(exclude_unset=True)

        # If email is being changed, reset is_verified
        if "email" in update_data and update_data["email"] != current_user.email:
            update_data["is_verified"] = False

        updated_user = repository.update_user(
            user_id=UUID(str(current_user.id)), update_data=update_data
        )

        if not updated_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        return UserResponse.model_validate(updated_user)

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_current_user_password(
    password_data: UserPasswordChange,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Change current user password."""
    # Verify current password
    if not verify_password(password_data.current_password, str(current_user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect"
        )

    # Check if new password is different from current
    if verify_password(password_data.new_password, str(current_user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as current password",
        )

    # Hash new password and update
    try:
        hashed_new_password = get_password_hash(password_data.new_password)
        repository = get_user_repository(db)
        repository.update_user(
            user_id=UUID(str(current_user.id)), update_data={"hashed_password": hashed_new_password}
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/me/deactivate", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_current_user_account(
    deactivate_data: UserDeactivate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Deactivate current user account."""
    try:
        repository = get_user_repository(db)
        repository.update_user(user_id=UUID(str(current_user.id)), update_data={"is_active": False})

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.get("/me/organizations", response_model=List[OrganizationResponse])
async def get_current_user_organizations(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> List[OrganizationResponse]:
    """Get organizations where the current user is a member."""
    try:
        org_service = OrganizationService(db)
        organizations = org_service.get_user_organizations(current_user)

        return [OrganizationResponse.model_validate(org) for org in organizations]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user organizations: {str(e)}",
        ) from e


# Organization-scoped admin endpoints
@router.get("/", response_model=List[UserResponse])
async def get_organization_users(
    membership: Annotated[OrganizationMember, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    search: Annotated[Optional[str], Query()] = None,
) -> List[UserResponse]:
    """Get users from current organization (admin+ required)."""
    try:
        org_service = OrganizationService(db)
        org_members = org_service.get_organization_members(UUID(str(membership.organization_id)))

        # Get users from organization members
        user_ids = [member.user_id for member in org_members]

        # Apply search and pagination
        query = db.query(User).filter(User.id.in_(user_ids))

        if search:
            query = query.filter(
                User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
            )

        query = query.offset(offset).limit(limit)
        users = query.all()

        return [UserResponse.model_validate(user) for user in users]

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.get("/{user_id}", response_model=UserResponse)
async def get_organization_user_by_id(
    user_id: UUID,
    membership: Annotated[OrganizationMember, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Get user by ID from current organization (admin+ required)."""
    try:
        # Check if user is member of current organization
        user_membership = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.user_id == user_id,
                OrganizationMember.organization_id == membership.organization_id,
                OrganizationMember.is_active.is_(True),
            )
            .first()
        )

        if not user_membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found in organization"
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        return UserResponse.model_validate(user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.put("/{user_id}", response_model=UserResponse)
async def update_organization_user_by_admin(
    user_id: UUID,
    user_update: UserUpdate,
    membership: Annotated[OrganizationMember, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Update user by ID from current organization (admin+ required)."""
    try:
        # Check if user is member of current organization
        user_membership = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.user_id == user_id,
                OrganizationMember.organization_id == membership.organization_id,
                OrganizationMember.is_active.is_(True),
            )
            .first()
        )

        if not user_membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found in organization"
            )

        repository = get_user_repository(db)

        # Basic sanitization for XSS prevention
        update_data = user_update.dict(exclude_unset=True)

        updated_user = repository.update_user(user_id=user_id, update_data=update_data)

        if not updated_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        return UserResponse.model_validate(updated_user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


# Session Management Endpoints
@router.get("/me/sessions", response_model=UserSessionListResponse)
async def get_user_sessions(
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> UserSessionListResponse:
    """Get all active sessions for the current user."""
    try:
        session_service = UserSessionService(db)
        
        # Extract current session token from Authorization header
        current_session_token = None
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            current_session_token = auth_header[7:]  # Remove "Bearer " prefix
        
        return session_service.get_active_sessions(
            user=current_user,
            organization=organization,
            current_session_token=current_session_token
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user sessions: {str(e)}"
        ) from e


@router.delete("/me/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_user_session(
    session_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Revoke a specific user session."""
    try:
        session_service = UserSessionService(db)
        
        success = session_service.revoke_session(
            session_id=session_id,
            user=current_user,
            organization=organization
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or already revoked"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke session: {str(e)}"
        ) from e


@router.post("/me/sessions/revoke-all", status_code=status.HTTP_200_OK)
async def revoke_all_user_sessions(
    request_data: RevokeAllSessionsRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> dict:
    """Revoke all user sessions except the current one."""
    try:
        if not request_data.confirm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session revocation must be confirmed"
            )
        
        session_service = UserSessionService(db)
        
        # Extract current session token from Authorization header
        current_session_token = None
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            current_session_token = auth_header[7:]  # Remove "Bearer " prefix
        
        if not current_session_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot identify current session"
            )
        
        revoked_count = session_service.revoke_all_sessions_except_current(
            user=current_user,
            organization=organization,
            current_session_token=current_session_token
        )
        
        return {
            "message": f"Successfully revoked {revoked_count} sessions",
            "revoked_sessions": revoked_count,
            "current_session_preserved": True
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke sessions: {str(e)}"
        ) from e


# =====================================================
# 🔐 TWO-FACTOR AUTHENTICATION ENDPOINTS
# =====================================================

@router.get("/me/2fa/status", response_model=TwoFactorStatusResponse)
async def get_2fa_status(
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)]
) -> TwoFactorStatusResponse:
    """Get current 2FA status for the authenticated user."""
    try:
        service = UserTwoFactorService(db)
        return service.get_2fa_status(current_user, organization)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get 2FA status: {str(e)}"
        ) from e


@router.post("/me/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_2fa(
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)]
) -> TwoFactorSetupResponse:
    """Setup 2FA for the authenticated user - generates secret key and QR code."""
    try:
        service = UserTwoFactorService(db)
        
        # Check if 2FA is already enabled
        status_response = service.get_2fa_status(current_user, organization)
        if status_response.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA is already enabled for this user"
            )
        
        return service.setup_2fa(current_user, organization)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to setup 2FA: {str(e)}"
        ) from e


@router.post("/me/2fa/confirm")
async def confirm_2fa_setup(
    request: TwoFactorConfirmRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)]
) -> dict:
    """Confirm 2FA setup by verifying the first TOTP token."""
    try:
        service = UserTwoFactorService(db)
        
        # Check if 2FA is already enabled
        status_response = service.get_2fa_status(current_user, organization)
        if status_response.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA is already enabled for this user"
            )
        
        success = service.confirm_2fa_setup(current_user, organization, request.token)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TOTP token"
            )
        
        return {"message": "2FA has been successfully enabled"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm 2FA setup: {str(e)}"
        ) from e


@router.post("/me/2fa/disable")
async def disable_2fa(
    request: TwoFactorDisableRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)]
) -> dict:
    """Disable 2FA for the authenticated user."""
    try:
        service = UserTwoFactorService(db)
        
        # Validate that at least one credential is provided
        if not request.has_valid_credential():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either TOTP token or backup code is required"
            )
        
        # Check if 2FA is currently enabled
        status_response = service.get_2fa_status(current_user, organization)
        if not status_response.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA is not enabled for this user"
            )
        
        success = service.disable_2fa(
            current_user, 
            organization, 
            token=request.token,
            backup_code=request.backup_code
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TOTP token or backup code"
            )
        
        return {"message": "2FA has been successfully disabled"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable 2FA: {str(e)}"
        ) from e


@router.post("/me/2fa/backup-codes", response_model=TwoFactorBackupCodesResponse)
async def regenerate_backup_codes(
    current_user: Annotated[User, Depends(get_current_active_user)],
    organization: Annotated[Organization, Depends(get_current_organization)],
    db: Annotated[Session, Depends(get_db)]
) -> TwoFactorBackupCodesResponse:
    """Regenerate backup codes for the authenticated user."""
    try:
        service = UserTwoFactorService(db)
        
        # Check if 2FA is enabled
        status_response = service.get_2fa_status(current_user, organization)
        if not status_response.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA must be enabled to regenerate backup codes"
            )
        
        backup_codes_response = service.regenerate_backup_codes(current_user, organization)
        
        if not backup_codes_response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="2FA setup not found"
            )
        
        return backup_codes_response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate backup codes: {str(e)}"
        ) from e
