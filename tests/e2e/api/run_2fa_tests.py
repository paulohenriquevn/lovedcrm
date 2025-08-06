#!/usr/bin/env python3
"""
🔐 Two-Factor Authentication E2E Test Runner

Run comprehensive 2FA tests to validate:
- Complete 2FA setup and confirmation flow
- Optional 2FA login integration
- Backup code functionality  
- Multi-tenant isolation
- Security validations

Usage:
    python run_2fa_tests.py
    python run_2fa_tests.py --verbose
    python run_2fa_tests.py --specific test_2fa_login_flow_optional
"""

import subprocess
import sys
import os
from datetime import datetime


def run_2fa_tests(verbose: bool = False, specific_test: str = None):
    """Run 2FA E2E tests with proper configuration."""
    
    print("🔐 Starting Two-Factor Authentication E2E Tests")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Change to project root directory
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
    os.chdir(project_root)
    print(f"📁 Working directory: {project_root}")
    
    # Base pytest command
    cmd = [
        "python3", "-m", "pytest",
        "tests/e2e/api/test_two_factor_auth.py",
        "-v" if verbose else "-q",
        "--tb=short",
        "-x",  # Stop on first failure
        "--color=yes"
    ]
    
    # Add marker for 2FA tests
    cmd.extend(["-m", "two_factor_auth"])
    
    # Add specific test if provided
    if specific_test:
        cmd.extend(["-k", specific_test])
        print(f"🎯 Running specific test: {specific_test}")
    else:
        print("🧪 Running all 2FA tests")
    
    print()
    print("📋 Test Categories:")
    print("  ✅ Success Scenarios (2XX) - Real functionality")
    print("  ❌ Validation Scenarios (4XX) - Security & validation")
    print("  🔒 Multi-tenant Isolation")
    print()
    
    # Environment setup
    env = os.environ.copy()
    env["PYTHONPATH"] = project_root
    
    print("🚀 Executing tests...")
    print("Command:", " ".join(cmd))
    print("-" * 60)
    
    try:
        result = subprocess.run(cmd, env=env, check=False)
        
        print("-" * 60)
        print(f"⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if result.returncode == 0:
            print("🎉 All 2FA tests passed successfully!")
            print()
            print("✅ Validated Features:")
            print("  • 2FA setup and confirmation flow")
            print("  • Optional 2FA login integration")
            print("  • TOTP token validation")
            print("  • Backup code authentication")
            print("  • Multi-tenant data isolation")
            print("  • Security validations")
            print()
            print("🔐 2FA system is fully functional!")
        else:
            print("❌ Some tests failed. Check output above for details.")
            print()
            print("💡 Common issues:")
            print("  • Test environment not running (make test-start)")
            print("  • Database migration pending (make test-hot-migrate)")
            print("  • API server not accessible on port 8001")
            print("  • Dependencies missing (pip install pyotp)")
        
        return result.returncode
        
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        return 1


def print_help():
    """Print help information."""
    help_text = """
🔐 Two-Factor Authentication E2E Test Runner

Available commands:
  python run_2fa_tests.py                    # Run all 2FA tests
  python run_2fa_tests.py --verbose          # Verbose output
  python run_2fa_tests.py --help             # Show this help
  
Specific test examples:
  python run_2fa_tests.py --specific test_2fa_login_flow_optional
  python run_2fa_tests.py --specific test_2fa_setup_generates_secret
  python run_2fa_tests.py --specific TestTwoFactorAuthSuccess
  
Test Environment Setup:
  make test-start          # Start test environment
  make test-hot-migrate    # Apply migrations
  make test-stop          # Stop test environment
  
Requirements:
  • Test environment running on port 8001
  • Test database on port 5434
  • pyotp dependency installed
  • Migration 003_user_two_factor applied
"""
    print(help_text)


def main():
    """Main entry point."""
    args = sys.argv[1:]
    
    verbose = "--verbose" in args or "-v" in args
    help_requested = "--help" in args or "-h" in args
    
    specific_test = None
    if "--specific" in args:
        try:
            specific_index = args.index("--specific")
            specific_test = args[specific_index + 1]
        except (IndexError, ValueError):
            print("❌ Error: --specific requires a test name")
            return 1
    
    if help_requested:
        print_help()
        return 0
    
    # Check if pyotp is installed
    try:
        import pyotp
    except ImportError:
        print("❌ Error: pyotp is required for 2FA tests")
        print("Install with: pip install pyotp")
        return 1
    
    return run_2fa_tests(verbose=verbose, specific_test=specific_test)


if __name__ == "__main__":
    sys.exit(main())