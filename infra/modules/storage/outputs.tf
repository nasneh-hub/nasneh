# Nasneh Infrastructure - Storage Module Outputs
# ===============================================
# Outputs for use by other modules and CI/CD.

# -----------------------------------------------------------------------------
# S3 Bucket Outputs
# -----------------------------------------------------------------------------
output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = var.enable_storage ? aws_s3_bucket.assets[0].id : ""
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = var.enable_storage ? aws_s3_bucket.assets[0].arn : ""
}

output "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = var.enable_storage ? aws_s3_bucket.assets[0].bucket_regional_domain_name : ""
}

# -----------------------------------------------------------------------------
# CloudFront Outputs
# -----------------------------------------------------------------------------
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = var.enable_storage && var.enable_cdn ? aws_cloudfront_distribution.assets[0].id : ""
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = var.enable_storage && var.enable_cdn ? aws_cloudfront_distribution.assets[0].domain_name : ""
}

output "cloudfront_arn" {
  description = "ARN of the CloudFront distribution"
  value       = var.enable_storage && var.enable_cdn ? aws_cloudfront_distribution.assets[0].arn : ""
}

output "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution (for Route53)"
  value       = var.enable_storage && var.enable_cdn ? aws_cloudfront_distribution.assets[0].hosted_zone_id : ""
}

# -----------------------------------------------------------------------------
# CDN URL
# -----------------------------------------------------------------------------
output "cdn_url" {
  description = "Full HTTPS URL for the CDN"
  value       = var.enable_storage && var.enable_cdn ? "https://${aws_cloudfront_distribution.assets[0].domain_name}" : ""
}

# -----------------------------------------------------------------------------
# Status Outputs
# -----------------------------------------------------------------------------
output "storage_enabled" {
  description = "Whether storage module is enabled"
  value       = var.enable_storage
}

output "cdn_enabled" {
  description = "Whether CloudFront CDN is enabled"
  value       = var.enable_storage && var.enable_cdn
}
