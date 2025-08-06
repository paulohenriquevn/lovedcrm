"""Unit tests for core.config module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper configuration
"""

import pytest
import os
from unittest.mock import patch, Mock
from pydantic import ValidationError

from api.core.config import Settings, get_settings, get_environment_info


class TestSettingsValidation:
    """Test Settings validation and initialization - FUNCTIONALITY FIRST."""

    def test_settings_creation_with_valid_secret_key(self):
        """Test Settings creation with valid SECRET_KEY."""
        # ✅ SUCCESS SCENARIO: Valid settings creation
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'DATABASE_URL': 'postgresql://user:pass@localhost/db'
        }, clear=True):
            settings = Settings()
            
            assert settings.SECRET_KEY == 'secure_random_string_32_characters!'
            assert settings.DATABASE_URL == 'postgresql://user:pass@localhost/db'
            assert settings.APP_NAME == "SaaS Starter"
            assert settings.ENVIRONMENT == "development"

    def test_settings_default_values(self):
        """Test Settings uses correct default values."""
        # ✅ SUCCESS SCENARIO: Default values are set correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!'
        }, clear=True):
            settings = Settings()
            
            assert settings.APP_NAME == "SaaS Starter"  
            assert settings.APP_VERSION == "1.0.0"
            assert settings.ENVIRONMENT == "development"
            assert settings.DEBUG is True
            assert settings.JWT_ALGORITHM == "HS256"
            assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 15
            assert settings.REFRESH_TOKEN_EXPIRE_DAYS == 7

    def test_settings_derived_properties(self):
        """Test Settings derived properties work correctly."""
        # ✅ SUCCESS SCENARIO: Derived properties computed correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'ACCESS_TOKEN_EXPIRE_MINUTES': '30',
            'REFRESH_TOKEN_EXPIRE_DAYS': '14'
        }):
            settings = Settings()
            
            # Test cookie expiration properties
            assert settings.access_token_cookie_expire_seconds == 30 * 60  # 30 minutes in seconds
            assert settings.refresh_token_cookie_expire_seconds == 14 * 24 * 60 * 60  # 14 days in seconds

    def test_settings_cors_origins_parsing(self):
        """Test CORS origins parsing works correctly."""
        # ✅ SUCCESS SCENARIO: CORS origins parsed correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'ALLOWED_ORIGINS': 'http://localhost:3000,https://myapp.com,https://staging.myapp.com'
        }):
            settings = Settings()
            
            expected_origins = [
                'http://localhost:3000',
                'https://myapp.com', 
                'https://staging.myapp.com'
            ]
            assert settings.cors_origins == expected_origins

    def test_settings_cors_origins_single_origin(self):
        """Test CORS origins with single origin."""
        # ✅ SUCCESS SCENARIO: Single CORS origin handled correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'ALLOWED_ORIGINS': 'https://myapp.com'
        }):
            settings = Settings()
            
            assert settings.cors_origins == ['https://myapp.com']

    def test_secret_key_validation_too_short(self):
        """Test SECRET_KEY validation fails for short keys."""
        # ❌ ERROR SCENARIO: Short SECRET_KEY should fail validation
        with patch.dict(os.environ, {'SECRET_KEY': 'short'}):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            
            errors = exc_info.value.errors()
            assert any("at least 32 characters" in str(error) for error in errors)

    def test_secret_key_validation_weak_patterns(self):
        """Test SECRET_KEY validation rejects weak patterns."""
        # ❌ ERROR SCENARIO: Weak SECRET_KEY patterns should fail
        weak_keys = [
            'secret_key_32_characters_long_but_weak!',
            'password_32_characters_long_but_weak!',
            'changeme_32_characters_long_but_weak!',
            'test_key_32_characters_long_but_weak!',
            'development_key_32_characters_long!'
        ]
        
        for weak_key in weak_keys:
            with patch.dict(os.environ, {'SECRET_KEY': weak_key}):
                with pytest.raises(ValidationError) as exc_info:
                    Settings()
                
                errors = exc_info.value.errors()
                assert any("padrão inseguro" in str(error) for error in errors)

    def test_secret_key_validation_production_environment(self):
        """Test SECRET_KEY validation in production environment."""
        # ❌ ERROR SCENARIO: Production without explicit SECRET_KEY should fail
        with patch.dict(os.environ, {
            'ENVIRONMENT': 'production'
        }, clear=True):  # Clear SECRET_KEY
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            
            errors = exc_info.value.errors()
            assert any("PRODUÇÃO" in str(error) for error in errors)


class TestEnvironmentDetection:
    """Test environment detection properties - FUNCTIONALITY FIRST."""

    def test_is_development_detection(self):
        """Test development environment detection."""
        # ✅ SUCCESS SCENARIO: Development environment detected correctly
        test_cases = [
            ('development', True),
            ('dev', True),
            ('local', True),
            ('production', False),
            ('test', False),
        ]
        
        for env, expected in test_cases:
            with patch.dict(os.environ, {
                'SECRET_KEY': 'secure_random_string_32_characters!',
                'ENVIRONMENT': env
            }):
                settings = Settings()
                assert settings.is_development == expected

    def test_is_production_detection(self):
        """Test production environment detection."""
        # ✅ SUCCESS SCENARIO: Production environment detected correctly
        test_cases = [
            ('production', True),
            ('prod', True),
            ('development', False),
            ('test', False),
        ]
        
        for env, expected in test_cases:
            with patch.dict(os.environ, {
                'SECRET_KEY': 'secure_random_string_32_characters!',
                'ENVIRONMENT': env
            }):
                settings = Settings()
                assert settings.is_production == expected

    def test_is_testing_detection(self):
        """Test testing environment detection."""
        # ✅ SUCCESS SCENARIO: Testing environment detected correctly
        test_cases = [
            ('test', True),
            ('testing', True),
            ('development', False),
            ('production', False),
        ]
        
        for env, expected in test_cases:
            with patch.dict(os.environ, {
                'SECRET_KEY': 'secure_random_string_32_characters!',
                'ENVIRONMENT': env
            }):
                settings = Settings()
                assert settings.is_testing == expected


class TestRateLimits:
    """Test rate limiting configuration - FUNCTIONALITY FIRST."""

    def test_rate_limits_development(self):
        """Test rate limits for development environment."""
        # ✅ SUCCESS SCENARIO: Development rate limits are generous
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'ENVIRONMENT': 'development'
        }):
            settings = Settings()
            limits = settings.rate_limits
            
            assert limits['auth_attempts'] == 1000
            assert limits['api_requests'] == 10000
            assert limits['password_reset'] == 100

    def test_rate_limits_testing(self):
        """Test rate limits for testing environment."""
        # ✅ SUCCESS SCENARIO: Testing rate limits are very generous
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'ENVIRONMENT': 'testing'
        }):
            settings = Settings()
            limits = settings.rate_limits
            
            assert limits['auth_attempts'] == 10000
            assert limits['api_requests'] == 100000
            assert limits['password_reset'] == 1000

    def test_rate_limits_production(self):
        """Test rate limits for production environment."""
        # ✅ SUCCESS SCENARIO: Production rate limits are strict
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'ENVIRONMENT': 'production'
        }):
            settings = Settings()
            limits = settings.rate_limits
            
            assert limits['auth_attempts'] == 5
            assert limits['api_requests'] == 1000
            assert limits['password_reset'] == 3


class TestRecaptchaConfiguration:
    """Test reCAPTCHA configuration - FUNCTIONALITY FIRST."""

    def test_recaptcha_enabled_default(self):
        """Test reCAPTCHA default configuration with explicit test override."""
        # ✅ SUCCESS SCENARIO: When TEST_RECAPTCHA_ENABLED is explicitly set to true
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'RECAPTCHA_ENABLED': 'true',
            'TEST_RECAPTCHA_ENABLED': 'true'  # Explicitly enable for this test
        }, clear=True):
            settings = Settings()
            
            assert settings.RECAPTCHA_ENABLED is True
            assert settings.is_recaptcha_enabled is True

    def test_recaptcha_test_override(self):
        """Test reCAPTCHA test environment override."""
        # ✅ SUCCESS SCENARIO: Test override works correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'RECAPTCHA_ENABLED': 'true',
            'TEST_RECAPTCHA_ENABLED': 'false'
        }):
            settings = Settings()
            
            # Test override should take precedence
            assert settings.RECAPTCHA_ENABLED is True
            assert settings.is_recaptcha_enabled is False

    def test_recaptcha_threshold_default(self):
        """Test reCAPTCHA threshold default value."""
        # ✅ SUCCESS SCENARIO: Default threshold is correct
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!'
        }):
            settings = Settings()
            
            assert settings.RECAPTCHA_THRESHOLD == 0.5


class TestBillingConfiguration:
    """Test billing system configuration - FUNCTIONALITY FIRST."""

    def test_billing_plans_default(self):
        """Test billing plans default configuration."""
        # ✅ SUCCESS SCENARIO: Default billing plans configured correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!'
        }):
            settings = Settings()
            plans = settings.available_plans
            
            # Should have basic and pro plans by default
            assert 'basic' in plans
            assert 'pro' in plans
            
            # Check basic plan
            basic = plans['basic']
            assert basic['name'] == 'Básico'
            assert basic['price'] == 0
            assert 'user_management' in basic['features']
            
            # Check pro plan
            pro = plans['pro']
            assert pro['name'] == 'Profissional'
            assert pro['price'] == 2900
            assert 'user_management' in pro['features']
            assert 'advanced_reports' in pro['features']

    def test_billing_plans_custom_configuration(self):
        """Test billing plans with custom configuration."""
        # ✅ SUCCESS SCENARIO: Custom billing plans configured correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'BILLING_PLANS': 'BASIC,EXPERT',
            'PLAN_EXPERT_NAME': 'Expert Plan',
            'PLAN_EXPERT_PRICE': '4900',
            'PLAN_EXPERT_FEATURES': 'user_management,analytics,priority_support'
        }):
            settings = Settings()
            plans = settings.available_plans
            
            assert 'basic' in plans
            assert 'expert' in plans
            assert 'pro' not in plans  # Pro not in BILLING_PLANS
            
            expert = plans['expert']
            assert expert['name'] == 'Expert Plan'
            assert expert['price'] == 4900
            assert 'analytics' in expert['features']
            assert 'priority_support' in expert['features']

    def test_billing_plans_empty_fallback(self):
        """Test billing plans fallback when configuration is empty."""
        # ✅ SUCCESS SCENARIO: Fallback to basic plan when config is empty
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'BILLING_PLANS': ''
        }):
            settings = Settings()
            plans = settings.available_plans
            
            # Should fallback to basic plan
            assert len(plans) == 1
            assert 'basic' in plans
            assert plans['basic']['name'] == 'Básico'
            assert plans['basic']['price'] == 0


class TestUtilityFunctions:
    """Test utility functions - FUNCTIONALITY FIRST."""

    def test_get_settings_function(self):
        """Test get_settings dependency injection function."""
        # ✅ SUCCESS SCENARIO: get_settings returns Settings instance
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!'
        }):
            settings = get_settings()
            
            assert isinstance(settings, Settings)
            assert settings.APP_NAME == "SaaS Starter"

    def test_get_environment_info_function(self):
        """Test get_environment_info utility function."""
        # ✅ SUCCESS SCENARIO: Environment info returned correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'ENVIRONMENT': 'development'
        }):
            env_info = get_environment_info()
            
            required_keys = [
                'environment', 'is_development', 'is_production', 'is_testing',
                'debug', 'app_name', 'version', 'cors_origins', 'rate_limits'
            ]
            
            for key in required_keys:
                assert key in env_info
            
            assert env_info['environment'] == 'development'
            assert env_info['is_development'] is True
            assert env_info['is_production'] is False
            assert env_info['app_name'] == "SaaS Starter"


class TestSaasModeConfiguration:
    """Test SAAS_MODE configuration - FUNCTIONALITY FIRST."""

    def test_saas_mode_default_b2c(self):
        """Test SAAS_MODE defaults to B2C."""
        # ✅ SUCCESS SCENARIO: Default SAAS_MODE is B2C
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!'
        }, clear=True):
            settings = Settings()
            
            assert settings.SAAS_MODE == "B2C"
            assert settings.is_b2c_mode is True
            assert settings.is_b2b_mode is False

    def test_saas_mode_b2c_explicit(self):
        """Test SAAS_MODE set to B2C explicitly."""
        # ✅ SUCCESS SCENARIO: B2C mode works correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'SAAS_MODE': 'B2C'
        }):
            settings = Settings()
            
            assert settings.SAAS_MODE == "B2C"
            assert settings.is_b2c_mode is True
            assert settings.is_b2b_mode is False

    def test_saas_mode_b2b_explicit(self):
        """Test SAAS_MODE set to B2B explicitly."""
        # ✅ SUCCESS SCENARIO: B2B mode works correctly
        with patch.dict(os.environ, {
            'SECRET_KEY': 'secure_random_string_32_characters!',
            'SAAS_MODE': 'B2B'
        }):
            settings = Settings()
            
            assert settings.SAAS_MODE == "B2B"
            assert settings.is_b2c_mode is False
            assert settings.is_b2b_mode is True

    def test_saas_mode_case_insensitive(self):
        """Test SAAS_MODE is case insensitive."""
        # ✅ SUCCESS SCENARIO: Case insensitive validation works
        test_cases = [
            ('b2c', 'B2C'),
            ('b2b', 'B2B'),
            ('B2c', 'B2C'),
            ('b2B', 'B2B'),
        ]
        
        for input_mode, expected_mode in test_cases:
            with patch.dict(os.environ, {
                'SECRET_KEY': 'secure_random_string_32_characters!',
                'SAAS_MODE': input_mode
            }):
                settings = Settings()
                assert settings.SAAS_MODE == expected_mode

    def test_saas_mode_invalid_value_error(self):
        """Test SAAS_MODE validation rejects invalid values."""
        # ❌ ERROR SCENARIO: Invalid SAAS_MODE should fail validation
        invalid_modes = ['B2G', 'C2B', 'HYBRID', 'AUTO', 'MIXED', '']
        
        for invalid_mode in invalid_modes:
            with patch.dict(os.environ, {
                'SECRET_KEY': 'secure_random_string_32_characters!',
                'SAAS_MODE': invalid_mode
            }):
                with pytest.raises(ValidationError) as exc_info:
                    Settings()
                
                errors = exc_info.value.errors()
                assert any("must be 'B2B' or 'B2C'" in str(error) for error in errors)