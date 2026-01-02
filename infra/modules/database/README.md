# Database Module

This module manages RDS PostgreSQL database for Nasneh.

## Resources (Planned)

- RDS PostgreSQL instance
- DB Subnet Group
- DB Parameter Group
- Security Group for database access
- Automated backups configuration
- CloudWatch alarms

## Usage

```hcl
module "database" {
  source = "../../modules/database"

  name_prefix         = local.name_prefix
  vpc_id              = module.networking.vpc_id
  private_subnets     = module.networking.private_subnet_ids
  instance_class      = var.db_instance_class
  allocated_storage   = local.staging_config.db_allocated_storage
  max_storage         = local.staging_config.db_max_storage
  multi_az            = local.staging_config.db_multi_az
  deletion_protection = var.enable_deletion_protection
  tags                = local.common_tags
}
```

## Status

🔜 **Planned** - Implementation pending in DevOps Gate Sprint 2.5
