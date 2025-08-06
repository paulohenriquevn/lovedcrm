# Railway CLI - Quick Reference

**Essential commands** for production management and GitHub Secrets configuration.

> ** Project**: `ca4e5687-7c67-4a44-aef9-581ec085cc81`  
> ** Related**: [Production Migrations](PRODUCTION-MIGRATIONS-GUIDE.md) | [GitHub Secrets Setup](GITHUB-SECRETS-SETUP.md)

## **Quick Setup**

```bash
# Install and connect
npm install -g @railway/cli
railway login
railway link ca4e5687-7c67-4a44-aef9-581ec085cc81
```

## **GitHub Secrets Configuration**

**Get information for GitHub Actions deployment:**

```bash
# Get authentication token
railway auth                    # -> RAILWAY_TOKEN

# List services and get IDs
railway services               # -> RAILWAY_SERVICE_ID (from ID column)

# Get service URLs
railway status                 # -> RAILWAY_FRONTEND_URL + RAILWAY_BACKEND_URL
```

**Service URLs from status:**

- Frontend: `https://frontend-production-c57a.up.railway.app`
- Backend: `https://backend-production-fd50.up.railway.app`
- Redis: Internal service (token blacklist & caching)

## **GitHub Secrets Reference**

| Secret Name            | Source Command     | Example Value                                     |
| ---------------------- | ------------------ | ------------------------------------------------- |
| `RAILWAY_TOKEN`        | `railway auth`     | `rlwy_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`    |
| `RAILWAY_SERVICE_ID`   | `railway services` | `abc123` (from ID column)                         |
| `RAILWAY_FRONTEND_URL` | `railway status`   | `https://frontend-production-c57a.up.railway.app` |
| `RAILWAY_BACKEND_URL`  | `railway status`   | `https://backend-production-fd50.up.railway.app`  |

**Validation:**

```bash
# Test connectivity
curl -f https://frontend-production-c57a.up.railway.app
curl -f https://backend-production-fd50.up.railway.app/health

# Optional: Test deployment
railway deploy --service=SERVICE_ID
```

## **Common Issues**

**"Not logged in"**

```bash
railway login  # Follow browser instructions
```

**"Project not found"**

```bash
railway list  # Check project access
railway link ca4e5687-7c67-4a44-aef9-581ec085cc81  # Reconnect
```

**"No services found"**

```bash
railway status  # Verify correct project
railway list    # Show all projects
```

## **Resources**

- **Project Dashboard**: https://railway.com/project/ca4e5687-7c67-4a44-aef9-581ec085cc81
- **Token Management**: https://railway.app/account/tokens
- **CLI Documentation**: https://docs.railway.app/develop/cli

## **Example Output**

```bash
$ railway services
┌─────────────────────────────────────────┬─────────┬──────────┐
│ Service                                 │ ID      │ Status   │
├─────────────────────────────────────────┼─────────┼──────────┤
│ backend-production-fd50                 │ abc123  │ Running  │
│ frontend-production-c57a                │ def456  │ Running  │
│ redis                                   │ ghi789  │ Running  │
└─────────────────────────────────────────┴─────────┴──────────┘

$ railway status
Services:
├── backend-production-fd50 (Running)
│   └── https://backend-production-fd50.up.railway.app
├── frontend-production-c57a (Running)
│   └── https://frontend-production-c57a.up.railway.app
├── redis (Running)
│   └── Internal service (no public URL)
└── database (Running)
    └── Internal PostgreSQL with SSL
```

**GitHub Secrets from output:**

- `RAILWAY_SERVICE_ID`: `abc123` (backend) or `def456` (frontend)
- `RAILWAY_FRONTEND_URL`: `https://frontend-production-c57a.up.railway.app`
- `RAILWAY_BACKEND_URL`: `https://backend-production-fd50.up.railway.app`
