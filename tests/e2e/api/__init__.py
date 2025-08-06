"""
API E2E Tests Package

Comprehensive end-to-end tests for the SaaS Starter API following CLAUDE.md guidelines.

GOLDEN RULE: FUNCTIONALITY FIRST
1. PRIORITY 1: Tests returning 200, 201, 204 (real functionality)
2. PRIORITY 2: Validation and security tests (4XX/5XX) 
3. OBJECTIVE: Verify that features TRULY WORK

Test Categories:
- test_auth.py: Authentication & authorization (22 tests)
- test_users.py: User management & profiles (21 tests)  
- test_organizations.py: Organization CRUD & members (24 tests)
- test_health.py: Health, performance & security (17 tests)

Quick Start:
    # Run all tests
    python run_tests.py
    
    # Run specific category  
    pytest test_auth.py -v
    
    # Run success scenarios only
    pytest -k Success -v

Total: ~100 comprehensive E2E tests covering all API functionality.
"""

__version__ = "1.0.0"
__author__ = "SaaS Starter Team"
