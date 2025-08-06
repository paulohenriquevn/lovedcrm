# 🧪 API E2E Tests

**Comprehensive End-to-End tests for the SaaS Starter API following CLAUDE.md guidelines.**

## 🎯 Testing Philosophy (GOLDEN RULE)

**FUNCTIONALITY FIRST:**

1. **PRIORITY 1**: Tests returning 200, 201, 204 (real functionality)
2. **PRIORITY 2**: Validation and security tests (4XX/5XX)
3. **OBJECTIVE**: Verify that features TRULY WORK

## 📁 Test Structure

```
tests/e2e/api/
├── conftest.py           # Test configuration and fixtures
├── test_auth.py          # Authentication tests (11 endpoints)
├── test_users.py         # User management tests (7 endpoints)
├── test_organizations.py # Organization tests (9 endpoints)
├── test_health.py        # Health and general API tests (6 endpoints)
├── test_recaptcha.py     # reCAPTCHA v3 integration tests (NEW)
└── README.md            # This documentation
```

## 🔧 Test Environment Setup

### Prerequisites

1. **Test Environment Running:**

   ```bash
   make setup-test-start     # Start complete E2E test environment
   ```

2. **Verify Environment:**
   ```bash
   make test-verify          # Check all services are healthy
   ```

### Test Database

- **Host:** localhost:5434
- **Database:** saas_test
- **User:** postgres
- **Password:** postgres

### reCAPTCHA Test Configuration

- **Enabled by:** `TEST_RECAPTCHA_ENABLED=true` environment variable
- **Bypass token:** `test_bypass_token_for_e2e_tests` (for test automation)
- **Test modes:** Both enabled and disabled scenarios

## 🚀 Running Tests

### Quick Test Run

```bash
# All API tests
npm run test:e2e:api

# Specific test files
pytest tests/e2e/api/test_auth.py -v
pytest tests/e2e/api/test_users.py -v
pytest tests/e2e/api/test_organizations.py -v
pytest tests/e2e/api/test_recaptcha.py -v
```

### Detailed Test Execution

```bash
# Run with detailed output
pytest tests/e2e/api/ -v --tb=short

# Run specific test class
pytest tests/e2e/api/test_auth.py::TestAuthenticationSuccess -v

# Run specific test
pytest tests/e2e/api/test_auth.py::TestAuthenticationSuccess::test_register_user_success -v
```

### Test Categories

```bash
# Success scenarios only (PRIORITY 1)
pytest tests/e2e/api/ -k "Success" -v

# Validation scenarios only (PRIORITY 2)
pytest tests/e2e/api/ -k "Validation" -v

# Edge cases
pytest tests/e2e/api/ -k "EdgeCases" -v

# reCAPTCHA tests (when enabled)
TEST_RECAPTCHA_ENABLED=true pytest tests/e2e/api/test_recaptcha.py -v
```

## 📊 Test Coverage

### Authentication Tests (`test_auth.py`)

- **Success Scenarios (6 tests):**
  - ✅ User registration (201)
  - ✅ User login (200)
  - ✅ Token refresh (200)
  - ✅ Get current user (200)
  - ✅ User logout (200)
  - ✅ Complete auth flow

- **Validation Scenarios (12 tests):**
  - ❌ Duplicate email registration (400)
  - ❌ Invalid email formats (422)
  - ❌ Weak passwords (422)
  - ❌ Missing fields (422)
  - ❌ Wrong credentials (401)
  - ❌ Invalid tokens (401)

- **Edge Cases (4 tests):**
  - Case insensitive emails
  - Long emails
  - Concurrent registration

### User Tests (`test_users.py`)

- **Success Scenarios (6 tests):**
  - ✅ Get profile (200)
  - ✅ Update profile (200)
  - ✅ Partial updates (200)
  - ✅ Change password (200)
  - ✅ Get organizations (200)
  - ✅ Update settings (200)

- **Validation Scenarios (11 tests):**
  - ❌ Unauthenticated access (401)
  - ❌ Invalid data formats (422)
  - ❌ Field length limits (422)
  - ❌ Wrong current password (400)
  - ❌ Weak new password (422)

- **Edge Cases (4 tests):**
  - Empty optional fields
  - Unicode characters
  - Boundary lengths
  - Concurrent updates

### Organization Tests (`test_organizations.py`)

- **Success Scenarios (7 tests):**
  - ✅ Create organization (201)
  - ✅ Get by ID (200)
  - ✅ List user orgs (200)
  - ✅ Update organization (200)
  - ✅ Get members (200)
  - ✅ Delete organization (200)
  - ✅ Complete CRUD lifecycle

- **Validation Scenarios (12 tests):**
  - ❌ Unauthenticated access (401)
  - ❌ Missing required fields (422)
  - ❌ Duplicate slugs (400)
  - ❌ Invalid formats (422)
  - ❌ Non-existent resources (404)
  - ❌ Permission denied (403)

- **Edge Cases (5 tests):**
  - Minimal data
  - Unicode characters
  - Case sensitivity
  - Empty optional fields

### Health Tests (`test_health.py`)

- **API Health (4 tests):**
  - ✅ Health check endpoint
  - ✅ Root endpoint
  - ✅ API documentation
  - ✅ OpenAPI spec

- **Error Handling (3 tests):**
  - ❌ Non-existent endpoints (404)
  - ❌ Invalid methods (405)
  - ❌ Malformed requests (422)

- **Performance (3 tests):**
  - Response time checks
  - Concurrent requests
  - Rapid sequential requests

- **Security (4 tests):**
  - CORS headers
  - Security headers
  - SQL injection protection
  - XSS protection

## 🎛️ Test Configuration

### Fixtures (`conftest.py`)

**Database Fixtures:**

- `clean_database` - Fresh DB for each test
- `db_session` - Database session

**Authentication Fixtures:**

- `test_user_data` - Unique test user data
- `registered_user` - Pre-registered user
- `authenticated_user` - User with valid tokens

**Organization Fixtures:**

- `test_organization_data` - Unique org data
- `user_with_organization` - User with created org

**Utility Fixtures:**

- `api_client` - HTTP client for requests

### Test Utilities

**Assertion Helpers:**

- `assert_successful_response()` - Verify 2XX responses
- `assert_error_response()` - Verify 4XX/5XX responses
- `assert_valid_uuid()` - Validate UUID format
- `assert_valid_email()` - Validate email format

**Data Generators:**

- `generate_invalid_emails()` - Invalid email formats
- `generate_weak_passwords()` - Weak password patterns

## 🔧 Configuration

### Environment Variables

```bash
# Basic test configuration
TEST_BASE_URL=http://localhost:8001
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5434/saas_test

# reCAPTCHA test configuration (optional)
TEST_RECAPTCHA_ENABLED=false  # Set to 'true' to enable reCAPTCHA tests
```

### Running with reCAPTCHA Enabled

```bash
# Export environment variable
export TEST_RECAPTCHA_ENABLED=true

# Or run with inline environment variable
TEST_RECAPTCHA_ENABLED=true pytest tests/e2e/api/test_recaptcha.py -v

# Run all tests with reCAPTCHA enabled
TEST_RECAPTCHA_ENABLED=true pytest tests/e2e/api/ -v
```

### Test Settings

- **Auto database cleanup** between tests
- **Unique test data** generation (UUIDs)
- **Request/response logging** in verbose mode
- **Timeout handling** for slow responses

## 🚨 Troubleshooting

### Common Issues

**Tests failing with 503 Service Unavailable:**

```bash
# Check if test environment is running
make test-verify

# Restart test environment
make setup-test-stop
make setup-test-start
```

**Database connection errors:**

```bash
# Check test database
docker-compose -f docker-compose.test.yml ps postgres-test

# Check database logs
docker-compose -f docker-compose.test.yml logs postgres-test
```

**Tests passing locally but failing in CI:**

- Ensure proper test isolation with `clean_database`
- Check for timing issues in concurrent tests
- Verify environment variables are set

### Debug Mode

**Run with detailed output:**

```bash
pytest tests/e2e/api/ -v -s --tb=long
```

**Debug specific test:**

```bash
pytest tests/e2e/api/test_auth.py::test_login -v -s --pdb
```

## 📈 Test Metrics

**Total Tests:** ~100 comprehensive E2E tests

- **Success Scenarios:** ~25 tests (PRIORITY 1)
- **Validation Scenarios:** ~50 tests (PRIORITY 2)
- **Edge Cases:** ~15 tests
- **Performance & Security:** ~10 tests
- **reCAPTCHA Integration:** ~15 tests

**Coverage:**

- **Authentication:** 22 tests
- **Users:** 21 tests
- **Organizations:** 24 tests
- **Health & General:** 17 tests
- **Security & Performance:** 16 tests
- **reCAPTCHA v3:** 15 tests

### reCAPTCHA Tests (`test_recaptcha.py`)

- **Success Scenarios (3 tests):**
  - ✅ Register with valid reCAPTCHA token (201)
  - ✅ Login with valid reCAPTCHA token (200)
  - ✅ Forgot password with valid reCAPTCHA token (200)

- **Validation Scenarios (6 tests):**
  - ❌ Register without reCAPTCHA token (429)
  - ❌ Register with invalid reCAPTCHA token (429)
  - ❌ Login without reCAPTCHA token (429)
  - ❌ Login with invalid reCAPTCHA token (429)
  - ❌ Forgot password without reCAPTCHA token (429)
  - ❌ Forgot password with invalid reCAPTCHA token (429)

- **Edge Cases (3 tests):**
  - Empty reCAPTCHA token handling
  - Expired reCAPTCHA token validation
  - Token reuse prevention

- **Bypass Tests (2 tests):**
  - ✅ Authentication works when reCAPTCHA disabled
  - ✅ Registration works when reCAPTCHA disabled

## 🎯 Best Practices

1. **Follow GOLDEN RULE:** Test success scenarios first
2. **Use unique test data:** Avoid test conflicts
3. **Clean database:** Ensure test isolation
4. **Test real scenarios:** Simulate actual user workflows
5. **Validate responses:** Check structure and data
6. **Handle concurrency:** Test race conditions
7. **Security focused:** Include XSS, SQL injection tests
8. **Performance aware:** Monitor response times

## 🔄 Continuous Integration

Tests are designed to run in CI/CD pipelines:

```bash
# CI command
make test-env-full && make test-run-api
```

Expected results:

- **All tests pass** in fresh environment
- **No flaky tests** due to proper isolation
- **Fast execution** (~2-5 minutes total)
- **Comprehensive coverage** of all API endpoints
