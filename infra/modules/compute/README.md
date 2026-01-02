# Compute Module

This module manages compute resources for the Nasneh API and web applications.

## Resources (Planned)

- ECS Cluster (Fargate)
- ECS Services and Task Definitions
- Application Load Balancer
- Auto Scaling policies
- CloudWatch alarms

## Usage

```hcl
module "compute" {
  source = "../../modules/compute"

  name_prefix       = local.name_prefix
  vpc_id            = module.networking.vpc_id
  private_subnets   = module.networking.private_subnet_ids
  public_subnets    = module.networking.public_subnet_ids
  api_image         = var.api_docker_image
  min_instances     = local.staging_config.api_min_instances
  max_instances     = local.staging_config.api_max_instances
  desired_instances = local.staging_config.api_desired
  tags              = local.common_tags
}
```

## Status

🔜 **Planned** - Implementation pending in DevOps Gate Sprint 2.5
