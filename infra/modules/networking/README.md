# Networking Module

This module manages VPC, subnets, security groups, and network ACLs.

## Resources (Planned)

- VPC with public/private subnets
- Internet Gateway
- NAT Gateway (for private subnet egress)
- Security Groups
- Network ACLs
- Route Tables

## Usage

```hcl
module "networking" {
  source = "../../modules/networking"

  name_prefix          = local.name_prefix
  vpc_cidr             = local.staging_config.vpc_cidr
  public_subnet_cidrs  = local.staging_config.public_subnet_cidrs
  private_subnet_cidrs = local.staging_config.private_subnet_cidrs
  tags                 = local.common_tags
}
```

## Status

🔜 **Planned** - Implementation pending in DevOps Gate Sprint 2.5
