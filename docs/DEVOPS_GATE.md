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
│   ├── networking/
│   ├── compute/
│   ├── database/
│   └── secrets/
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

# 3. (Optional) Edit terraform.tfvars with custom values


# 4. Initialize Terraform
terraform init

# 5. Plan the deployment
terraform plan

# 6. Apply the changes
terraform apply
```

---

## 4. DevOps Gate Tasks

**Source of Truth:** [ClickUp DevOps Gate List](https://app.clickup.com/90182234772/v/l/li/901814719216)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | [DEVOPS] IaC Setup — Terraform/CDK base structure | Urgent | ✅ Complete |
| 2 | [DEVOPS] VPC + Networking — subnets, routing, security groups | Urgent | 🔄 Pending Review |
| 3 | [DEVOPS] RDS PostgreSQL — staging DB setup + backups | Urgent | ⏳ To Do |
| 4 | [DEVOPS] ECS Fargate + ALB — API deployment + health checks | Urgent | ⏳ To Do |
| 5 | [DEVOPS] S3 + CloudFront — static assets/CDN | High | ⏳ To Do |
| 6 | [DEVOPS] CI/CD Pipeline — GitHub Actions + ECR + migrations | Urgent | ⏳ To Do |
| 7 | [DEVOPS] Secrets Management — AWS Secrets Manager + GitHub | Urgent | ⏳ To Do |
| 8 | [DEVOPS] Monitoring + Alerts — CloudWatch logs + alarms | High | ⏳ To Do |

> **Note:** Terraform remote state backend (S3 + DynamoDB) is configured as a sub-step during initial deployment, not as a separate task.

---

**Document End**
