"""Google OAuth service for authentication integration."""
from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, status

from ..core.config import settings


class GoogleOAuthService:
    """Service for handling Google OAuth authentication flow."""

    def __init__(self) -> None:
        """Initialize Google OAuth service with configuration."""
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = "http://localhost:3000/auth/callback/google"

        if not self.client_id or not self.client_secret:
            raise ValueError("Google OAuth credentials not configured")

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """Get Google OAuth authorization URL."""
        import secrets
        from urllib.parse import urlencode

        # Gerar state se não fornecido
        if not state:
            state = secrets.token_urlsafe(32)

        # Parâmetros para a URL de autorização
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",  # Para obter refresh token se necessário
        }

        # Construir URL de autorização
        authorization_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"

        return authorization_url

    async def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens."""
        async with httpx.AsyncClient() as http_client:
            try:
                # Preparar dados para troca de token
                token_data = {
                    "grant_type": "authorization_code",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                    "code": code,
                }

                # Fazer requisição direta para Google
                response = await http_client.post(
                    "https://oauth2.googleapis.com/token",
                    data=token_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )

                response.raise_for_status()
                token_response = response.json()

                return token_response

            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to exchange invalid code for token: {str(e)}",
                ) from e
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to exchange invalid code for token: {str(e)}",
                ) from e

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from Google."""
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {access_token}"}

            try:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo", headers=headers
                )
                response.raise_for_status()
                return dict(response.json())
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to get user info: {str(e)}",
                ) from e

    async def authenticate_user(self, code: str) -> Dict[str, Any]:
        """Complete OAuth flow and return user information."""
        # Exchange code for tokens
        tokens = await self.exchange_code_for_tokens(code)

        # Get user information
        user_info = await self.get_user_info(tokens["access_token"])

        return {
            "email": user_info["email"],
            "full_name": user_info.get("name"),
            "avatar_url": user_info.get("picture"),
            "google_id": user_info["id"],
            "verified_email": user_info.get("verified_email", False),
        }
