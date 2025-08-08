"""Authentication router with login, registration, and password management endpoints."""
import logging
from datetime import datetime
from typing import Annotated, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.security import HTTPBearer
from jose import JWTError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.database import get_db
from ..core.deps import get_current_active_user
from ..core.exceptions import AuthenticationError, DatabaseError
from ..core.security import verify_token
from ..core.token_blacklist import blacklist_token
from ..models.organization import Organization, OrganizationMember
from ..models.user import User
from ..schemas.auth import (
    EmailVerificationRequest,
    OAuthCallbackRequest,
    OAuthResponse,
    OrganizationSummary,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    RefreshTokenRequest,
    ResendVerificationRequest,
    Token,
)
from ..schemas.user import UserCreate, UserLogin, UserResponse

# AuditService removed - caused performance issues
from ..services.auth_simple import SimpleAuthService
from ..services.oauth_service import GoogleOAuthService
from ..services.recaptcha_service import RecaptchaAction, recaptcha_service

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


def _get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP from request for reCAPTCHA validation."""
    # Check X-Forwarded-For first (for proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Get first IP from comma-separated list
        return forwarded_for.split(",")[0].strip()

    # Check X-Real-IP
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    # Fallback to client host
    return request.client.host if request.client else None


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate, request: Request, db: Annotated[Session, Depends(get_db)]
) -> dict:
    """Register a new user and auto-create organization."""
    logger.info("🚀 REGISTER ENDPOINT CALLED - NEW VERSION")

    # 🤖 reCAPTCHA v3 Validation
    client_ip = _get_client_ip(request)
    await recaptcha_service.validate_request_token(
        user_data.recaptcha_token, RecaptchaAction.REGISTER, client_ip
    )

    try:
        auth_service = SimpleAuthService(db)
        user, organization = auth_service.register_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name,
            terms_accepted=user_data.terms_accepted,
        )

        # Create tokens for immediate login after registration
        tokens = auth_service.create_tokens(user)

        logger.info(
            "User registered successfully with auto-created organization",
            extra={
                "user_id": str(user.id),
                "email": user.email,
                "organization_id": str(organization.id),
                "organization_name": organization.name,
            },
        )

        return {
            "user": UserResponse.model_validate(user),
            "organization": {
                "id": str(organization.id),
                "name": organization.name,
                "slug": organization.slug,
                "description": organization.description,
                "website": organization.website,
                "is_active": organization.is_active,
                "created_at": organization.created_at.isoformat(),
                "updated_at": organization.updated_at.isoformat()
                if organization.updated_at
                else None,
            },
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": tokens["token_type"],
        }

    except SQLAlchemyError as e:
        logger.error(f"Database error during registration: {e}")
        raise DatabaseError("user registration") from e
    except Exception as e:
        logger.error(f"Unexpected error during registration: {e}")
        raise


@router.post("/login")
async def login(
    login_data: UserLogin,
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    """Login and get access token with organization context."""
    # 🤖 reCAPTCHA v3 Validation
    client_ip = _get_client_ip(request)
    await recaptcha_service.validate_request_token(
        login_data.recaptcha_token, RecaptchaAction.LOGIN, client_ip
    )

    try:
        auth_service = SimpleAuthService(db)
        login_result = auth_service.login(
            email=login_data.email,
            password=login_data.password,
            totp_token=login_data.totp_token,
            backup_code=login_data.backup_code,
        )

        # Handle 2FA required case
        if login_result.get("requires_2fa"):
            logger.info(f"2FA required for user {login_data.email}")
            return {
                "requires_2fa": True,
                "message": login_result.get("message", "2FA token required"),
            }

        logger.info(
            "User logged in successfully",
            extra={
                "user_id": str(login_result["user"].id),
                "email": login_result["user"].email,
                "organization_id": str(login_result["organization"].id),
                "two_factor_used": bool(login_data.totp_token or login_data.backup_code),
            },
        )

        # Set authentication cookies (missing from original implementation)
        logger.info("🔧 Creating Token object for cookies")
        token_obj = Token(
            access_token=login_result["access_token"],
            refresh_token=login_result["refresh_token"],
            token_type=login_result["token_type"],
        )
        logger.info("🔧 Calling _set_auth_cookies")
        _set_auth_cookies(response, token_obj)
        logger.info("🔧 Cookies should be set now")

        logger.info("🔧 Validating user response")
        try:
            user_response = UserResponse.model_validate(login_result["user"])
            logger.info("🔧 User response validated successfully")
        except Exception as e:
            logger.error(f"🚨 UserResponse validation failed: {e}")
            raise

        response_data = {
            "user": user_response,
            "organization": {
                "id": str(login_result["organization"].id),
                "name": login_result["organization"].name,
                "slug": login_result["organization"].slug,
                "description": login_result["organization"].description,
                "website": login_result["organization"].website,
                "is_active": login_result["organization"].is_active,
                "created_at": login_result["organization"].created_at.isoformat(),
                "updated_at": login_result["organization"].updated_at.isoformat()
                if login_result["organization"].updated_at
                else None,
            },
            "access_token": login_result["access_token"],
            "refresh_token": login_result["refresh_token"],
            "token_type": login_result["token_type"],
        }

        logger.info("🔧 Login response prepared successfully")
        return response_data

    except HTTPException as e:
        logger.error(f"🚨 HTTPException in login for {login_data.email}: {e.detail}")
        raise
    except AuthenticationError as e:
        logger.error(f"🚨 AuthenticationError in login for {login_data.email}: {e}")
        raise
    except Exception as e:
        logger.error(f"🚨 Unexpected exception in login for {login_data.email}: {e}")
        logger.error(f"🚨 Exception type: {type(e)}")
        import traceback

        logger.error(f"🚨 Full traceback: {traceback.format_exc()}")
        raise DatabaseError("user login") from e


@router.post("/refresh")
async def refresh(
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    refresh_data: Optional[RefreshTokenRequest] = None,
) -> dict:
    """Refresh access token using httpOnly cookie or JSON body."""
    try:
        # Try to get refresh token from JSON body first, then cookie
        if refresh_data and refresh_data.refresh_token:
            refresh_token_value = refresh_data.refresh_token
        else:
            refresh_token_value = _get_refresh_token_from_cookie(request)

        user = _validate_and_get_user_from_token(refresh_token_value, db)
        token_response = _create_new_tokens(user, db)

        # Set cookies using Token object for compatibility
        token_obj = Token(
            access_token=token_response["access_token"],
            refresh_token=token_response["refresh_token"],
            token_type=token_response["token_type"],
        )
        _set_auth_cookies(response, token_obj)

        return token_response

    except AuthenticationError as e:
        logger.info(f"Authentication failed during token refresh: {e}")
        raise
    except HTTPException as e:
        logger.info(f"HTTP error during token refresh: {e.detail}")
        raise
    except JWTError as e:
        logger.info(f"JWT error during token refresh: {e}")
        raise AuthenticationError("Invalid refresh token") from e
    except Exception as e:
        logger.error(f"Unexpected error during token refresh: {type(e).__name__}: {e}")
        raise AuthenticationError("Token refresh failed") from e


def _get_refresh_token_from_cookie(request: Request) -> str:
    """Extract refresh token from cookie."""
    refresh_token_value = request.cookies.get("refresh_token")
    if not refresh_token_value:
        raise AuthenticationError("No refresh token found")
    return refresh_token_value


def _validate_and_get_user_from_token(refresh_token_value: str, db: Session) -> User:
    """Validate refresh token and get user."""
    payload = verify_token(refresh_token_value, "refresh")
    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id or not email:
        raise AuthenticationError("Missing user information in token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise AuthenticationError("User not found")

    if not user.is_active:
        raise AuthenticationError("User account is inactive")

    return user


def _create_new_tokens(user: User, db: Session) -> dict:
    """Create new tokens for user with organization."""
    auth_service = SimpleAuthService(db)

    # Get user's organization
    org_member = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.user_id == user.id, OrganizationMember.is_active.is_(True))
        .first()
    )

    if not org_member:
        logger.error(f"User {user.email} has no organization membership during token refresh")
        raise HTTPException(status_code=500, detail="User has no organization membership")

    organization = (
        db.query(Organization).filter(Organization.id == org_member.organization_id).first()
    )

    tokens_dict = auth_service.create_tokens(user)

    return {
        "user": UserResponse.model_validate(user),
        "organization": {
            "id": str(organization.id),
            "name": organization.name,
            "slug": organization.slug,
            "description": organization.description,
            "website": organization.website,
            "is_active": organization.is_active,
            "created_at": organization.created_at.isoformat(),
            "updated_at": organization.updated_at.isoformat() if organization.updated_at else None,
        },
        "access_token": tokens_dict["access_token"],
        "refresh_token": tokens_dict["refresh_token"],
        "token_type": tokens_dict["token_type"],
    }


def _set_auth_cookies(response: Response, tokens: Token) -> None:
    """Set authentication cookies in the response."""
    # 🔒 SECURITY: Log without exposing token values
    logger.info("🔧 Setting auth cookies for user session")
    logger.info(
        f"🔧 Cookie config - secure: {not settings.is_development}, expire: {settings.access_token_cookie_expire_seconds}s"
    )

    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        secure=not settings.is_development,  # Use secure cookies in production
        samesite="lax",  # Lax is often better for OAuth redirects
        max_age=settings.access_token_cookie_expire_seconds,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=not settings.is_development,
        samesite="lax",
        max_age=settings.refresh_token_cookie_expire_seconds,
        path="/",
    )

    logger.info("✅ Auth cookies set successfully")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> UserResponse:
    """Get current user information."""
    return UserResponse.model_validate(current_user)


async def _process_token_for_logout(token: str, token_type: str) -> Dict[str, str]:
    """Process a token for logout - extract user info and blacklist."""
    try:
        payload = verify_token(token, token_type)
        user_info = {
            "user_id": str(payload.get("sub", "")),
            "email": str(payload.get("email", "")),
        }

        exp = payload.get("exp")
        if exp:
            expires_at = datetime.fromtimestamp(exp)
            await blacklist_token(token, expires_at, settings.REDIS_URL)

        return user_info
    except (JWTError, AuthenticationError):
        # Expected for expired/invalid tokens during logout
        logger.debug(
            f"Token validation failed during logout (expected for expired tokens): {token_type}"
        )
        return {}
    except Exception as e:
        # Unexpected errors should be logged
        logger.warning(
            "Unexpected error processing token during logout",
            extra={"token_type": token_type, "error": str(e), "error_type": type(e).__name__},
        )
        return {}


def _clear_auth_cookies(response: Response) -> None:
    """Clear authentication cookies."""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")


@router.post("/logout")
async def logout(
    request: Request, response: Response, db: Annotated[Session, Depends(get_db)]
) -> Dict[str, str]:
    """Logout user, blacklist tokens, and clear cookies."""
    user_id = None
    user_email = None

    try:
        # 1. Invalidate access token from header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header.split(" ")[1]
            token_info = await _process_token_for_logout(access_token, "access_token")
            user_id = token_info.get("user_id")
            user_email = token_info.get("email")

        # 2. Invalidate refresh token from cookie
        refresh_token = request.cookies.get("refresh_token")
        if refresh_token:
            # If user info not found from access token, try getting it from refresh token
            refresh_token_info = await _process_token_for_logout(refresh_token, "refresh_token")
            if not user_id:
                user_id = refresh_token_info.get("user_id")
            if not user_email:
                user_email = refresh_token_info.get("email")

        # Log successful logout if user was identified
        if user_id:
            pass

        logger.info("User logged out successfully and tokens blacklisted")

    except Exception as e:
        logger.error(f"Error during logout: {e}")
    finally:
        # Always clear cookies
        _clear_auth_cookies(response)

    return {"message": "Successfully logged out"}


@router.post("/forgot-password")
async def request_password_reset(
    reset_data: PasswordResetRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Request password reset."""
    # 🤖 reCAPTCHA v3 Validation
    client_ip = _get_client_ip(request)
    await recaptcha_service.validate_request_token(
        reset_data.recaptcha_token, RecaptchaAction.FORGOT_PASSWORD, client_ip
    )

    try:
        auth_service = SimpleAuthService(db)
        auth_service.send_password_reset_email(reset_data.email)

        # Log password reset attempt
        logger.info(f"Password reset requested for email: {reset_data.email}")

        return {"message": "If the email exists, a password reset link has been sent"}

    except Exception as e:
        # Log failed password reset attempt
        logger.error(f"Password reset request failed: {e}")
        raise


@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordResetConfirmRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Reset password with token."""
    # 🤖 reCAPTCHA v3 Validation
    client_ip = _get_client_ip(request)
    await recaptcha_service.validate_request_token(
        reset_data.recaptcha_token, RecaptchaAction.RESET_PASSWORD, client_ip
    )

    try:
        auth_service = SimpleAuthService(db)
        auth_service.reset_password_with_token(reset_data.token, reset_data.new_password)

        logger.info("Password reset completed successfully")
        return {"message": "Password has been reset successfully"}

    except HTTPException as e:
        logger.warning(f"Password reset failed: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during password reset: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Password reset failed"
        ) from e


@router.post("/verify-email")
async def verify_email(
    verification_data: EmailVerificationRequest, db: Annotated[Session, Depends(get_db)]
) -> Dict[str, str]:
    """Verify email with token."""
    try:
        auth_service = SimpleAuthService(db)
        auth_service.verify_email_with_token(verification_data.token)

        logger.info("Email verification completed successfully")
        return {"message": "Email has been verified successfully"}

    except HTTPException as e:
        logger.warning(f"Email verification failed: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during email verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Email verification failed"
        ) from e


@router.post("/resend-verification")
async def resend_verification(
    resend_data: ResendVerificationRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Resend email verification."""
    try:
        auth_service = SimpleAuthService(db)
        auth_service.send_email_verification(resend_data.email)

        # Log resend attempt
        logger.info(f"Email verification resend requested for: {resend_data.email}")

        return {
            "message": "If the email exists and is not verified, a verification link has been sent"
        }

    except Exception as e:
        # Log failed resend attempt
        logger.error(f"Email verification resend failed: {e}")
        raise


# OAuth endpoints
@router.get("/google/authorize")
async def google_authorize(state: Annotated[Optional[str], Query()] = None) -> Dict[str, str]:
    """Get Google OAuth authorization URL."""
    try:
        oauth_service = GoogleOAuthService()
        authorization_url = oauth_service.get_authorization_url(state)
        return {"authorization_url": authorization_url}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


@router.post("/google/callback", response_model=OAuthResponse)
async def google_callback(
    callback_data: OAuthCallbackRequest,
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
) -> OAuthResponse:
    """Handle Google OAuth callback."""
    user_email = None

    try:
        oauth_service = GoogleOAuthService()
        user_data = await oauth_service.authenticate_user(callback_data.code)
        user_email = user_data["email"]

        # Create or get user (simplified - no OAuth-specific logic)
        user = db.query(User).filter(User.email == user_data["email"]).first()
        auth_service = SimpleAuthService(db)

        if not user:
            # New OAuth user - register with auto-org creation
            # Generate secure random password for OAuth users (they won't use it)
            import secrets
            import string

            alphabet = string.ascii_letters + string.digits + "!@#$%&*"
            secure_password = "".join(secrets.choice(alphabet) for _ in range(16))

            user, organization = auth_service.register_user(
                email=user_data["email"],
                full_name=user_data["full_name"],
                password=secure_password,  # Secure random password
                terms_accepted=True,  # OAuth users implicitly accept terms
            )

            # Store Google ID for OAuth user
            if user_data.get("google_id"):
                user.google_id = user_data["google_id"]
                db.commit()
        else:
            # Existing user - get their organization
            org_member = (
                db.query(OrganizationMember)
                .filter(
                    OrganizationMember.user_id == user.id, OrganizationMember.is_active.is_(True)
                )
                .first()
            )

            if org_member:
                organization = (
                    db.query(Organization)
                    .filter(Organization.id == org_member.organization_id)
                    .first()
                )
            else:
                logger.error(f"OAuth user {user.email} has no organization")
                raise HTTPException(status_code=500, detail="User has no organization")

        # Update avatar if provided
        if user_data.get("avatar_url") and not user.avatar_url:
            user.avatar_url = user_data["avatar_url"]
            db.commit()

        # Create tokens
        tokens = auth_service.create_tokens(user)

        # Log successful OAuth login
        logger.info(
            "OAuth login successful",
            extra={
                "user_id": str(user.id),
                "email": user.email,
                "organization_id": str(organization.id),
                "provider": "google",
            },
        )

        # Create token response with cookies
        token_response = Token(**tokens)
        _set_auth_cookies(response, token_response)

        # Return complete OAuth response with user and organization data
        return OAuthResponse(
            user=UserResponse.model_validate(user),
            organization=OrganizationSummary(
                id=str(organization.id),
                name=str(organization.name),
                slug=str(organization.slug),
            ),
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
        )

    except Exception as e:
        # Log failed OAuth login
        if user_email:
            pass

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth authentication failed: {str(e)}",
        ) from e


@router.post("/force-change-password")
async def force_change_password(
    request: Dict[str, str],  # {"email": "...", "temp_password": "...", "new_password": "..."}
    db: Annotated[Session, Depends(get_db)],
) -> Dict[str, str]:
    """Force password change for users with temporary passwords (from invites)."""
    try:
        email = request.get("email")
        temp_password = request.get("temp_password")
        new_password = request.get("new_password")

        if not all([email, temp_password, new_password]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields: email, temp_password, new_password",
            )

        # Use auth service to change password
        from ..services.auth_simple import get_simple_auth_service

        auth_service = get_simple_auth_service(db)

        success = auth_service.force_change_password(email, temp_password, new_password)

        if success:
            logger.info(f"✅ Password successfully changed for user {email}")
            return {
                "message": "Password changed successfully. Please login with your new password."
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to change password",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Force password change failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to change password"
        ) from e
