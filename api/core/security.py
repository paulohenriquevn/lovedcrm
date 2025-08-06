"""Security utilities for JWT tokens, password hashing, and authentication."""
import secrets
import string
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings


class TokenType(str, Enum):
    """Enum for token types."""

    ACCESS = "access"
    REFRESH = "refresh"


# Password hashing context - consistent across all environments
# Always use bcrypt for security and consistency
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)

    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update(
        {
            "exp": expire,
            "iat": now,
            "type": TokenType.ACCESS.value,
            "iss": settings.APP_NAME,
        }
    )
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update(
        {
            "exp": expire,
            "iat": now,
            "type": TokenType.REFRESH.value,
            "iss": settings.APP_NAME,
        }
    )
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: Optional[str] = None) -> Dict[str, Any]:
    """Verify and decode JWT token."""
    # Default to access token if not specified
    if token_type is None:
        token_type = TokenType.ACCESS.value
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])

        # Check token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check expiration
        exp = payload.get("exp")
        if exp is None or datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized - token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized - invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def generate_reset_token() -> str:
    """Generate secure random token for password reset."""
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(32))


def generate_verification_token() -> str:
    """Generate secure random token for email verification."""
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(32))


class TokenData:
    """Token data class for type hints."""

    def __init__(self, user_id: Optional[str] = None, email: Optional[str] = None):
        """Initialize token data with user information."""
        self.user_id = user_id
        self.email = email


# Security scheme
security = HTTPBearer()


# get_current_user moved to deps.py to avoid circular imports


# get_current_user_id moved to deps.py for consistency
