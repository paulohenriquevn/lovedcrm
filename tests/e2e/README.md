# E2E Testing Environment - Multi-Tenant SaaS Starter

**Comprehensive End-to-End testing suite following CLAUDE.md guidelines with multi-tenancy support and hot updates.**

## Testing Philosophy (GOLDEN RULE)

**FUNCTIONALITY FIRST:**

1. **PRIORITY 1**: Tests returning 200, 201, 204 (real functionality)
2. **PRIORITY 2**: Validation and security tests (4XX/5XX)
3. **OBJECTIVE**: Verify that features TRULY WORK

## Architecture Overview

### Project Structure

```
tests/e2e/
├── README.md                    # This comprehensive guide
├── api/                         # API E2E tests (100+ tests)
│   ├── README.md               # API-specific documentation
│   ├── conftest.py             # Multi-tenant fixtures & utilities
│   ├── run_tests.py            # Organized test runner
│   ├── test_auth.py            # Authentication tests (22 tests)
│   ├── test_users.py           # User management tests (21 tests)
│   ├── test_organizations.py   # Organization tests (24 tests)
│   ├── test_health.py          # Health & security tests (17 tests)
│   ├── test_invites.py         # Invitation system tests
│   └── test_roles.py           # Role management tests
└── mocks/                      # External service mocks
    ├── stripe/                 # Stripe API mocks (payments)
    │   ├── mappings/           # WireMock configurations
    │   └── __files/            # Response templates
    └── oauth/                  # OAuth provider mocks
        ├── mappings/           # OAuth flow mocks
        └── __files/            # Token responses
```

### Multi-Tenant Testing Architecture

#### **Organization-Centric Design:**

- **Every test scoped to organization** (org_id required)
- **Automatic org creation** on user registration
- **Data isolation verification** between organizations
- **Role-based access testing** (owner, admin, member, viewer)
- **Cross-org security validation** (zero data leakage)

#### **Authentication Context:**

```python
# All authenticated tests include:
api_client.headers.update({
    "Authorization": f"Bearer {access_token}",
    "X-Org-Id": organization['id']  # CRITICAL for multi-tenancy
})
```

#### **Test Data Isolation:**

```python
# Smart cleanup preserves seed data, removes test data
"DELETE FROM users WHERE email NOT IN ('test@example.com', 'admin@example.com')"
```

## Quick Start

### **1. Environment Setup**

```bash
# Start complete E2E environment (45s first time, 10s subsequent)
make setup-test-start

# Verify all services are healthy
make test-verify
```

### **2. Run Tests**

```bash
# All E2E tests (organized by priority)
make test-e2e-run

# API tests only
make test-api
# OR
npm run test:e2e:api

# Specific test categories
pytest tests/e2e/api/test_auth.py -v          # Authentication
pytest tests/e2e/api/test_organizations.py -v # Organizations
pytest tests/e2e/api/ -k "Success" -v         # Success scenarios only
```

### **3. Hot Development (NEW - Super Fast!)**

```bash
# Schema changes without restart (2s vs 45s)
make test-hot-migrate

# Data updates without restart (3s vs 45s)
make test-hot-data

# Full reset without restart (5s vs 45s)
make test-hot-reset

# Quick status check
make test-hot-status
```

## Environment Configuration

### **Docker Services (docker-compose.test.yml)**

| Service           | Port | Purpose                   | Health Check       |
| ----------------- | ---- | ------------------------- | ------------------ |
| **postgres-test** | 5434 | Test database (saas_test) | `pg_isready`       |
| **redis-test**    | 6380 | Cache & sessions          | `redis-cli ping`   |
| **api-test**      | 8001 | FastAPI test server       | `/health` endpoint |
| **mock-stripe**   | 9080 | Stripe API simulation     | WireMock health    |
| **mock-email**    | 8025 | Email service (MailHog)   | SMTP check         |
| **mock-s3**       | 9000 | S3 storage (MinIO)        | Health endpoint    |

### **Database Configuration**

- **Host**: localhost:5434
- **Database**: saas_test
- **User**: postgres
- **Password**: postgres
- **Auto-migrations**: Applied on container start

### **Test Environment Variables**

```bash
TEST_BASE_URL=http://localhost:8001
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5434/saas_test
ENVIRONMENT=test
EMAIL_ENABLED=false  # Mocked via MailHog
```

## Test Categories & Coverage

### **Authentication Tests (`test_auth.py`)**

**22 comprehensive tests covering full auth lifecycle**

#### **Success Scenarios (6 tests - PRIORITY 1):**

- User registration with auto-org creation (201)
- User login with JWT + org context (200)
- Token refresh with org validation (200)
- Get current user with org data (200)
- User logout with token invalidation (200)
- Complete auth flow end-to-end

#### **Validation Scenarios (12 tests - PRIORITY 2):**

- Duplicate email registration (400)
- Invalid email formats (422)
- Weak passwords (422)
- Missing required fields (422)
- Wrong credentials (401)
- Invalid/expired tokens (401)

#### **Edge Cases (4 tests):**

- Case insensitive emails
- Long email addresses
- Concurrent registration attempts
- Token expiration boundaries

### **User Management Tests (`test_users.py`)**

**21 tests for user CRUD and profile management**

#### **Success Scenarios (6 tests - PRIORITY 1):**

- Get user profile with org context (200)
- Update profile information (200)
- Partial profile updates (200)
- Change password securely (200)
- Get user organizations (200)
- Update user preferences (200)

#### **Validation Scenarios (11 tests - PRIORITY 2):**

- Unauthenticated access attempts (401)
- Invalid data formats (422)
- Field length limit violations (422)
- Wrong current password (400)
- Weak new passwords (422)

#### **Edge Cases (4 tests):**

- Empty optional fields handling
- Unicode character support
- Boundary value testing
- Concurrent update scenarios

### **Organization Tests (`test_organizations.py`)**

**24 tests for multi-tenant organization management**

#### **Success Scenarios (7 tests - PRIORITY 1):**

- Organization auto-creation on registration (201)
- Get organization by ID with member data (200)
- List user organizations with roles (200)
- Update organization details (200)
- Get organization members with roles (200)
- Member role management (200)
- Complete organization lifecycle

#### **Validation Scenarios (12 tests - PRIORITY 2):**

- Cross-organization access attempts (403)
- Unauthenticated organization access (401)
- Missing required fields (422)
- Duplicate organization slugs (400)
- Invalid organization formats (422)
- Non-existent organizations (404)

#### **Multi-Tenancy Security (5 tests):**

- Data isolation verification
- Cross-org permission denial
- Role-based access validation
- Org membership requirements
- Context header validation

### **Health & Security Tests (`test_health.py`)**

**17 tests for API health and security validation**

#### **API Health (4 tests):**

- Health check endpoint functionality
- Root endpoint API information
- Documentation accessibility
- OpenAPI specification validity

#### **Error Handling (3 tests):**

- Non-existent endpoints (404)
- Invalid HTTP methods (405)
- Malformed requests (422)

#### **Security Tests (4 tests):**

- CORS headers validation
- Security headers verification
- SQL injection protection
- XSS attack prevention

#### **Performance Tests (3 tests):**

- Response time monitoring
- Concurrent request handling
- Rate limiting validation

#### **Multi-Tenancy Security (3 tests):**

- Organization context validation
- Cross-tenant data isolation
- Header requirement enforcement

### **Invitation System Tests (`test_invites.py`)**

**Tests for team member invitation workflows**

- Organization member invitations
- Role-based invite validation
- Invite acceptance/rejection flows
- Expired invitation handling
- Cross-org invite security

### **Role Management Tests (`test_roles.py`)**

**Tests for organization role and permission system**

- Owner, admin, member, viewer roles
- Permission-based access control
- Role assignment/removal
- Hierarchical permission validation
- Role-based feature access

## Hot Updates (Development Acceleration)

### **Hot Schema Updates**

```bash
# Apply database migrations without restart
make test-hot-migrate  # 2s vs 45s full restart

# Example workflow (post-consolidation):
echo "ALTER TABLE users ADD COLUMN birth_date DATE;" > migrations/002_add_birth_date.sql
echo "INSERT INTO schema_versions VALUES (2, 'Add birth_date');" >> migrations/002_add_birth_date.sql
make test-hot-migrate
pytest tests/e2e/api/test_users.py -v

# Note: Migration numbering starts at 002 since 001 is the consolidated initial schema
```

### **Hot Data Updates**

```bash
# Reload test data without restart
make test-hot-data     # 3s vs 45s full restart

# Reset all data keeping schema
make test-hot-reset    # 5s vs 45s full restart

# Apply all hot updates
make test-hot-all      # Migration + data reload
```

### **Hot Status Monitoring**

```bash
# Quick environment health check
make test-hot-status

# Output example:
# Hot status check...
# Database: Database is up to date
# API Health: OK
```

### **Performance Comparison**

| Operation      | Traditional | Hot Update | Speedup        |
| -------------- | ----------- | ---------- | -------------- |
| Schema changes | 45s         | 2s         | **95% faster** |
| Data reload    | 45s         | 3s         | **93% faster** |
| Data reset     | 45s         | 5s         | **89% faster** |
| Status check   | 10s         | 1s         | **90% faster** |

## Test Execution Strategies

### **Priority-Based Execution**

```bash
# Run tests by priority (recommended)
python tests/e2e/api/run_tests.py

# Success scenarios only (PRIORITY 1)
pytest tests/e2e/api/ -k "Success" -v

# Validation scenarios only (PRIORITY 2)
pytest tests/e2e/api/ -k "Validation" -v

# Edge cases and performance
pytest tests/e2e/api/ -k "EdgeCases" -v
```

### **Module-Specific Execution**

```bash
# Authentication flow testing
pytest tests/e2e/api/test_auth.py::TestAuthenticationSuccess -v

# Multi-tenancy validation
pytest tests/e2e/api/test_organizations.py::TestOrganizationsValidation -v

# Security testing
pytest tests/e2e/api/test_health.py::TestAPISecurity -v
```

### **Development Workflow**

```bash
# 1. Start environment once
make setup-test-start

# 2. Fast development cycle
make test-hot-migrate           # Apply schema changes
pytest tests/e2e/api/test_*.py  # Run relevant tests
make test-hot-data              # Update data if needed

# 3. Full validation before commit
python tests/e2e/api/run_tests.py
```

## Multi-Tenant Test Fixtures

### **Core Authentication Fixtures**

```python
@pytest.fixture
def authenticated_user(api_client, registered_user):
    """User with valid JWT + org context headers."""
    # Sets Authorization and X-Org-Id headers automatically

@pytest.fixture
def seed_user_owner(api_client):
    """Seed user with owner role in test organization."""

@pytest.fixture
def seed_user_admin(api_client):
    """Seed user with admin role in test organization."""
```

### **Organization Context Fixtures**

```python
@pytest.fixture
def user_with_organization(authenticated_user):
    """User with associated organization data."""

@pytest.fixture
def test_organization_data():
    """Generates unique organization test data."""
```

### **Data Isolation Fixtures**

```python
@pytest.fixture
def clean_database(db_session):
    """Preserves seed data, cleans test data between tests."""
    # Smart cleanup that maintains referential integrity
```

## Configuration & Customization

### **Environment Configuration**

```bash
# Override test settings
export TEST_BASE_URL=http://localhost:8001
export TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5434/saas_test
export MIGRATE_DEBUG=1  # Enable migration debugging
```

### **Test Data Customization**

```python
# Custom test data generators
def generate_test_user(suffix=""):
    unique_id = str(uuid.uuid4())[:8]
    return {
        "email": f"testuser_{unique_id}{suffix}@example.com",
        "password": "TestPassword123!",
        "full_name": f"Test User {unique_id}",
        "terms_accepted": True
    }
```

### **Mock Service Configuration**

```bash
# Update Stripe mocks
# Edit: tests/e2e/mocks/stripe/mappings/*.json

# Restart mocks without full environment restart
make test-hot-mocks
```

## Troubleshooting Guide

### **Common Issues & Solutions**

#### **Environment Issues**

```bash
# Services not responding
make test-verify  # Check service health
make setup-test-stop && make setup-test-start  # Full restart

# Database connection errors
docker-compose -f docker-compose.test.yml logs postgres-test
```

#### **Test Failures**

```bash
# Debug specific test with full output
pytest tests/e2e/api/test_auth.py::test_login -v -s --tb=long

# Check test isolation
pytest tests/e2e/api/test_organizations.py -v --tb=short

# Verify multi-tenancy
pytest tests/e2e/api/ -k "cross_org" -v
```

#### **Performance Issues**

```bash
# Hot updates not working
make test-hot-status  # Check environment

# Slow test execution
pytest tests/e2e/api/ --durations=10  # Show slowest tests
```

#### **Database Issues**

```bash
# Reset test database completely
make setup-test-stop
docker volume rm $(docker volume ls -q | grep test)
make setup-test-start

# Apply migrations manually
cd migrations && DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test ./migrate apply
```

### **Debug Mode Execution**

```bash
# Verbose output with debug info
pytest tests/e2e/api/ -v -s --tb=long --log-cli-level=DEBUG

# Interactive debugging
pytest tests/e2e/api/test_auth.py::test_login -v -s --pdb

# Migration debugging
MIGRATE_DEBUG=1 make test-hot-migrate
```

## Test Metrics & Coverage

### **Current Test Statistics**

- **Total E2E Tests**: ~100 comprehensive tests
- **Success Scenarios**: ~25 tests (PRIORITY 1 - functionality)
- **Validation Scenarios**: ~50 tests (PRIORITY 2 - security)
- **Edge Cases**: ~15 tests (boundary conditions)
- **Performance & Security**: ~10 tests (non-functional)

### **Coverage by Module**

- **Authentication**: 22 tests (registration, login, tokens, security)
- **Users**: 21 tests (CRUD, profiles, preferences, validation)
- **Organizations**: 24 tests (multi-tenancy, roles, permissions)
- **Health & Security**: 17 tests (API health, security, performance)
- **Invitations**: 8 tests (team management workflows)
- **Roles**: 6 tests (permission system validation)

### **Multi-Tenancy Coverage**

- **Data Isolation**: 100% (zero cross-org data access)
- **Authentication**: JWT + org_id in all protected endpoints
- **Authorization**: Role-based access in all organization features
- **Context Headers**: X-Org-Id validation in all requests
- **Security Testing**: Cross-org permission denial verification

## Best Practices

### **Test Development Guidelines**

1. **Follow GOLDEN RULE**: Test success scenarios first
2. **Multi-tenant by default**: Always include org_id context
3. **Use unique test data**: Avoid conflicts with UUIDs
4. **Verify data isolation**: Test cross-org security
5. **Document test intent**: Clear test names and docstrings
6. **Test real workflows**: Simulate actual user interactions

### **Performance Optimization**

1. **Use hot updates**: 20x faster than full restarts
2. **Parallel execution**: Run independent tests concurrently
3. **Smart cleanup**: Preserve seeds, clean test data only
4. **Mock external services**: Avoid real API calls
5. **Database transactions**: Use rollback for faster cleanup

### **Security Testing**

1. **Test authentication**: Every protected endpoint
2. **Validate authorization**: Role-based access control
3. **Verify data isolation**: Cross-organization security
4. **Input validation**: Malformed data handling
5. **Error handling**: Proper error responses

## Continuous Integration

### **CI/CD Integration**

```bash
# Complete CI test cycle
make setup-test-start  # Environment setup
make test-verify       # Health verification
make test-e2e-run      # Execute all E2E tests
make setup-test-stop   # Cleanup

# Fast development cycle
make test-hot-all      # Hot updates only
pytest tests/e2e/api/ -x  # Stop on first failure
```

### **Expected Results**

- **All tests pass** in fresh environment
- **No flaky tests** due to proper isolation
- **Fast execution** (~2-5 minutes total)
- **Comprehensive coverage** of all API endpoints
- **Zero false positives** from proper multi-tenant design

## Future Enhancements

### **Planned Improvements**

- **Frontend E2E Tests**: Playwright integration with API tests
- **Load Testing**: Performance validation under load
- **Security Scanning**: Automated vulnerability assessment
- **Visual Regression**: UI component change detection
- **Test Reporting**: Detailed coverage and performance metrics

### **Architecture Evolution**

- **Microservice Testing**: Service-to-service communication
- **Event Testing**: Async event handling validation
- **Cache Testing**: Redis integration verification
- **File Upload Testing**: S3 integration validation
- **Email Testing**: Template and delivery verification

---

## Additional Resources

- **API Documentation**: [tests/e2e/api/README.md](api/README.md)
- **Project Guidelines**: [../../CLAUDE.md](../../CLAUDE.md)
- **Migration System**: [../../migrations/README.md](../../migrations/README.md)
- **Docker Configuration**: [../../docker-compose.test.yml](../../docker-compose.test.yml)

**Need help?** Check the troubleshooting section or run `make help` for available commands.
