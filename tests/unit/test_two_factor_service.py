"""
🔐 Two-Factor Authentication Service Unit Tests

Unit tests for the UserTwoFactorService class.
Tests core business logic without API layer dependencies.

Focus Areas:
- TOTP secret generation and validation
- QR code generation
- Backup code generation and validation
- Business logic methods
"""

import hashlib
import pytest
import pyotp
from unittest.mock import Mock, patch

from api.services.user_two_factor_service import UserTwoFactorService
from api.models.user import User
from api.models.organization import Organization
from api.models.user_two_factor import UserTwoFactor


class TestTwoFactorServiceCore:
    """Test core 2FA service functionality."""

    def test_generate_secret_key_format(self):
        """✅ Test secret key generation produces valid Base32."""
        service = UserTwoFactorService(Mock())
        
        secret = service.generate_secret_key()
        
        # Should be valid Base32 format
        assert len(secret) >= 16
        assert all(c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567' for c in secret)
        
        # Should be usable with pyotp
        totp = pyotp.TOTP(secret)
        assert totp.now() is not None

    def test_generate_backup_codes_format(self):
        """✅ Test backup code generation produces correct format."""
        service = UserTwoFactorService(Mock())
        
        backup_codes, backup_code_hashes = service.generate_backup_codes(count=5)
        
        # Check code format
        assert len(backup_codes) == 5
        assert len(backup_code_hashes) == 5
        
        for code in backup_codes:
            assert len(code) == 8
            assert code.isdigit()
        
        # Check hashes
        for i, code in enumerate(backup_codes):
            expected_hash = hashlib.sha256(code.encode()).hexdigest()
            assert backup_code_hashes[i] == expected_hash

    def test_generate_qr_code_data_uri(self):
        """✅ Test QR code generation produces valid data URI."""
        service = UserTwoFactorService(Mock())
        
        secret_key = "JBSWY3DPEHPK3PXP"
        user_email = "test@example.com"
        org_name = "Test Org"
        
        qr_code_uri = service.generate_qr_code(secret_key, user_email, org_name)
        
        # Should be data URI for PNG image
        assert qr_code_uri.startswith("data:image/png;base64,")
        
        # Should contain base64 encoded data
        base64_data = qr_code_uri.split(",")[1]
        assert len(base64_data) > 100  # Should have substantial content

    def test_verify_totp_token_valid(self):
        """✅ Test TOTP token verification with valid token."""
        service = UserTwoFactorService(Mock())
        
        secret_key = "JBSWY3DPEHPK3PXP"
        totp = pyotp.TOTP(secret_key)
        current_token = totp.now()
        
        is_valid = service.verify_totp_token(secret_key, current_token)
        
        assert is_valid is True

    def test_verify_totp_token_invalid(self):
        """❌ Test TOTP token verification with invalid token."""
        service = UserTwoFactorService(Mock())
        
        secret_key = "JBSWY3DPEHPK3PXP"
        invalid_token = "000000"
        
        is_valid = service.verify_totp_token(secret_key, invalid_token)
        
        assert is_valid is False

    def test_verify_totp_token_with_window(self):
        """✅ Test TOTP token verification with time window tolerance."""
        service = UserTwoFactorService(Mock())
        
        secret_key = "JBSWY3DPEHPK3PXP"
        totp = pyotp.TOTP(secret_key)
        
        # Get token from previous time window
        import time
        previous_time = int(time.time()) - 30  # 30 seconds ago
        previous_token = totp.at(previous_time)
        
        # Should be valid with default window (1)
        is_valid = service.verify_totp_token(secret_key, previous_token, window=1)
        
        assert is_valid is True


class TestTwoFactorServiceMocked:
    """Test 2FA service with mocked dependencies."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock()

    @pytest.fixture
    def mock_repository(self):
        """Mock 2FA repository."""
        return Mock()

    @pytest.fixture
    def service_with_mocks(self, mock_db, mock_repository):
        """2FA service with mocked dependencies."""
        service = UserTwoFactorService(mock_db)
        service.repository = mock_repository
        return service

    @pytest.fixture
    def mock_user(self):
        """Mock user object."""
        user = Mock(spec=User)
        user.id = "user-123"
        user.email = "test@example.com"
        return user

    @pytest.fixture
    def mock_organization(self):
        """Mock organization object."""
        org = Mock(spec=Organization)
        org.id = "org-123"
        org.name = "Test Organization"
        return org

    def test_setup_2fa_creates_setup(self, service_with_mocks, mock_user, mock_organization):
        """✅ Test 2FA setup creates repository entry."""
        # Mock repository response
        service_with_mocks.repository.create_2fa_setup.return_value = Mock()
        
        result = service_with_mocks.setup_2fa(mock_user, mock_organization)
        
        # Should call repository to create setup
        service_with_mocks.repository.create_2fa_setup.assert_called_once()
        call_args = service_with_mocks.repository.create_2fa_setup.call_args
        
        assert call_args[1]['user_id'] == mock_user.id
        assert call_args[1]['organization_id'] == mock_organization.id
        assert 'secret_key' in call_args[1]
        assert 'backup_codes' in call_args[1]
        
        # Should return setup response
        assert result.secret_key is not None
        assert result.qr_code_data_uri.startswith("data:image/png;base64,")
        assert len(result.backup_codes) == 8

    def test_confirm_2fa_setup_success(self, service_with_mocks, mock_user, mock_organization):
        """✅ Test 2FA confirmation with valid token."""
        # Mock existing 2FA setup
        mock_2fa = Mock()
        mock_2fa.secret_key = "JBSWY3DPEHPK3PXP"
        service_with_mocks.repository.get_by_user_and_organization.return_value = mock_2fa
        
        # Generate valid token
        totp = pyotp.TOTP(mock_2fa.secret_key)
        valid_token = totp.now()
        
        result = service_with_mocks.confirm_2fa_setup(mock_user, mock_organization, valid_token)
        
        assert result is True
        service_with_mocks.repository.enable_2fa.assert_called_once_with(
            user_id=mock_user.id,
            organization_id=mock_organization.id
        )

    def test_confirm_2fa_setup_invalid_token(self, service_with_mocks, mock_user, mock_organization):
        """❌ Test 2FA confirmation with invalid token."""
        # Mock existing 2FA setup  
        mock_2fa = Mock()
        mock_2fa.secret_key = "JBSWY3DPEHPK3PXP"
        service_with_mocks.repository.get_by_user_and_organization.return_value = mock_2fa
        
        invalid_token = "000000"
        
        result = service_with_mocks.confirm_2fa_setup(mock_user, mock_organization, invalid_token)
        
        assert result is False
        service_with_mocks.repository.enable_2fa.assert_not_called()

    def test_is_2fa_required_true(self, service_with_mocks, mock_user, mock_organization):
        """✅ Test 2FA requirement check when enabled."""
        # Mock enabled 2FA
        mock_2fa = Mock()
        mock_2fa.is_enabled = True
        service_with_mocks.repository.get_by_user_and_organization.return_value = mock_2fa
        
        result = service_with_mocks.is_2fa_required(mock_user, mock_organization)
        
        assert result is True

    def test_is_2fa_required_false(self, service_with_mocks, mock_user, mock_organization):
        """✅ Test 2FA requirement check when disabled."""
        # Mock disabled 2FA
        mock_2fa = Mock()
        mock_2fa.is_enabled = False
        service_with_mocks.repository.get_by_user_and_organization.return_value = mock_2fa
        
        result = service_with_mocks.is_2fa_required(mock_user, mock_organization)
        
        assert result is False

    def test_is_2fa_required_no_setup(self, service_with_mocks, mock_user, mock_organization):
        """✅ Test 2FA requirement check when no setup exists."""
        # Mock no 2FA setup
        service_with_mocks.repository.get_by_user_and_organization.return_value = None
        
        result = service_with_mocks.is_2fa_required(mock_user, mock_organization)
        
        assert result is False

    def test_verify_2fa_for_login_not_required(self, service_with_mocks, mock_user, mock_organization):
        """✅ Test login verification when 2FA not enabled."""
        # Mock no 2FA setup
        service_with_mocks.repository.get_by_user_and_organization.return_value = None
        
        result = service_with_mocks.verify_2fa_for_login(mock_user, mock_organization)
        
        assert result is True  # Login allowed without 2FA

    def test_verify_2fa_for_login_with_valid_token(self, service_with_mocks, mock_user, mock_organization):
        """✅ Test login verification with valid TOTP token."""
        # Mock enabled 2FA
        mock_2fa = Mock()
        mock_2fa.is_enabled = True
        mock_2fa.secret_key = "JBSWY3DPEHPK3PXP"
        service_with_mocks.repository.get_by_user_and_organization.return_value = mock_2fa
        
        # Generate valid token
        totp = pyotp.TOTP(mock_2fa.secret_key)
        valid_token = totp.now()
        
        result = service_with_mocks.verify_2fa_for_login(
            mock_user, mock_organization, token=valid_token
        )
        
        assert result is True
        service_with_mocks.repository.update_last_used.assert_called_once()

    def test_verify_2fa_for_login_with_invalid_token(self, service_with_mocks, mock_user, mock_organization):
        """❌ Test login verification with invalid TOTP token."""
        # Mock enabled 2FA
        mock_2fa = Mock()
        mock_2fa.is_enabled = True
        mock_2fa.secret_key = "JBSWY3DPEHPK3PXP"
        service_with_mocks.repository.get_by_user_and_organization.return_value = mock_2fa
        
        invalid_token = "000000"
        
        result = service_with_mocks.verify_2fa_for_login(
            mock_user, mock_organization, token=invalid_token
        )
        
        assert result is False
        service_with_mocks.repository.update_last_used.assert_not_called()


class TestTwoFactorServiceValidation:
    """Test input validation and edge cases."""

    def test_verify_totp_token_malformed_input(self):
        """❌ Test TOTP verification with malformed input."""
        service = UserTwoFactorService(Mock())
        
        # Test various invalid inputs
        invalid_inputs = [
            ("", "123456"),           # Empty secret
            ("INVALID", "123456"),    # Invalid secret
            ("JBSWY3DPEHPK3PXP", ""), # Empty token
            ("JBSWY3DPEHPK3PXP", None), # None token
        ]
        
        for secret, token in invalid_inputs:
            result = service.verify_totp_token(secret, token)
            assert result is False

    def test_generate_backup_codes_different_count(self):
        """✅ Test backup code generation with different counts."""
        service = UserTwoFactorService(Mock())
        
        for count in [1, 5, 10, 20]:
            codes, hashes = service.generate_backup_codes(count=count)
            assert len(codes) == count
            assert len(hashes) == count