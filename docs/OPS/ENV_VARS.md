# Environment Variables Documentation

> **Last Updated:** 2026-01-08  
> **Sprint:** 0.4.5

This document defines all environment variables used across Nasneh applications.

---

## Overview

| App | Config File | Environments |
|-----|-------------|--------------|
| customer-web | `.env.local` | development, staging, production |
| dashboard | `.env.local` | development, staging, production |
| api | `.env` | development, staging, production |

---

## Frontend Apps (customer-web & dashboard)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api-staging.nasneh.com/api/v1` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_APP_URL` | App URL (dashboard only) | - | `https://staging-dashboard.nasneh.com` |
| `NEXT_PUBLIC_APP_ENV` | Environment identifier | `development` | `staging` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `false` | `true` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking | - | `https://xxx@sentry.io/xxx` |

---

## Environment-Specific Values

### Development (localhost)

```bash
# customer-web
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_ENV=development

# dashboard
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

### Staging (AWS Amplify)

```bash
# customer-web
NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com/api/v1
NEXT_PUBLIC_APP_ENV=staging

# dashboard
NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com/api/v1
NEXT_PUBLIC_APP_URL=https://staging-dashboard.nasneh.com
NEXT_PUBLIC_APP_ENV=staging
```

### Production (AWS Amplify)

```bash
# customer-web
NEXT_PUBLIC_API_URL=https://api.nasneh.com/api/v1
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# dashboard
NEXT_PUBLIC_API_URL=https://api.nasneh.com/api/v1
NEXT_PUBLIC_APP_URL=https://dashboard.nasneh.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## API Backend

### CORS Configuration

The API uses these environment variables for CORS:

| Variable | Description | Staging Value |
|----------|-------------|---------------|
| `FRONTEND_URL` | customer-web URL | `https://staging.nasneh.com` |
| `DASHBOARD_URL` | dashboard URL | `https://staging-dashboard.nasneh.com` |

**Important:** These must match the actual frontend URLs for CORS to work correctly.

### ECS Task Definition Updates

When deploying to staging, update the ECS task definition with:

```json
{
  "name": "FRONTEND_URL",
  "value": "https://staging.nasneh.com"
},
{
  "name": "DASHBOARD_URL",
  "value": "https://staging-dashboard.nasneh.com"
}
```

---

## AWS Amplify Configuration

Environment variables are set in Amplify Console or via Terraform:

### customer-web (develop branch)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api-staging.nasneh.com/api/v1` |
| `NEXT_PUBLIC_APP_ENV` | `staging` |

### dashboard (develop branch)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api-staging.nasneh.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://staging-dashboard.nasneh.com` |
| `NEXT_PUBLIC_APP_ENV` | `staging` |

---

## Security Notes

1. **Never commit** `.env.local` files to Git
2. **Use `.env.example`** as a template (safe to commit)
3. **Secrets** should be stored in AWS Secrets Manager
4. **NEXT_PUBLIC_** prefix means the variable is exposed to the browser

---

## Validation Checklist

Before deployment, verify:

- [ ] `NEXT_PUBLIC_API_URL` points to correct API
- [ ] `FRONTEND_URL` and `DASHBOARD_URL` in API match frontend URLs
- [ ] CORS is working (no Mixed Content errors)
- [ ] All required variables are set in Amplify Console
