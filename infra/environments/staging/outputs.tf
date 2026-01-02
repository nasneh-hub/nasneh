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

# Placeholder outputs for future resources
# Uncomment as modules are implemented

# output "vpc_id" {
#   description = "VPC ID"
#   value       = module.networking.vpc_id
# }

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
