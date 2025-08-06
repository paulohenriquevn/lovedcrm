# GitHub Secrets - Railway Deployment

**Configure GitHub Secrets** for automated Railway deployment via GitHub Actions.

> **Project**: `ca4e5687-7c67-4a44-aef9-581ec085cc81`  
> **Related**: [Railway CLI Commands](RAILWAY-CLI-QUICK-COMMANDS.md)

## **Prerequisites**

Railway project running • GitHub Actions workflow • Railway CLI • Deploy permissions

## **Required Secrets**

**Quick reference for GitHub Actions deployment:**

| Secret Name            | Source                                                            | Value                                             |
| ---------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| `RAILWAY_TOKEN`        | `railway auth` or [Dashboard](https://railway.app/account/tokens) | `rlwy_...`                                        |
| `RAILWAY_SERVICE_ID`   | `railway services`                                                | Service ID from output                            |
| `RAILWAY_FRONTEND_URL` | Fixed value                                                       | `https://frontend-production-c57a.up.railway.app` |
| `RAILWAY_BACKEND_URL`  | Fixed value                                                       | `https://backend-production-fd50.up.railway.app`  |

**Get values:**

```bash
railway link ca4e5687-7c67-4a44-aef9-581ec085cc81
railway auth        # -> RAILWAY_TOKEN
railway services    # -> RAILWAY_SERVICE_ID (ID column)
```

> **Full CLI Reference**: See [Railway CLI Commands](RAILWAY-CLI-QUICK-COMMANDS.md) for complete command reference

## **GitHub Configuration**

**Access Repository Settings**:
GitHub Repo -> Settings -> Secrets and variables -> Actions -> New repository secret

**Add each secret:**

```bash
# 1. RAILWAY_TOKEN
Name: RAILWAY_TOKEN
Value: [paste Railway token from commands above]

# 2. RAILWAY_SERVICE_ID
Name: RAILWAY_SERVICE_ID
Value: [service ID from railway services output]

# 3. Frontend URL
Name: RAILWAY_FRONTEND_URL
Value: https://frontend-production-c57a.up.railway.app

# 4. Backend URL
Name: RAILWAY_BACKEND_URL
Value: https://backend-production-fd50.up.railway.app
```

## **Validation**

**Local Test (Optional)**

```bash
export RAILWAY_TOKEN="your_token_here"
railway login --token $RAILWAY_TOKEN
railway services  # Verify connection
```

**GitHub Actions Test**

```bash
git add . && git commit -m "test: trigger deploy" && git push
# Monitor: GitHub -> Actions tab -> Check for auth errors
```

## **Troubleshooting**

| Error                 | Cause                         | Solution                                              |
| --------------------- | ----------------------------- | ----------------------------------------------------- |
| "Invalid token"       | Expired/invalid Railway token | Generate new token -> Update `RAILWAY_TOKEN`          |
| "Service not found"   | Wrong SERVICE_ID              | Run `railway services` -> Update `RAILWAY_SERVICE_ID` |
| "Health check failed" | Wrong URLs or services down   | Verify URLs -> Test `curl -f [URL]/health`            |
| "Permission denied"   | Token lacks permissions       | Recreate token with deploy permissions                |

## **Verification**

**Expected GitHub Secrets Display:**

```
Repository secrets:
├── RAILWAY_TOKEN ••••••••••••••••••••
├── RAILWAY_SERVICE_ID ••••••••••••••••••••
├── RAILWAY_FRONTEND_URL ••••••••••••••••••••
└── RAILWAY_BACKEND_URL ••••••••••••••••••••
```

**Deployment Checklist:**

1. Configure all 4 secrets
2. Push commit to trigger Actions
3. Monitor workflow logs
4. Verify deployment success

## **Resources**

- [Railway Tokens](https://railway.app/account/tokens) • [CLI Docs](https://docs.railway.app/develop/cli)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Project Dashboard](https://railway.com/project/ca4e5687-7c67-4a44-aef9-581ec085cc81)

---

**Security**: Never commit tokens directly. Always use GitHub Secrets.
