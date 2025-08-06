"""🔧 OPTIMIZED CONFIGURATION - MELHORES PRÁTICAS.

Sistema de configuração simplificado e seguro baseado no CLAUDE.md
- Single source of truth para configurações
- Validação rigorosa de segurança
- Separação clara dev/test/prod
- Zero duplicação de campos
"""
import logging
import os
from typing import Optional

from pydantic import Field, validator
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Configurações consolidadas do sistema.

    Segue princípios KISS, YAGNI e DRY do CLAUDE.md
    """

    # =====================================================
    # 🏷️ CORE APPLICATION SETTINGS
    # =====================================================
    APP_NAME: str = "SaaS Starter"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # =====================================================
    # 🎯 SAAS MODE CONFIGURATION (B2B/B2C)
    # =====================================================
    SAAS_MODE: str = Field(default="B2C", description="SaaS mode: B2B or B2C")

    @validator("SAAS_MODE")
    @classmethod
    def validate_saas_mode(cls, v: str) -> str:
        """Validate SAAS_MODE is either B2B or B2C."""
        if v.upper() not in ["B2B", "B2C"]:
            raise ValueError("SAAS_MODE must be 'B2B' or 'B2C'")
        return v.upper()

    @property
    def is_b2c_mode(self) -> bool:
        """Check if running in B2C mode."""
        return self.SAAS_MODE == "B2C"

    @property
    def is_b2b_mode(self) -> bool:
        """Check if running in B2B mode."""
        return self.SAAS_MODE == "B2B"

    # =====================================================
    # 🔐 SECURITY (SINGLE SOURCE OF TRUTH)
    # =====================================================
    SECRET_KEY: str = Field(
        default="development-secret-key-32-chars-long-for-dev-only", min_length=32
    )
    JWT_ALGORITHM: str = "HS256"
    ALGORITHM: str = "HS256"  # Alias for compatibility
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cookie expiration (derived from token expiration)
    @property
    def access_token_cookie_expire_seconds(self) -> int:
        """Get access token cookie expiration time in seconds."""
        return self.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    @property
    def refresh_token_cookie_expire_seconds(self) -> int:
        """Get refresh token cookie expiration time in seconds."""
        return self.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    @validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Validação rigorosa de segurança conforme CLAUDE.md."""
        environment = os.getenv("ENVIRONMENT", "development")

        # FAIL-FAST em produção se SECRET_KEY não for definida
        if environment.lower() in ["production", "prod"] and not os.getenv("SECRET_KEY"):
            raise ValueError(
                "🚨 PRODUÇÃO: SECRET_KEY deve ser definida explicitamente! "
                "Chaves auto-geradas invalidam tokens no restart."
            )

        # Detectar chaves fracas
        weak_patterns = [
            "secret",
            "password",
            "changeme",
            "default",
            "test",
            "development",
            "your-",
            "example",
            "demo",
            "abc123",
        ]

        if any(pattern in v.lower() for pattern in weak_patterns):
            raise ValueError(
                "🚨 CHAVE FRACA: SECRET_KEY contém padrão inseguro. Use: openssl rand -hex 32"
            )

        return v

    # =====================================================
    # 🗄️ DATABASE (SIMPLIFIED)
    # =====================================================
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5433/saas_starter"
    REDIS_URL: str = "redis://localhost:6379"

    # =====================================================
    # 🌐 WEB & CORS
    # =====================================================
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins securely."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    # =====================================================
    # 🎯 EXTERNAL SERVICES (OPTIONAL)
    # =====================================================
    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # 🤖 reCAPTCHA v3 Protection
    RECAPTCHA_ENABLED: bool = True
    TEST_RECAPTCHA_ENABLED: Optional[str] = None  # Test override for E2E tests
    RECAPTCHA_SITE_KEY: Optional[str] = None
    RECAPTCHA_SECRET_KEY: Optional[str] = None
    RECAPTCHA_THRESHOLD: float = 0.5  # Score threshold (0.0-1.0)
    RECAPTCHA_VERIFY_URL: str = "https://www.google.com/recaptcha/api/siteverify"

    @property
    def is_recaptcha_enabled(self) -> bool:
        """Check if reCAPTCHA is enabled, respecting test environment override."""
        # In test environment, TEST_RECAPTCHA_ENABLED takes precedence
        if self.TEST_RECAPTCHA_ENABLED is not None:
            return self.TEST_RECAPTCHA_ENABLED.lower() == "true"
        # Otherwise use regular RECAPTCHA_ENABLED setting
        return self.RECAPTCHA_ENABLED

    # Payments
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Email
    EMAIL_ENABLED: bool = False
    EMAIL_VERIFICATION_REQUIRED: bool = False  # FLAG: Require email verification for new users
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = None

    # Cloud Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    AWS_REGION: str = "us-east-1"

    # Monitoring & Error Tracking
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: str = "development"
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1  # 10% sampling for performance
    SENTRY_PROFILES_SAMPLE_RATE: float = 0.1  # 10% sampling for profiling

    # =====================================================
    # 💳 BILLING SYSTEM CONFIGURATION (SIMPLIFIED)
    # =====================================================
    # Which plans are active (comma-separated)
    BILLING_PLANS: str = "BASIC,PRO"

    # BASIC Plan Configuration
    PLAN_BASIC_NAME: str = "Básico"
    PLAN_BASIC_PRICE: int = 0  # Price in cents (0 = free)
    PLAN_BASIC_FEATURES: str = "user_management,basic_dashboard"

    # PRO Plan Configuration
    PLAN_PRO_NAME: str = "Profissional"
    PLAN_PRO_PRICE: int = 2900  # Price in cents (2900 = R$ 29.00)
    PLAN_PRO_FEATURES: str = "user_management,basic_dashboard,advanced_reports"

    # EXPERT Plan Configuration (optional - only used if EXPERT is in BILLING_PLANS)
    PLAN_EXPERT_NAME: str = "Expert"
    PLAN_EXPERT_PRICE: int = 4900  # Price in cents (4900 = R$ 49.00)
    PLAN_EXPERT_FEATURES: str = (
        "user_management,basic_dashboard,advanced_reports,analytics,priority_support"
    )

    # =====================================================
    # 🛡️ SECURITY PROPERTIES (COMPUTED)
    # =====================================================
    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.ENVIRONMENT.lower() in ["production", "prod"]

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.ENVIRONMENT.lower() in ["development", "dev", "local"]

    @property
    def is_testing(self) -> bool:
        """Check if running in test mode."""
        return self.ENVIRONMENT.lower() in ["test", "testing"]

    # =====================================================
    # 📊 RATE LIMITING (ENVIRONMENT-AWARE)
    # =====================================================
    @property
    def rate_limits(self) -> dict[str, int]:
        """Get appropriate rate limits based on environment."""
        if self.is_development:
            return {
                "auth_attempts": 1000,  # Generous for development
                "api_requests": 10000,
                "password_reset": 100,
            }
        elif self.is_testing:
            return {
                "auth_attempts": 10000,  # No limits for tests
                "api_requests": 100000,
                "password_reset": 1000,
            }
        else:  # Production
            return {
                "auth_attempts": 5,  # Strict for production
                "api_requests": 1000,
                "password_reset": 3,
            }

    # =====================================================
    # 💳 BILLING HELPER METHODS (DYNAMIC)
    # =====================================================
    @property
    def available_plans(self) -> dict:
        """Get available plans from individual plan configurations.

        Much simpler configuration system - each plan has its own variables.
        """
        plans = {}

        try:
            if not self.BILLING_PLANS:
                # Fallback to basic plan if nothing configured
                return {"basic": {"name": "Básico", "price": 0, "features": ["user_management"]}}

            # Get active plans from BILLING_PLANS (comma-separated)
            active_plans = [
                plan.strip().upper() for plan in self.BILLING_PLANS.split(",") if plan.strip()
            ]

            for plan_slug in active_plans:
                slug_lower = plan_slug.lower()

                # Get plan configuration from individual environment variables
                name_attr = f"PLAN_{plan_slug}_NAME"
                price_attr = f"PLAN_{plan_slug}_PRICE"
                features_attr = f"PLAN_{plan_slug}_FEATURES"

                # Check if all required attributes exist
                if (
                    hasattr(self, name_attr)
                    and hasattr(self, price_attr)
                    and hasattr(self, features_attr)
                ):
                    name = getattr(self, name_attr)
                    price = getattr(self, price_attr)
                    features_str = getattr(self, features_attr)

                    # Parse features
                    features = [f.strip() for f in features_str.split(",") if f.strip()]

                    plans[slug_lower] = {"name": name, "price": price, "features": features}
                else:
                    logger.warning(f"Missing configuration for plan {plan_slug}")

            # Always ensure at least basic plan exists
            if not plans:
                plans["basic"] = {"name": "Básico", "price": 0, "features": ["user_management"]}

            return plans

        except Exception as e:
            logger.error(f"Error loading plans configuration: {e}")
            # Return basic fallback
            return {"basic": {"name": "Básico", "price": 0, "features": ["user_management"]}}

    # =====================================================
    # ⚙️ CONFIGURATION
    # =====================================================
    class Config:
        """Pydantic configuration for settings validation."""

        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignora campos extras (segurança)


# =====================================================
# 🌍 GLOBAL INSTANCE
# =====================================================
settings = Settings()


def get_settings() -> Settings:
    """Dependency injection para FastAPI."""
    return settings


# =====================================================
# 🔍 ENVIRONMENT DETECTION
# =====================================================
def get_environment_info() -> dict:
    """Get current environment information for debugging."""
    return {
        "environment": settings.ENVIRONMENT,
        "is_development": settings.is_development,
        "is_production": settings.is_production,
        "is_testing": settings.is_testing,
        "debug": settings.DEBUG,
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "cors_origins": settings.cors_origins,
        "rate_limits": settings.rate_limits,
    }
