# DevOps Gate (Sprint 2.5)

This document outlines the approach and structure for Infrastructure-as-Code (IaC) and CI/CD for the Nasneh project.

---

## 1. IaC Approach: Terraform

**Decision:** Terraform was chosen as the IaC tool for the following reasons:

- **No Existing IaC:** The repository had no prior IaC implementation.
- **Industry Standard:** Terraform is a mature, widely adopted tool for managing infrastructure on AWS.
- **Declarative:** Its declarative syntax makes infrastructure definitions readable and maintainable.
- **Strong Community:** Large community and extensive documentation provide excellent support.
- **AWS Provider:** The HashiCorp AWS provider is well-maintained and covers the full range of AWS services.

**Alternative Considered:** AWS CDK was considered but not chosen to avoid introducing another language/toolchain (TypeScript for infrastructure) and to keep a clear separation between application code and infrastructure code.

---

## 2. Folder Structure

The IaC code is located in the `/infra` directory with the following structure:

```
/infra
├── environments/         # Environment-specific configurations
│   ├── staging/          # Staging environment
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── locals.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars.example
│   └── production/       # (Planned) Production environment
│
├── modules/              # Reusable infrastructure modules
│   ├── networking/       # ✅ Implemented (PR #71)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── security_groups.tf
│   │   └── README.md
│   ├── database/         # ✅ Implemented (PR #73)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── compute/          # ✅ Implemented (PR #74)
│   │   ├── alb.tf
│   │   ├── ecs.tf
│   │   ├── ecr.tf
│   │   ├── iam.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── storage/          # ✅ Implemented (PR #75)
│   │   ├── main.tf
│   │   ├── cloudfront.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   └── secrets/          # 🔜 Planned
│
├── versions.tf           # Terraform & provider version constraints
├── variables.tf          # Root variables
├── outputs.tf            # Root outputs
├── locals.tf             # Root local values
└── .gitignore            # Terraform gitignore
```

### Key Components:

- **`environments/`**: Each sub-directory represents a distinct environment (e.g., `staging`, `production`). It contains the main configuration, variables, and state management for that environment. This allows for clear separation and independent management of environments.

- **`modules/`**: Contains reusable modules for different parts of the infrastructure (e.g., networking, compute). This promotes code reuse and maintainability.

- **Root Files (`versions.tf`, `variables.tf`, etc.)**: Define common configurations and constraints that apply across all environments.

---

## 3. Staging Environment

The `staging` environment is the first to be implemented. It serves as a template for the production environment but with cost-effective resource configurations.

### Key Characteristics:

- **Region:** `me-south-1` (AWS Bahrain)
- **State Management:** Local state initially, with S3 backend configuration for remote state management (configured as sub-step when deploying).
- **Resource Sizing:** Uses smaller instance types (e.g., `t3.small`, `db.t3.micro`) to minimize costs.
- **Deletion Protection:** Disabled by default to allow for easy teardown and recreation.

### How to Deploy Staging:

```bash
# 1. Navigate to the staging environment directory
cd infra/environments/staging

# 2. Create terraform.tfvars from the example
cp terraform.tfvars.example terraform.tfvars

# 3. Edit terraform.tfvars with actual values (especially DB credentials)
# IMPORTANT: Never commit terraform.tfvars to version control

# 4. Initialize Terraform
terraform init

# 5. Plan the deployment
terraform plan

# 6. Apply the changes
terraform apply
```

---

## 4. Networking Module

The networking module (`/infra/modules/networking`) creates the foundational network infrastructure.

### Resources Created

| Resource | Description | Staging Config |
|----------|-------------|----------------|
| VPC | Main VPC with DNS support | 10.0.0.0/16 |
| Public Subnets | 2 subnets for ALB | 10.0.1.0/24, 10.0.2.0/24 |
| Private Subnets | 2 subnets for API, DB | 10.0.10.0/24, 10.0.11.0/24 |
| Internet Gateway | Public internet access | 1 |
| NAT Gateway | Private subnet egress | 1 (single for staging) |
| Route Tables | Public and private routing | 2 |

### Availability Zones

AWS Bahrain (me-south-1) has 3 AZs available:
- `me-south-1a` ✅ Used
- `me-south-1b` ✅ Used
- `me-south-1c` (available for production HA)

### Security Groups

| Security Group | Inbound Rules | Purpose |
|----------------|---------------|---------|
| ALB | HTTP (80), HTTPS (443) from 0.0.0.0/0 | Application Load Balancer |
| API | Port 3000 from ALB SG | ECS Fargate containers |
| Database | Port 5432 from API SG | RDS PostgreSQL |

### Architecture Diagram

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                      VPC (10.0.0.0/16)                  │
                    │                                                         │
    Internet ───────┼──► Internet Gateway                                     │
                    │         │                                               │
                    │    ┌────┴────────────────────────────────────┐          │
                    │    │           Public Subnets                │          │
                    │    │  ┌─────────────┐    ┌─────────────┐     │          │
                    │    │  │ 10.0.1.0/24 │    │ 10.0.2.0/24 │     │          │
                    │    │  │ me-south-1a │    │ me-south-1b │     │          │
                    │    │  │   [ALB]     │    │   [ALB]     │     │          │
                    │    │  │   [NAT]     │    │             │     │          │
                    │    │  └─────────────┘    └─────────────┘     │          │
                    │    └────────────────────────────────────────┘          │
                    │              │                                          │
                    │              ▼ NAT Gateway                              │
                    │    ┌────────────────────────────────────────┐          │
                    │    │          Private Subnets               │          │
                    │    │  ┌─────────────┐    ┌─────────────┐    │          │
                    │    │  │10.0.10.0/24 │    │10.0.11.0/24 │    │          │
                    │    │  │ me-south-1a │    │ me-south-1b │    │          │
                    │    │  │  [API/ECS]  │    │  [API/ECS]  │    │          │
                    │    │  │  [RDS]      │    │             │    │          │
                    │    │  └─────────────┘    └─────────────┘    │          │
                    │    └────────────────────────────────────────┘          │
                    └─────────────────────────────────────────────────────────┘
```

### Cost Estimate (Staging)

| Resource | Monthly Cost |
|----------|--------------|
| NAT Gateway | ~$32 |
| Elastic IP | ~$3.65 |
| **Total** | **~$36** |

> **Note:** NAT Gateway is required for ECS Fargate tasks in private subnets to pull container images and access AWS services (Secrets Manager, ECR, etc.).

---

## 5. Database Module

The database module (`/infra/modules/database`) manages RDS PostgreSQL.

### Resources Created

| Resource | Description | Staging Config |
|----------|-------------|----------------|
| DB Subnet Group | Private subnets only | me-south-1a, me-south-1b |
| DB Parameter Group | PostgreSQL 15 settings | Timezone: Asia/Bahrain |
| RDS Instance | PostgreSQL database | db.t3.micro |

### Configuration

| Setting | Staging Value | Notes |
|---------|---------------|-------|
| Engine | PostgreSQL 15.4 | Latest stable |
| Instance Class | db.t3.micro | Cost-effective |
| Storage | 20-50 GB (gp3) | Autoscaling enabled |
| Multi-AZ | false | Single AZ for staging |
| Backup Retention | 7 days | Automated daily backups |
| Encryption | true | Always encrypted at rest |
| Public Access | false | Private subnets only |

### Security

| Security Group | Inbound Rules | Source |
|----------------|---------------|--------|
| Database SG | Port 5432 | API Security Group only |

> **Important:** The database is NOT publicly accessible. It can only be reached from ECS tasks in the same VPC through the API security group.

### Outputs for ECS Tasks

| Output | Description |
|--------|-------------|
| `database_endpoint` | Full endpoint (hostname:port) |
| `database_address` | Hostname only |
| `database_port` | Port (5432) |
| `database_name` | Database name |
| `database_identifier` | RDS instance ID |

### Secrets Management

Database credentials are passed via Terraform variables. **Do NOT commit actual values.**

```bash
# Option 1: terraform.tfvars (gitignored)
db_username = "nasneh_admin"
db_password = "your_secure_password"

# Option 2: Environment variables
export TF_VAR_db_username="nasneh_admin"
export TF_VAR_db_password="your_secure_password"
```

> **Note:** AWS Secrets Manager integration will be configured in a separate task.

### Cost Estimate (Staging)

| Resource | Monthly Cost |
|----------|--------------|
| db.t3.micro | ~$12 |
| Storage (20 GB gp3) | ~$2 |
| Backup storage | ~$1 |
| **Total** | **~$15** |

---

## 6. Compute Module

The compute module (`/infra/modules/compute`) manages ECS Fargate and ALB.

### Resources Created

| Resource | Description | Staging Config |
|----------|-------------|----------------|
| ECS Cluster | Fargate cluster | Container Insights enabled |
| ECS Service | API service | 1 desired task |
| ECS Task Definition | Fargate task | 256 CPU, 512 MB |
| Application Load Balancer | Public-facing | In public subnets |
| Target Group | IP-based | Health check on /health |
| HTTP Listener | Port 80 | HTTPS placeholder ready |
| ECR Repository | Container registry | Lifecycle policy |
| CloudWatch Log Group | API logs | 30-day retention |
| IAM Roles | Execution + Task | Secrets Manager prepared |

### Configuration

| Setting | Staging Value | Notes |
|---------|---------------|-------|
| CPU | 256 (0.25 vCPU) | Minimal for staging |
| Memory | 512 MB | Minimal for staging |
| Desired Count | 1 | Single task |
| Min/Max | 1/2 | Limited autoscaling |
| Container Port | 3000 | API port |
| Health Check | /health | HTTP 200 |

### Health Checks

| Check | Configuration |
|-------|---------------|
| ALB Health Check | GET /health, 200 OK |
| Container Health Check | curl localhost:3000/health |
| Interval | 30 seconds |
| Healthy Threshold | 2 |
| Unhealthy Threshold | 3 |

### IAM Roles

| Role | Permissions |
|------|-------------|
| Task Execution | ECR pull, CloudWatch logs, Secrets Manager |
| Task | S3 access, application permissions |

### Outputs for CI/CD

| Output | Description |
|--------|-------------|
| `api_endpoint` | HTTP endpoint URL |
| `alb_dns_name` | ALB DNS name |
| `ecr_repository_url` | ECR URL for docker push |
| `cluster_name` | ECS cluster name |
| `service_name` | ECS service name |

### Cost Estimate (Staging)

| Resource | Monthly Cost |
|----------|--------------|
| Fargate (256 CPU, 512 MB) | ~$10 |
| ALB | ~$16 |
| CloudWatch Logs | ~$1 |
| ECR Storage | ~$1 |
| **Total** | **~$28** |

---

## 7. Storage Module

The storage module (`/infra/modules/storage`) manages S3 bucket and CloudFront CDN.

### Resources Created

| Resource | Description | Staging Config |
|----------|-------------|----------------|
| S3 Bucket | Static assets storage | Block Public Access ON |
| S3 Bucket Policy | CloudFront OAC only | No public access |
| S3 Versioning | Enabled | 90-day expiration |
| S3 Encryption | AES256 | Server-side encryption |
| CloudFront OAC | Origin Access Control | Modern, secure |
| CloudFront Distribution | CDN | HTTPS redirect |

### Configuration

| Setting | Staging Value | Notes |
|---------|---------------|-------|
| Block Public Access | ON | All public access blocked |
| Versioning | Enabled | For recovery and audit |
| Encryption | AES256 | Server-side encryption |
| Lifecycle | 90 days | Expire old versions |
| Price Class | PriceClass_100 | US, Canada, Europe |
| Default TTL | 86400 (1 day) | Cache duration |
| Compression | Enabled | Automatic gzip/brotli |

### Security

| Component | Configuration |
|-----------|---------------|
| S3 Bucket | Block Public Access: ON |
| Bucket Policy | CloudFront OAC access only |
| CloudFront | HTTPS redirect, TLS 1.2 |
| OAC | Origin Access Control (modern) |

> **Important:** The S3 bucket is NOT publicly accessible. Objects can only be accessed through CloudFront using Origin Access Control (OAC).

### Outputs for CI/CD

| Output | Description |
|--------|-------------|
| `bucket_name` | S3 bucket name |
| `cloudfront_distribution_id` | CloudFront distribution ID |
| `cloudfront_domain_name` | CloudFront domain name |
| `cdn_url` | Full HTTPS URL |

### Feature Toggles

```hcl
# Disable entire module
enable_storage = false

# Disable CloudFront only (S3 only)
enable_cdn = false
```

### Custom Domain (Future)

To use a custom domain:
1. Create ACM certificate in **us-east-1** (required for CloudFront)
2. Pass `custom_domain` and `acm_certificate_arn` variables
3. Create Route53 alias record pointing to CloudFront

### Cost Estimate (Staging)

| Resource | Monthly Cost |
|----------|--------------|
| S3 Storage (10 GB) | ~$0.25 |
| S3 Requests | ~$0.50 |
| CloudFront (10 GB transfer) | ~$1.00 |
| **Total** | **~$2** |

---

## 8. DevOps Gate Tasks

**Source of Truth:** [ClickUp DevOps Gate List](https://app.clickup.com/90182234772/v/l/li/901814719216)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | [DEVOPS] IaC Setup — Terraform/CDK base structure | Urgent | ✅ Complete |
| 2 | [DEVOPS] VPC + Networking — subnets, routing, security groups | Urgent | ✅ Complete |
| 3 | [DEVOPS] RDS PostgreSQL — staging DB setup + backups | Urgent | ✅ Complete |
| 4 | [DEVOPS] ECS Fargate + ALB — API deployment + health checks | Urgent | ✅ Complete |
| 5 | [DEVOPS] S3 + CloudFront — static assets/CDN | High | ✅ Complete |
| 6 | [DEVOPS] CI/CD Pipeline — GitHub Actions + ECR + migrations | Urgent | 🔄 Pending Review |
| 7 | [DEVOPS] Secrets Management — AWS Secrets Manager + GitHub | Urgent | ⏳ To Do |
| 8 | [DEVOPS] Monitoring + Alerts — CloudWatch logs + alarms | High | ⏳ To Do |

> **Note:** Terraform remote state backend (S3 + DynamoDB) is configured as a sub-step during initial deployment, not as a separate task.

---

## 9. Total Cost Estimate (Staging)

| Module | Monthly Cost |
|--------|--------------|
| Networking (NAT + EIP) | ~$36 |
| Database (RDS) | ~$15 |
| Compute (ECS + ALB) | ~$28 |
| Storage (S3 + CloudFront) | ~$2 |
| **Total** | **~$81** |

---

**Document End**


---

## 10. CI/CD Pipeline

The CI/CD pipeline is implemented using GitHub Actions with two workflows.

### Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `.github/workflows/ci.yml` | PR to main, push to main | Lint, typecheck, test, build |
| CD | `.github/workflows/cd.yml` | Push to main (api changes) | Build Docker image, push to ECR |

### CI Pipeline

Runs on every PR and push to main. All checks must pass before merge.

```
┌─────────┐     ┌───────────┐     ┌──────┐     ┌───────┐
│  Lint   │────►│ Typecheck │────►│ Test │────►│ Build │
└─────────┘     └───────────┘     └──────┘     └───────┘
```

| Job | Command | Description |
|-----|---------|-------------|
| Lint | `pnpm lint` | Code style checks |
| Typecheck | `pnpm typecheck` | TypeScript validation |
| Test | `pnpm test` | Run test suite |
| Build | `pnpm build` | Build all packages |

### CD Pipeline

Runs on push to main when `apps/api/**` or `packages/**` changes.

| Step | Description |
|------|-------------|
| Build Docker Image | Multi-stage build from `apps/api/Dockerfile` |
| Push to ECR | Tags: `<sha>`, `staging-latest`, `<timestamp>` |
| Deploy to ECS | **Manual only** via `workflow_dispatch` |

### Image Tag Strategy

| Tag | Example | Description |
|-----|---------|-------------|
| Commit SHA | `abc1234` | Short SHA for traceability |
| Environment | `staging-latest` | Latest for environment |
| Timestamp | `20260102-123456` | Build timestamp |

### GitHub Secrets Required

Configure in GitHub → Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | AWS region (`me-south-1`) |

### Dockerfile

Located at `apps/api/Dockerfile`. Multi-stage build:

| Stage | Purpose |
|-------|---------|
| `builder` | Install deps, generate Prisma, build TypeScript |
| `production` | Production deps only, non-root user, health check |

### Manual Deploy

Deploy is **not automatic** to prevent accidental production changes.

To deploy after image is pushed:
1. Go to GitHub Actions → CD workflow
2. Click "Run workflow"
3. Select `deploy: true`
4. Click "Run workflow"

Or via CLI:
```bash
gh workflow run cd.yml -f deploy=true
```

### Documentation

See [RUNBOOK.md](./RUNBOOK.md) for:
- Running CI locally
- Building Docker image locally
- GitHub secrets configuration
- Troubleshooting

---

**Document End**
