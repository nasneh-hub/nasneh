# Cache Module

This module manages ElastiCache Redis for Nasneh.

## Resources (Planned)

- ElastiCache Redis cluster
- Subnet Group
- Security Group
- Parameter Group
- CloudWatch alarms

## Usage

```hcl
module "cache" {
  source = "../../modules/cache"

  name_prefix      = local.name_prefix
  vpc_id           = module.networking.vpc_id
  private_subnets  = module.networking.private_subnet_ids
  node_type        = local.staging_config.redis_node_type
  num_cache_nodes  = local.staging_config.redis_num_cache_nodes
  tags             = local.common_tags
}
```

## Status

🔜 **Planned** - Implementation pending in DevOps Gate Sprint 2.5
