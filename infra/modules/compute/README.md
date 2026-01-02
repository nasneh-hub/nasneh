# Compute Module

This module manages ECS Fargate and ALB for the Nasneh API.

## Resources Created

| Resource | Description |
|----------|-------------|
| ECS Cluster | Fargate cluster with Container Insights |
| ECS Service | API service with load balancer integration |
| ECS Task Definition | Fargate task with container configuration |
| Application Load Balancer | Public-facing ALB in public subnets |
| Target Group | IP-based target group for Fargate tasks |
| HTTP Listener | Port 80 listener (HTTPS placeholder ready) |
| ECR Repository | Container registry with lifecycle policy |
| CloudWatch Log Group | 30-day retention for API logs |
| IAM Roles | Task execution and task roles |

## Architecture

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                      VPC (10.0.0.0/16)                  │
                    │                                                         │
    Internet ───────┼──► ALB (Public Subnets)                                 │
                    │         │                                               │
                    │         ▼ Port 80 (HTTP)                                │
                    │    ┌────────────────────────────────────────┐          │
                    │    │          Target Group (IP)             │          │
                    │    └────────────────────────────────────────┘          │
                    │              │                                          │
                    │              ▼                                          │
                    │    ┌────────────────────────────────────────┐          │
                    │    │          Private Subnets               │          │
                    │    │  ┌─────────────┐    ┌─────────────┐    │          │
                    │    │  │ ECS Task    │    │ ECS Task    │    │          │
                    │    │  │ (Fargate)   │    │ (Fargate)   │    │          │
                    │    │  │ Port 3000   │    │ Port 3000   │    │          │
                    │    │  └─────────────┘    └─────────────┘    │          │
                    │    │         │                  │           │          │
                    │    │         └────────┬─────────┘           │          │
                    │    │                  ▼                     │          │
                    │    │           [RDS PostgreSQL]             │          │
                    │    └────────────────────────────────────────┘          │
                    └─────────────────────────────────────────────────────────┘
```

## Usage

```hcl
module "compute" {
  source = "../../modules/compute"

  name_prefix           = "nasneh-staging"
  aws_region            = "me-south-1"
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  private_subnet_ids    = module.networking.private_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
  api_security_group_id = module.networking.api_security_group_id

  # Database connection
  database_endpoint = module.database.endpoint
  database_name     = module.database.db_name

  # Container configuration
  container_image  = "amazon/amazon-ecs-sample" # Placeholder
  container_port   = 3000
  container_cpu    = 256
  container_memory = 512

  # Service configuration
  desired_count = 1
  min_capacity  = 1
  max_capacity  = 2

  # Health check
  health_check_path = "/health"

  tags = local.common_tags
}
```

## Inputs

| Name | Description | Type | Default |
|------|-------------|------|---------|
| name_prefix | Prefix for resource names | string | - |
| aws_region | AWS region | string | - |
| vpc_id | VPC ID | string | - |
| public_subnet_ids | Public subnet IDs for ALB | list(string) | - |
| private_subnet_ids | Private subnet IDs for ECS | list(string) | - |
| alb_security_group_id | ALB security group ID | string | - |
| api_security_group_id | API security group ID | string | - |
| database_endpoint | RDS endpoint | string | - |
| database_name | Database name | string | - |
| container_image | Docker image URI | string | amazon/amazon-ecs-sample |
| container_port | Container port | number | 3000 |
| container_cpu | CPU units (256 = 0.25 vCPU) | number | 256 |
| container_memory | Memory in MB | number | 512 |
| desired_count | Desired task count | number | 1 |
| health_check_path | Health check path | string | /health |

## Outputs

| Name | Description |
|------|-------------|
| alb_dns_name | ALB DNS name |
| api_endpoint | HTTP endpoint URL |
| cluster_name | ECS cluster name |
| service_name | ECS service name |
| ecr_repository_url | ECR repository URL |
| task_execution_role_arn | Task execution role ARN |
| task_role_arn | Task role ARN |
| log_group_name | CloudWatch log group name |

## Staging Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| CPU | 256 (0.25 vCPU) | Minimal for staging |
| Memory | 512 MB | Minimal for staging |
| Desired Count | 1 | Single task for staging |
| Min/Max | 1/2 | Limited autoscaling |
| Log Retention | 30 days | Cost-effective |

## Health Checks

| Check | Configuration |
|-------|---------------|
| ALB Health Check | GET /health, 200 OK |
| Container Health Check | curl localhost:3000/health |
| Interval | 30 seconds |
| Timeout | 5 seconds |
| Healthy Threshold | 2 |
| Unhealthy Threshold | 3 |

## IAM Roles

### Task Execution Role
- Pull images from ECR
- Write logs to CloudWatch
- Read secrets from Secrets Manager (prepared)

### Task Role
- S3 access for uploads
- Additional permissions as needed

## Cost Estimate (Staging)

| Resource | Monthly Cost |
|----------|--------------|
| Fargate (256 CPU, 512 MB) | ~$10 |
| ALB | ~$16 |
| CloudWatch Logs | ~$1 |
| ECR Storage | ~$1 |
| **Total** | **~$28** |

## CI/CD Integration

The ECR repository URL is output for use in CI/CD pipelines:

```bash
# Build and push (CI/CD will handle this)
docker build -t $ECR_REPO_URL:$TAG .
docker push $ECR_REPO_URL:$TAG

# Update service (CI/CD will handle this)
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment
```

## Secrets Management

Environment variables are configured as placeholders. Real secrets will be injected via AWS Secrets Manager (separate task).

```hcl
# Future: Secrets Manager integration
secrets = [
  {
    name      = "DATABASE_URL"
    valueFrom = "arn:aws:secretsmanager:region:account:secret:nasneh-staging/database-url"
  }
]
```

## Status

✅ **Implemented** - DevOps Gate Sprint 2.5
