# Nasneh - Runbook

> دليل التشغيل والنشر للمطورين

---

## 📋 جدول المحتويات

1. [المتطلبات](#المتطلبات)
2. [التشغيل المحلي](#التشغيل-المحلي)
3. [البيئات](#البيئات)
4. [النشر (Deployment)](#النشر-deployment)
5. [إدارة Secrets](#إدارة-secrets)
6. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## المتطلبات

### البرامج المطلوبة

| برنامج | الإصدار | التثبيت |
|--------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `npm install -g pnpm` |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org) |
| Redis | 7+ | [redis.io](https://redis.io) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

### التحقق من التثبيت

```bash
node --version    # v20.x.x
pnpm --version    # 8.x.x
psql --version    # 15.x
redis-cli --version
```

---

## التشغيل المحلي

### 1. Clone & Install

```bash
# Clone
git clone https://github.com/nasneh-hub/nasneh.git
cd nasneh

# Install dependencies
pnpm install
```

### 2. إعداد Environment

```bash
# نسخ ملفات البيئة
cp apps/customer-web/.env.example apps/customer-web/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/api/.env.example apps/api/.env.local

# عدّل القيم في كل ملف .env.local
```

### 3. إعداد Database

```bash
# إنشاء قاعدة البيانات
createdb nasneh_dev

# تشغيل migrations (بعد إعداد Prisma)
cd apps/api
pnpm db:migrate
pnpm db:seed  # بيانات تجريبية
```

### 4. تشغيل التطبيقات

```bash
# تشغيل كل التطبيقات
pnpm dev

# أو تشغيل تطبيق محدد
pnpm dev --filter=customer-web
pnpm dev --filter=dashboard
pnpm dev --filter=api
```

### 5. الوصول

| التطبيق | URL |
|---------|-----|
| Customer Web | http://localhost:3000 |
| Dashboard | http://localhost:3001 |
| API | http://localhost:4000 |
| API Docs | http://localhost:4000/docs |

---

## البيئات

### Environment Overview

| البيئة | الغرض | Branch | URL |
|--------|-------|--------|-----|
| **Development** | التطوير المحلي | أي branch | localhost |
| **Staging** | الاختبار قبل Production | `develop` | staging.nasneh.com |
| **Production** | الإنتاج | `main` | nasneh.com |

### Environment Variables per Environment

```
Development → .env.local (local machine)
Staging     → AWS Secrets Manager (staging/)
Production  → AWS Secrets Manager (production/)
```

---

## النشر (Deployment)

### Staging Deployment

```bash
# 1. Push to develop branch
git checkout develop
git merge feature/your-feature
git push origin develop

# 2. CI/CD يشتغل تلقائياً
# 3. بعد نجاح CI، ينشر على Staging
# 4. تحقق من Staging
open https://staging.nasneh.com
```

### Production Deployment

```bash
# 1. Create PR from develop → main
# 2. Get approval (1 reviewer minimum)
# 3. Merge PR
# 4. CI/CD ينشر تلقائياً على Production
# 5. تحقق من Production
open https://nasneh.com
```

### Manual Deployment (Emergency Only)

```bash
# ⚠️ استخدم فقط في الطوارئ

# SSH to server
ssh deploy@nasneh-server

# Pull latest
cd /var/www/nasneh
git pull origin main

# Install & Build
pnpm install
pnpm build

# Restart services
pm2 restart all
```

---

## إدارة Secrets

### ⚠️ قواعد صارمة

1. **❌ ممنوع** رفع أي مفاتيح أو secrets في الكود
2. **❌ ممنوع** مشاركة secrets في Slack/Email/Chat
3. **✅ فقط** استخدم AWS Secrets Manager للـ Production
4. **✅ فقط** استخدم `.env.local` للتطوير المحلي

### أين توضع Secrets

| البيئة | المكان |
|--------|--------|
| Local | `.env.local` (لا يُرفع على Git) |
| Staging | AWS Secrets Manager → `nasneh/staging/*` |
| Production | AWS Secrets Manager → `nasneh/production/*` |

### إضافة Secret جديد

```bash
# 1. أضفه في .env.example (بدون قيمة حقيقية)
echo "NEW_SECRET=" >> apps/api/.env.example

# 2. أضف القيمة في .env.local محلياً
echo "NEW_SECRET=actual-value" >> apps/api/.env.local

# 3. أضفه في AWS Secrets Manager للـ Staging/Production
aws secretsmanager put-secret-value \
  --secret-id nasneh/production/api \
  --secret-string '{"NEW_SECRET":"production-value"}'
```

### الوصول لـ Secrets (للمطورين)

```bash
# عرض secrets (يحتاج صلاحية)
aws secretsmanager get-secret-value \
  --secret-id nasneh/staging/api \
  --query SecretString \
  --output text | jq .
```

---

## استكشاف الأخطاء

### مشاكل شائعة

#### 1. pnpm install فشل

```bash
# امسح cache وحاول مرة ثانية
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### 2. Database connection failed

```bash
# تأكد PostgreSQL شغال
pg_isready

# تأكد من DATABASE_URL
echo $DATABASE_URL

# اختبر الاتصال
psql $DATABASE_URL -c "SELECT 1"
```

#### 3. Redis connection failed

```bash
# تأكد Redis شغال
redis-cli ping  # Should return PONG

# إعادة تشغيل Redis
brew services restart redis  # macOS
sudo systemctl restart redis  # Linux
```

#### 4. Port already in use

```bash
# اعرف من يستخدم الـ port
lsof -i :3000

# اقتل العملية
kill -9 <PID>
```

#### 5. TypeScript errors

```bash
# أعد بناء types
pnpm clean
pnpm install
pnpm typecheck
```

#### 6. Prisma errors

```bash
# أعد توليد client
cd apps/api
pnpm db:generate

# أعد تشغيل migrations
pnpm db:migrate
```

---

## الأوامر المفيدة

### Development

```bash
pnpm dev              # تشغيل كل التطبيقات
pnpm build            # بناء كل التطبيقات
pnpm lint             # فحص الكود
pnpm typecheck        # فحص TypeScript
pnpm format           # تنسيق الكود
pnpm clean            # مسح cache و build
```

### Database

```bash
pnpm db:generate      # توليد Prisma client
pnpm db:migrate       # تشغيل migrations
pnpm db:push          # Push schema changes
pnpm db:seed          # إضافة بيانات تجريبية
```

### Git

```bash
git checkout -b feature/new-feature   # إنشاء branch جديد
git push origin feature/new-feature   # رفع الـ branch
gh pr create                          # إنشاء Pull Request
```

---

## الدعم

- **Documentation:** `/docs/`
- **Issues:** https://github.com/nasneh-hub/nasneh/issues
- **Discussions:** https://github.com/nasneh-hub/nasneh/discussions

---

**Document End**


---

## CI/CD Pipeline (GitHub Actions)

### Overview

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `.github/workflows/ci.yml` | PR to main, push to main | Lint, typecheck, test, build |
| CD | `.github/workflows/cd.yml` | Push to main (api changes) | Build Docker image, push to ECR |

### CI Pipeline

```
┌─────────┐     ┌───────────┐     ┌──────┐     ┌───────┐
│  Lint   │────►│ Typecheck │────►│ Test │────►│ Build │
└─────────┘     └───────────┘     └──────┘     └───────┘
     │               │               │              │
     └───────────────┴───────────────┴──────────────┘
                           │
                    All run in parallel
                    Build waits for all
```

### CD Pipeline

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Build Docker   │────►│  Push to ECR    │────►│  Deploy to ECS  │
│     Image       │     │  (auto)         │     │  (manual only)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Running CI Locally

```bash
# Run all CI checks
pnpm lint && pnpm typecheck && pnpm test && pnpm build

# Run individual checks
pnpm lint       # Lint check
pnpm typecheck  # Type check
pnpm test       # Run tests
pnpm build      # Build project
```

### Building Docker Image Locally

```bash
# Build image
docker build -t nasneh-api:local -f apps/api/Dockerfile .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  nasneh-api:local

# Test health endpoint
curl http://localhost:3000/health
```

### GitHub Secrets Configuration

Configure in GitHub → Settings → Secrets and variables → Actions:

| Secret | Description | Example |
|--------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJal...` |
| `AWS_REGION` | AWS region | `me-south-1` |

### Setting Secrets via CLI

```bash
gh secret set AWS_ACCESS_KEY_ID --body "AKIA..."
gh secret set AWS_SECRET_ACCESS_KEY --body "wJal..."
gh secret set AWS_REGION --body "me-south-1"
```

### Manual Deploy to ECS

Deploy is **not automatic**. To deploy after image is pushed:

1. Go to GitHub Actions → CD workflow
2. Click "Run workflow"
3. Select `deploy: true`
4. Click "Run workflow"

Or via CLI:

```bash
gh workflow run cd.yml -f deploy=true
```

### Image Tag Strategy

| Tag | Description |
|-----|-------------|
| `<commit-sha>` | Short SHA of the commit |
| `staging-latest` | Latest image for staging |
| `<YYYYMMDD-HHmmss>` | Timestamp for traceability |

### IAM Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": [
        "arn:aws:ecs:me-south-1:*:service/nasneh-staging-cluster/*"
      ]
    }
  ]
}
```

---

**CI/CD Section End**


---

## AWS Secrets Manager (Staging)

### Secret Structure

| Secret | Path | Contents |
|--------|------|----------|
| API | `nasneh-staging/api` | JWT_SECRET, JWT_REFRESH_SECRET, OTP_SECRET, REDIS_URL |
| Database | `nasneh-staging/database` | DB_USERNAME, DB_PASSWORD, DATABASE_URL |
| External | `nasneh-staging/external` | WHATSAPP_API_URL, WHATSAPP_API_TOKEN, SMS_API_URL, SMS_API_KEY |

### Initial Setup (Required Before First Deploy)

After running `terraform apply` for staging, update secrets with real values:

```bash
# 1. API Application Secrets
aws secretsmanager put-secret-value \
  --secret-id nasneh-staging/api \
  --secret-string '{
    "JWT_SECRET": "your-secure-jwt-secret-min-32-chars-here",
    "JWT_REFRESH_SECRET": "your-secure-refresh-secret-min-32-chars",
    "OTP_SECRET": "your-secure-otp-secret-min-32-chars-here",
    "REDIS_URL": "redis://your-redis-endpoint:6379"
  }' \
  --region me-south-1

# 2. Database Credentials
aws secretsmanager put-secret-value \
  --secret-id nasneh-staging/database \
  --secret-string '{
    "DB_USERNAME": "nasneh_app",
    "DB_PASSWORD": "your-secure-db-password",
    "DATABASE_URL": "postgresql://nasneh_app:password@your-rds-endpoint:5432/nasneh"
  }' \
  --region me-south-1

# 3. External Service Keys
aws secretsmanager put-secret-value \
  --secret-id nasneh-staging/external \
  --secret-string '{
    "WHATSAPP_API_URL": "https://api.whatsapp.com/...",
    "WHATSAPP_API_TOKEN": "your-whatsapp-api-token",
    "SMS_API_URL": "https://api.sms.com/...",
    "SMS_API_KEY": "your-sms-api-key"
  }' \
  --region me-south-1
```

### Viewing Secrets

```bash
# View API secrets
aws secretsmanager get-secret-value \
  --secret-id nasneh-staging/api \
  --query SecretString \
  --output text \
  --region me-south-1 | jq .

# View database secrets
aws secretsmanager get-secret-value \
  --secret-id nasneh-staging/database \
  --query SecretString \
  --output text \
  --region me-south-1 | jq .

# View external secrets
aws secretsmanager get-secret-value \
  --secret-id nasneh-staging/external \
  --query SecretString \
  --output text \
  --region me-south-1 | jq .
```

### Rotating Secrets

```bash
# 1. Update the secret value
aws secretsmanager put-secret-value \
  --secret-id nasneh-staging/api \
  --secret-string '{"JWT_SECRET": "new-value-here", ...}' \
  --region me-south-1

# 2. Force ECS to pull new secrets (triggers new deployment)
aws ecs update-service \
  --cluster nasneh-staging-cluster \
  --service nasneh-staging-api \
  --force-new-deployment \
  --region me-south-1

# 3. Monitor deployment
aws ecs describe-services \
  --cluster nasneh-staging-cluster \
  --services nasneh-staging-api \
  --query 'services[0].deployments' \
  --region me-south-1
```

### Secrets Ready Checklist

Before deploying to staging, verify:

- [ ] `nasneh-staging/api` secret has real JWT_SECRET (min 32 chars)
- [ ] `nasneh-staging/api` secret has real JWT_REFRESH_SECRET (min 32 chars)
- [ ] `nasneh-staging/api` secret has real OTP_SECRET (min 32 chars)
- [ ] `nasneh-staging/api` secret has valid REDIS_URL
- [ ] `nasneh-staging/database` secret has DB_USERNAME
- [ ] `nasneh-staging/database` secret has DB_PASSWORD
- [ ] `nasneh-staging/database` secret has valid DATABASE_URL pointing to RDS
- [ ] `nasneh-staging/external` secret has WhatsApp credentials (or mock values)
- [ ] `nasneh-staging/external` secret has SMS credentials (or mock values)

### Troubleshooting Secrets

#### ECS task fails to start with "secret not found"

```bash
# Check if secret exists
aws secretsmanager describe-secret \
  --secret-id nasneh-staging/api \
  --region me-south-1

# Check IAM permissions
aws iam get-role-policy \
  --role-name nasneh-staging-ecs-task-execution \
  --policy-name nasneh-staging-ecs-secrets-policy
```

#### ECS task starts but app crashes with "invalid secret"

```bash
# Verify secret format (must be valid JSON)
aws secretsmanager get-secret-value \
  --secret-id nasneh-staging/api \
  --query SecretString \
  --output text \
  --region me-south-1 | jq .

# Check for required keys
aws secretsmanager get-secret-value \
  --secret-id nasneh-staging/api \
  --query SecretString \
  --output text \
  --region me-south-1 | jq 'keys'
```

---

**Secrets Management Section End**


---

## Monitoring + Alerts (CloudWatch)

### Overview

| Resource | Description |
|----------|-------------|
| SNS Topic | `nasneh-staging-alerts` |
| Alarms | CPU, Memory, 5XX Errors, Running Tasks |
| Dashboard | `nasneh-staging-overview` |
| Log Retention | 14 days (staging) |

### Configuring Alert Email

```bash
# Set via environment variable
export TF_VAR_alert_email="alerts@nasneh.com"

# Or add to terraform.tfvars
echo 'alert_email = "alerts@nasneh.com"' >> terraform.tfvars

# Apply changes
terraform apply
```

**Important:** After apply, check your email and confirm the SNS subscription.

### Viewing Alarms

```bash
# List all alarms
aws cloudwatch describe-alarms \
  --alarm-name-prefix nasneh-staging \
  --region me-south-1

# Get alarm state
aws cloudwatch describe-alarms \
  --alarm-names nasneh-staging-ecs-cpu-high \
  --query 'MetricAlarms[0].StateValue' \
  --output text \
  --region me-south-1
```

### Viewing Dashboard

Access the CloudWatch dashboard:

```
https://me-south-1.console.aws.amazon.com/cloudwatch/home?region=me-south-1#dashboards:name=nasneh-staging-overview
```

### Viewing Logs

```bash
# View recent logs
aws logs tail /ecs/nasneh-staging-api --follow --region me-south-1

# Search logs for errors
aws logs filter-log-events \
  --log-group-name /ecs/nasneh-staging-api \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s000) \
  --region me-south-1
```

### Alarm Response Playbook

#### ECS CPU High (> 80%)

```bash
# 1. Check current CPU usage
aws ecs describe-services \
  --cluster nasneh-staging-cluster \
  --services nasneh-staging-api \
  --query 'services[0].deployments[0]' \
  --region me-south-1

# 2. Check logs for CPU-intensive operations
aws logs tail /ecs/nasneh-staging-api --since 30m --region me-south-1

# 3. If persistent, scale up CPU
# Update container_cpu in staging main.tf and apply
```

#### ECS Memory High (> 80%)

```bash
# 1. Check for memory leaks
aws logs filter-log-events \
  --log-group-name /ecs/nasneh-staging-api \
  --filter-pattern "heap" \
  --region me-south-1

# 2. Check container metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ClusterName,Value=nasneh-staging-cluster Name=ServiceName,Value=nasneh-staging-api \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 300 \
  --statistics Average \
  --region me-south-1
```

#### ALB 5XX Errors

```bash
# 1. Check application logs
aws logs filter-log-events \
  --log-group-name /ecs/nasneh-staging-api \
  --filter-pattern "ERROR" \
  --start-time $(date -d '30 minutes ago' +%s000) \
  --region me-south-1

# 2. Check ECS task health
aws ecs describe-services \
  --cluster nasneh-staging-cluster \
  --services nasneh-staging-api \
  --query 'services[0].events[:5]' \
  --region me-south-1

# 3. Check database connectivity
aws rds describe-db-instances \
  --db-instance-identifier nasneh-staging-postgres \
  --query 'DBInstances[0].DBInstanceStatus' \
  --region me-south-1
```

#### Running Tasks Low

```bash
# 1. Check service events
aws ecs describe-services \
  --cluster nasneh-staging-cluster \
  --services nasneh-staging-api \
  --query 'services[0].events[:10]' \
  --region me-south-1

# 2. Check stopped tasks
aws ecs list-tasks \
  --cluster nasneh-staging-cluster \
  --desired-status STOPPED \
  --region me-south-1

# 3. Force new deployment
aws ecs update-service \
  --cluster nasneh-staging-cluster \
  --service nasneh-staging-api \
  --force-new-deployment \
  --region me-south-1
```

### Disabling Alarms (Maintenance)

```bash
# Disable alarms during maintenance
aws cloudwatch disable-alarm-actions \
  --alarm-names nasneh-staging-ecs-cpu-high nasneh-staging-ecs-memory-high \
  --region me-south-1

# Re-enable after maintenance
aws cloudwatch enable-alarm-actions \
  --alarm-names nasneh-staging-ecs-cpu-high nasneh-staging-ecs-memory-high \
  --region me-south-1
```

---

**Monitoring Section End**


---

## Domain Configuration (Production)

### Domain Overview

| Domain | Purpose | Status |
|--------|---------|--------|
| `nasneh.com` | Production root domain | Planned |
| `nasneh.com` | Customer web app | Planned |
| `dashboard.nasneh.com` | Admin dashboard | Planned |
| `api.nasneh.com` | API endpoint | Planned |
| `staging.nasneh.com` | Staging environment | Active (ALB DNS) |

### Current Staging Endpoints

| Service | Endpoint |
|---------|----------|
| API (ALB) | http://nasneh-staging-api-alb-1514033867.me-south-1.elb.amazonaws.com |
| CDN (CloudFront) | https://dmuz0tskgwik1.cloudfront.net |

### Production DNS Setup (Future)

When ready for production:

1. **Register/Transfer domain** to Route 53 (or use existing registrar)
2. **Create ACM certificates** in us-east-1 (for CloudFront) and me-south-1 (for ALB)
3. **Configure Route 53 hosted zone** with:
   - A record for `nasneh.com` → CloudFront distribution
   - A record for `api.nasneh.com` → ALB
   - A record for `dashboard.nasneh.com` → CloudFront distribution
4. **Update Terraform** with custom domain configuration

### ACM Certificate Request (Example)

```bash
# Request certificate for production (me-south-1)
aws acm request-certificate \
  --domain-name nasneh.com \
  --subject-alternative-names "*.nasneh.com" \
  --validation-method DNS \
  --region me-south-1

# Request certificate for CloudFront (must be us-east-1)
aws acm request-certificate \
  --domain-name nasneh.com \
  --subject-alternative-names "*.nasneh.com" \
  --validation-method DNS \
  --region us-east-1
```

---

## Terraform State Management

### Current State

- **Location:** Local (`terraform.tfstate`)
- **Backend:** Not configured (S3 backend commented out)

### Recommended: Remote State Backend

For team collaboration and state safety, migrate to S3 + DynamoDB:

#### 1. Create Backend Resources

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket nasneh-terraform-state \
  --region me-south-1 \
  --create-bucket-configuration LocationConstraint=me-south-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket nasneh-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket nasneh-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
  }'

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name nasneh-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region me-south-1
```

#### 2. Migrate State (Safe Steps)

```bash
cd infra/environments/staging

# 1. Backup current state
cp terraform.tfstate terraform.tfstate.backup

# 2. Uncomment backend block in main.tf
# backend "s3" {
#   bucket         = "nasneh-terraform-state"
#   key            = "staging/terraform.tfstate"
#   region         = "me-south-1"
#   encrypt        = true
#   dynamodb_table = "nasneh-terraform-locks"
# }

# 3. Initialize with migration
terraform init -migrate-state

# 4. Verify state
terraform state list

# 5. Test with plan (should show no changes)
terraform plan
```

#### 3. Verify Migration

```bash
# Check S3 for state file
aws s3 ls s3://nasneh-terraform-state/staging/

# Check DynamoDB for lock table
aws dynamodb describe-table --table-name nasneh-terraform-locks
```

---

## Next Steps Checklist

### Immediate (Before First Real Deploy)

- [ ] **Confirm SNS subscription** - Check email and click confirm link
- [ ] **Update secrets** in AWS Secrets Manager with real values
- [ ] **Deploy real app image** via CD workflow (workflow_dispatch)
- [ ] **Verify health checks** pass after deployment

### Short-term (Sprint 3)

- [ ] **Migrate Terraform state** to S3 + DynamoDB backend
- [ ] **Add Redis/ElastiCache** module for session/cache
- [ ] **Configure custom domain** with ACM + Route 53
- [ ] **Enable HTTPS** on ALB with ACM certificate

### Pre-Production

- [ ] **Create production environment** (separate Terraform workspace)
- [ ] **Enable Multi-AZ** for RDS and NAT Gateway
- [ ] **Configure WAF** for ALB protection
- [ ] **Set up backup/restore** procedures
- [ ] **Load testing** and capacity planning

---

**Next Steps Section End**


---

## Incident Log

### Incident: Staging ECS Deployment Failing (Jan 2026)

**Date:** January 2, 2026

#### Symptoms

1. CD workflow fails at "Wait for service stability" (10 minute timeout)
2. ALB Target Group shows targets as `unhealthy`
3. ECS tasks keep getting replaced in a crash loop
4. CloudWatch logs show: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express'`

#### Root Causes

| Issue | Description |
|-------|-------------|
| **Wrong ECS service name** | cd.yml used `nasneh-staging-api-service` but Terraform created `nasneh-staging-api` |
| **Wrong Docker image** | Task definition pointed to `amazon/amazon-ecs-sample` instead of actual API image |
| **Missing secrets** | Task definition expected keys not present in AWS Secrets Manager |
| **Missing curl** | ECS health check used `curl` but
 `node:20-alpine` doesn't include curl |
| **Dockerfile pnpm issue** | `pnpm prune --prod` broke symlinks, causing missing dependencies at runtime |
| **Postinstall failure** | `pnpm install --prod` triggered `prisma generate` postinstall, but `prisma` CLI is a devDependency |

#### Fixes Applied

**1. CD Workflow (cd.yml):**
- Fixed `ECS_SERVICE` env var: `nasneh-staging-api-service` → `nasneh-staging-api`
- Added task definition update step (downloads current, updates image, registers new revision)
- Added "Diagnostics on failure" step for debugging

**2. AWS Secrets Manager:**
```bash
# Added missing keys:
nasneh-staging/api:      + REDIS_URL
nasneh-staging/database: + DB_USERNAME, DB_PASSWORD
nasneh-staging/external: + SMS_API_URL, SMS_API_KEY
```

**3. Dockerfile (Final Solution):**

The Dockerfile uses a 3-stage build to properly handle pnpm monorepo + Prisma:

```dockerfile
# Stage 1: deps - Production dependencies only
FROM node:20-alpine AS deps
# Install prod deps, skip postinstall scripts (prisma CLI is devDep)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Stage 2: builder - Full dev dependencies + build
FROM node:20-alpine AS builder
# Full install (includes prisma CLI)
RUN pnpm install --frozen-lockfile
# Generate Prisma client
RUN pnpm --filter @nasneh/api exec prisma generate
# Build API
RUN pnpm --filter @nasneh/api build

# Stage 3: production - Minimal runtime image
FROM node:20-alpine AS production
# Copy prod node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
# Copy Prisma client artifacts from builder (generated files)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
# Copy built dist from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
```

**Key insight:** Prisma client is *generated* at build time and must be copied from the builder stage, not installed via `pnpm install --prod`.

#### Prevention

1. **Secrets Checklist:** Before first deploy, verify all required secrets exist in AWS Secrets Manager
2. **Dockerfile Testing:** Test Docker build locally before pushing: `docker build -t test -f apps/api/Dockerfile .`
3. **Health Check Dependency:** Container must include `curl` (or change to `wget`/node-based check)
4. **CI Guard (Future):** Add startup check to fail fast if required env vars are missing

---

**Incident Log Section End**
