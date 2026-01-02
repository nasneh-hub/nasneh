# Database Module

This module manages RDS PostgreSQL for the Nasneh platform.

## Resources Created

| Resource | Description |
|----------|-------------|
| DB Subnet Group | Places RDS in private subnets only |
| DB Parameter Group | PostgreSQL 15 optimized settings |
| RDS Instance | PostgreSQL database instance |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VPC (10.0.0.0/16)                      │
│                                                             │
│    ┌────────────────────────────────────────┐               │
│    │          Private Subnets               │               │
│    │  ┌─────────────┐    ┌─────────────┐    │               │
│    │  │10.0.10.0/24 │    │10.0.11.0/24 │    │               │
│    │  │ me-south-1a │    │ me-south-1b │    │               │
│    │  │             │    │             │    │               │
│    │  │  [API/ECS]──┼────┼──►[RDS]     │    │               │
│    │  │     │       │    │     ▲       │    │               │
│    │  │     │       │    │     │       │    │               │
│    │  │     └───────┼────┼─────┘       │    │               │
│    │  │   Port 5432 │    │  DB SG      │    │               │
│    │  └─────────────┘    └─────────────┘    │               │
│    └────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## Security

| Security Group | Inbound Rules | Source |
|----------------|---------------|--------|
| Database SG | Port 5432 | API Security Group only |

> **Important:** The database is NOT publicly accessible. It can only be reached from ECS tasks in the same VPC through the API security group.

## Usage

```hcl
module "database" {
  source = "../../modules/database"

  name_prefix                = "nasneh-staging"
  vpc_id                     = module.networking.vpc_id
  private_subnet_ids         = module.networking.private_subnet_ids
  database_security_group_id = module.networking.database_security_group_id

  # Database configuration
  db_name     = "nasneh"
  db_username = var.db_username  # From tfvars or env
  db_password = var.db_password  # From tfvars or env

  # Instance configuration (staging)
  instance_class        = "db.t3.micro"
  allocated_storage     = 20
  max_allocated_storage = 50
  multi_az              = false

  # Backup configuration
  backup_retention_period = 7
  deletion_protection     = false
  skip_final_snapshot     = true

  tags = local.common_tags
}
```

## Inputs

| Name | Description | Type | Default |
|------|-------------|------|---------|
| name_prefix | Prefix for resource names | string | - |
| vpc_id | VPC ID | string | - |
| private_subnet_ids | Private subnet IDs | list(string) | - |
| database_security_group_id | DB security group ID | string | - |
| db_name | Database name | string | "nasneh" |
| db_username | Master username (sensitive) | string | - |
| db_password | Master password (sensitive) | string | - |
| instance_class | RDS instance class | string | "db.t3.micro" |
| engine_version | PostgreSQL version | string | "15.4" |
| allocated_storage | Initial storage (GB) | number | 20 |
| max_allocated_storage | Max storage for autoscaling | number | 50 |
| multi_az | Enable Multi-AZ | bool | false |
| backup_retention_period | Backup retention days | number | 7 |
| deletion_protection | Enable deletion protection | bool | false |
| skip_final_snapshot | Skip final snapshot | bool | true |

## Outputs

| Name | Description |
|------|-------------|
| endpoint | RDS endpoint (hostname:port) |
| address | RDS hostname |
| port | RDS port |
| db_name | Database name |
| db_identifier | RDS instance identifier |
| db_arn | RDS instance ARN |
| connection_string_template | Connection string template |

## Staging Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| Instance Class | db.t3.micro | Cost-effective for staging |
| Storage | 20-50 GB (gp3) | Autoscaling enabled |
| Multi-AZ | false | Single AZ for staging |
| Backup Retention | 7 days | Automated daily backups |
| Deletion Protection | false | Easy teardown for staging |
| Encryption | true | Always encrypted at rest |

## Cost Estimate (Staging)

| Resource | Monthly Cost |
|----------|--------------|
| db.t3.micro | ~$12 |
| Storage (20 GB gp3) | ~$2 |
| Backup storage | ~$1 |
| **Total** | **~$15** |

## Secrets Management

> **Note:** Database credentials (username/password) should NOT be committed to the repository. Use one of these approaches:
>
> 1. **terraform.tfvars** (gitignored) - For local development
> 2. **Environment variables** - `TF_VAR_db_username`, `TF_VAR_db_password`
> 3. **AWS Secrets Manager** - Will be configured in a separate task

## Status

✅ **Implemented** - DevOps Gate Sprint 2.5
