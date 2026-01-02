# Nasneh Infrastructure - Staging Outputs
# ========================================
# Outputs from the staging environment.

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "name_prefix" {
  description = "Resource naming prefix"
  value       = local.name_prefix
}

# =============================================================================
# NETWORKING OUTPUTS
# =============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = module.networking.vpc_cidr
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = module.networking.private_subnet_ids
}

output "nat_gateway_public_ips" {
  description = "NAT Gateway public IPs"
  value       = module.networking.nat_gateway_public_ips
}

output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = module.networking.alb_security_group_id
}

output "api_security_group_id" {
  description = "API security group ID"
  value       = module.networking.api_security_group_id
}

output "database_security_group_id" {
  description = "Database security group ID"
  value       = module.networking.database_security_group_id
}

output "cache_security_group_id" {
  description = "Cache security group ID"
  value       = module.networking.cache_security_group_id
}

# =============================================================================
# FUTURE MODULE OUTPUTS (Placeholders)
# =============================================================================
# Uncomment as modules are implemented

# output "api_endpoint" {
#   description = "API endpoint URL"
#   value       = module.compute.api_endpoint
# }

# output "database_endpoint" {
#   description = "Database endpoint"
#   value       = module.database.endpoint
#   sensitive   = true
# }

# output "redis_endpoint" {
#   description = "Redis endpoint"
#   value       = module.cache.endpoint
#   sensitive   = true
# }
