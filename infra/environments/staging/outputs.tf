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
# DATABASE OUTPUTS
# =============================================================================

output "database_endpoint" {
  description = "RDS PostgreSQL endpoint (hostname:port)"
  value       = module.database.endpoint
  sensitive   = true
}

output "database_address" {
  description = "RDS PostgreSQL hostname"
  value       = module.database.address
  sensitive   = true
}

output "database_port" {
  description = "RDS PostgreSQL port"
  value       = module.database.port
}

output "database_name" {
  description = "Database name"
  value       = module.database.db_name
}

output "database_identifier" {
  description = "RDS instance identifier"
  value       = module.database.db_identifier
}

# =============================================================================
# COMPUTE OUTPUTS
# =============================================================================

output "api_endpoint" {
  description = "API endpoint URL (HTTP)"
  value       = module.compute.api_endpoint
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.compute.alb_dns_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.compute.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.compute.service_name
}

output "ecr_repository_url" {
  description = "ECR repository URL for CI/CD"
  value       = module.compute.ecr_repository_url
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for API logs"
  value       = module.compute.log_group_name
}

# =============================================================================
# STORAGE OUTPUTS
# =============================================================================

output "assets_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = module.storage.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.storage.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = module.storage.cloudfront_domain_name
}

output "cdn_url" {
  description = "Full HTTPS URL for CDN"
  value       = module.storage.cdn_url
}

output "storage_enabled" {
  description = "Whether storage module is enabled"
  value       = module.storage.storage_enabled
}

output "cdn_enabled" {
  description = "Whether CloudFront CDN is enabled"
  value       = module.storage.cdn_enabled
}

# =============================================================================
# SECRETS OUTPUTS
# =============================================================================

output "api_secret_arn" {
  description = "ARN of the API application secrets"
  value       = module.secrets.api_secret_arn
}

output "database_secret_arn" {
  description = "ARN of the database credentials secret"
  value       = module.secrets.database_secret_arn
}

output "external_secret_arn" {
  description = "ARN of the external services secret"
  value       = module.secrets.external_secret_arn
}

output "secrets_read_policy_arn" {
  description = "ARN of the IAM policy for reading secrets"
  value       = module.secrets.secrets_read_policy_arn
}

# =============================================================================
# FUTURE MODULE OUTPUTS (Placeholders)
# =============================================================================
# Uncomment as modules are implemented

# output "redis_endpoint" {
#   description = "Redis endpoint"
#   value       = module.cache.endpoint
#   sensitive   = true
# }
