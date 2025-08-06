# Pull Request

## Description

<!-- Provide a detailed description of the changes -->

### Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring (no functional changes)
- [ ] UI/UX improvements
- [ ] Security enhancement
- [ ] Performance improvement

### Multi-Tenancy Impact

- [ ] Changes are organization-scoped (data isolation maintained)
- [ ] All database queries include organization filtering
- [ ] API endpoints use organization dependency injection
- [ ] Frontend uses BaseService for API calls
- [ ] Changes affect cross-organization functionality (admin/system level)
- [ ] No multi-tenancy considerations needed

## Related Issues

<!-- Link to related issues using keywords: fixes, closes, resolves -->

- Fixes #(issue_number)
- Related to #(issue_number)

## Testing

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Multi-tenancy isolation tests included
- [ ] All existing tests pass

### Multi-Tenancy Testing

- [ ] Verified organization data isolation
- [ ] Tested cross-organization access prevention
- [ ] Confirmed proper header-based tenant resolution
- [ ] Validated role-based access controls

### Manual Testing

- [ ] Tested in local development environment
- [ ] Verified with different user roles (owner, admin, member)
- [ ] Tested with multiple organizations
- [ ] Checked responsive design (if frontend changes)
- [ ] Verified accessibility compliance (if UI changes)

## Implementation Details

### Architecture Changes

<!-- Describe any architectural changes -->

### Database Changes

<!-- List any database schema changes, migrations needed -->

- [ ] New migrations created
- [ ] Migration tested locally
- [ ] Migration includes proper organization_id references
- [ ] Backward compatibility maintained

### API Changes

<!-- Document any API changes -->

- [ ] New endpoints documented
- [ ] API versioning considered
- [ ] Breaking changes documented
- [ ] OpenAPI/Swagger docs updated

### Frontend Changes

<!-- Describe UI/UX changes -->

- [ ] Components follow design system patterns
- [ ] Internationalization (i18n) keys added
- [ ] Responsive design implemented
- [ ] Accessibility standards met

## Security Checklist

- [ ] No sensitive data exposed in logs
- [ ] Authentication/authorization properly implemented
- [ ] Input validation added where needed
- [ ] SQL injection prevention verified
- [ ] XSS prevention implemented
- [ ] CSRF protection maintained
- [ ] Organization boundaries respected

## Performance Impact

- [ ] No significant performance degradation
- [ ] Database queries optimized
- [ ] Frontend bundle size impact considered
- [ ] Caching strategy implemented where appropriate

## Deployment

### Environment Impact

- [ ] Safe for production deployment
- [ ] Environment variables documented
- [ ] Feature flags implemented (if needed)
- [ ] Rollback plan available

### Deployment Notes

<!-- Any special deployment considerations -->

## Screenshots/Videos

<!-- Add screenshots for UI changes, videos for complex workflows -->

## Code Review Checklist

### General

- [ ] Code follows project style guidelines
- [ ] Self-descriptive code with appropriate comments
- [ ] No commented-out code blocks
- [ ] No console.log statements in production code
- [ ] Error handling implemented appropriately

### Multi-Tenant Specific

- [ ] All database operations include organization filtering
- [ ] No hardcoded organization IDs
- [ ] Organization context properly passed through layers
- [ ] No cross-organization data leaks possible

### Testing

- [ ] Test coverage is adequate
- [ ] Tests are readable and maintainable
- [ ] Edge cases covered
- [ ] Negative test cases included

## Documentation

- [ ] README updated (if needed)
- [ ] API documentation updated
- [ ] Code comments added for complex logic
- [ ] Migration documentation included

## Pre-Merge Checklist

### Code Quality

- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Security scan passes (`npm run security`)
- [ ] All tests pass (`npm run test:all`)

### Multi-Tenancy Compliance

- [ ] Organization isolation verified
- [ ] Cross-tenant access tests pass
- [ ] Proper role-based access implemented
- [ ] BaseService pattern followed

### Frontend Specific (if applicable)

- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in browser
- [ ] Responsive design tested
- [ ] i18n keys properly implemented

### Backend Specific (if applicable)

- [ ] Python linting passes (flake8, black, isort)
- [ ] Type hints added where appropriate
- [ ] Security scan passes (bandit)
- [ ] Database migrations tested

## Reviewers

<!-- @mention specific reviewers if needed -->

---

**Security Note:** This PR maintains organization data isolation and follows multi-tenant security best practices.

**Ready for Review:** This PR is ready for code review and testing.
