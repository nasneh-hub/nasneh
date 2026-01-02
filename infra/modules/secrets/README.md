# Secrets Module

AWS Secrets Manager module for Nasneh application secrets.

## Design Decision

We use **single JSON blob per category** instead of individual secrets because:

| Approach | Pros | Cons |
|----------|------|------|
| **JSON blob (chosen)** | Fewer API calls, easier rotation, lower cost ($0.40/secret/month), simpler IAM | All-or-nothing access per category |
| Individual secrets | Fine-grained access control | More API calls, higher cost, complex IAM |

## Secret Categories

| Secret | Path | Contents |
|--------|------|----------|
| API | `nasneh/{env}/api` | JWT_SECRET, JWT_REFRESH_SECRET, OTP_SECRET, REDIS_URL |
| Database | `nasneh/{env}/database` | DB_USERNAME, DB_PASSWORD, DATABASE_URL |
| External | `nasneh/{env}/external` | WHATSAPP_API_URL, WHATSAPP_API_TOKEN, SMS_API_URL, SMS_API_KEY |

## Usage

```hcl
module "secrets" {
  source = "../../modules/secrets"

  name_prefix             = "nasneh-staging"
  environment             = "staging"
  recovery_window_in_days = 7
  tags                    = local.common_tags
}
```

## ECS Integration

Secrets are injected into ECS tasks using the `secrets` block:

```hcl
secrets = [
  {
    name      = "JWT_SECRET"
    valueFrom = "${module.secrets.api_secret_arn}:JWT_SECRET::"
  },
  {
    name      = "DATABASE_URL"
    valueFrom = "${module.secrets.database_secret_arn}:DATABASE_URL::"
  }
]
```

## Initial Setup (Required Before Deploy)

After `terraform apply`, update secrets via AWS CLI:

```bash
# API secrets
aws secretsmanager put-secret-value \
  --secret-id nasneh-staging/api \
  --secret-string '{
    "JWT_SECRET": "your-secure-jwt-secret-min-32-chars",
    "JWT_REFRESH_SECRET": "your-secure-refresh-secret-min-32-chars",
    "OTP_SECRET": "your-secure-otp-secret-min-32-chars",
    "REDIS_URL": "redis://your-redis-host:6379"
  }' \
  --region me-south-1

# Database secrets
aws secretsmanager put-secret-value \
  --secret-id nasneh-staging/database \
  --secret-string '{
    "DB_USERNAME": "nasneh_app",
    "DB_PASSWORD": "your-secure-db-password",
    "DATABASE_URL": "postgresql://nasneh_app:password@rds-endpoint:5432/nasneh"
  }' \
  --region me-south-1

# External service secrets
aws secretsmanager put-secret-value \
  --secret-id nasneh-staging/external \
  --secret-string '{
    "WHATSAPP_API_URL": "https://api.whatsapp.com/...",
    "WHATSAPP_API_TOKEN": "your-whatsapp-token",
    "SMS_API_URL": "https://api.sms.com/...",
    "SMS_API_KEY": "your-sms-api-key"
  }' \
  --region me-south-1
```

## Secret Rotation

### Manual Rotation

```bash
# Update specific secret
aws secretsmanager put-secret-value \
  --secret-id nasneh-staging/api \
  --secret-string '{"JWT_SECRET": "new-value", ...}' \
  --region me-south-1

# Force ECS to pull new secrets
aws ecs update-service \
  --cluster nasneh-staging-cluster \
  --service nasneh-staging-api \
  --force-new-deployment \
  --region me-south-1
```

### Automatic Rotation (Future)

AWS Secrets Manager supports automatic rotation with Lambda functions.
This can be implemented for database credentials in the future.

## Cost Estimate

| Resource | Monthly Cost |
|----------|--------------|
| 3 secrets × $0.40 | ~$1.20 |
| API calls (estimated) | ~$0.05 |
| **Total** | **~$1.25** |

## Outputs

| Output | Description |
|--------|-------------|
| `api_secret_arn` | ARN for API secrets |
| `database_secret_arn` | ARN for database secrets |
| `external_secret_arn` | ARN for external service secrets |
| `secrets_read_policy_arn` | IAM policy ARN for ECS task role |
