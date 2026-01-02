# Networking Module

This module manages VPC, subnets, gateways, route tables, and security groups for the Nasneh platform.

## Resources Created

| Resource | Description |
|----------|-------------|
| VPC | Main VPC with DNS support enabled |
| Public Subnets | 2 subnets across AZs (me-south-1a, me-south-1b) |
| Private Subnets | 2 subnets across AZs for API, DB, Cache |
| Internet Gateway | For public subnet internet access |
| NAT Gateway | For private subnet egress (single for staging) |
| Route Tables | Public (1) and Private (1 for staging) |
| Security Groups | ALB, API, Database, Cache |

## Architecture

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
                    │    │  │             │    │             │     │          │
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
                    │    │  │             │    │             │    │          │
                    │    │  │  [API/ECS]  │    │  [API/ECS]  │    │          │
                    │    │  │  [RDS]      │    │             │    │          │
                    │    │  │  [Redis]    │    │             │    │          │
                    │    │  └─────────────┘    └─────────────┘    │          │
                    │    └────────────────────────────────────────┘          │
                    └─────────────────────────────────────────────────────────┘
```

## Security Groups

| Security Group | Inbound | Outbound |
|----------------|---------|----------|
| ALB | HTTP (80), HTTPS (443) from anywhere | All |
| API | Port 3000 from ALB only | All (for NAT, Secrets Manager) |
| Database | Port 5432 from API only | All |
| Cache | Port 6379 from API only | All |

## Usage

```hcl
module "networking" {
  source = "../../modules/networking"

  name_prefix          = "nasneh-staging"
  vpc_cidr             = "10.0.0.0/16"
  availability_zones   = ["me-south-1a", "me-south-1b"]
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true  # Set false for production HA

  tags = {
    Project     = "nasneh"
    Environment = "staging"
  }
}
```

## Inputs

| Name | Description | Type | Default |
|------|-------------|------|---------|
| name_prefix | Prefix for resource names | string | - |
| vpc_cidr | CIDR block for VPC | string | "10.0.0.0/16" |
| availability_zones | List of AZs | list(string) | ["me-south-1a", "me-south-1b"] |
| public_subnet_cidrs | Public subnet CIDRs | list(string) | ["10.0.1.0/24", "10.0.2.0/24"] |
| private_subnet_cidrs | Private subnet CIDRs | list(string) | ["10.0.10.0/24", "10.0.11.0/24"] |
| enable_nat_gateway | Enable NAT Gateway | bool | true |
| single_nat_gateway | Use single NAT (staging) | bool | true |
| tags | Common tags | map(string) | {} |

## Outputs

| Name | Description |
|------|-------------|
| vpc_id | VPC ID |
| vpc_cidr | VPC CIDR block |
| public_subnet_ids | List of public subnet IDs |
| private_subnet_ids | List of private subnet IDs |
| nat_gateway_public_ips | NAT Gateway public IPs |
| alb_security_group_id | ALB security group ID |
| api_security_group_id | API security group ID |
| database_security_group_id | Database security group ID |
| cache_security_group_id | Cache security group ID |

## Cost Estimate (Staging)

| Resource | Monthly Cost |
|----------|--------------|
| NAT Gateway | ~$32 |
| Elastic IP | ~$3.65 |
| **Total** | **~$36** |

> **Note:** NAT Gateway is required for ECS Fargate tasks in private subnets to pull images and access AWS services.

## Status

✅ **Implemented** - DevOps Gate Sprint 2.5
