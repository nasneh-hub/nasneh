# Nasneh Infrastructure - Storage Module Variables
# =================================================
# Input variables for S3 + CloudFront module.

variable "name_prefix" {
  description = "Prefix for resource names (e.g., nasneh-staging)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for S3 bucket"
  type        = string
}

# -----------------------------------------------------------------------------
# Feature Toggles
# -----------------------------------------------------------------------------

variable "enable_cdn" {
  description = "Enable CloudFront distribution (set to false to disable CDN)"
  type        = bool
  default     = true
}

variable "enable_storage" {
  description = "Enable the entire storage module (set to false to skip all resources)"
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# S3 Configuration
# -----------------------------------------------------------------------------

variable "bucket_suffix" {
  description = "Suffix for the S3 bucket name (e.g., assets, uploads)"
  type        = string
  default     = "assets"
}

variable "force_destroy" {
  description = "Allow bucket deletion even if not empty (use true for staging)"
  type        = bool
  default     = false
}

variable "versioning_enabled" {
  description = "Enable versioning on the S3 bucket"
  type        = bool
  default     = true
}

variable "lifecycle_expiration_days" {
  description = "Days after which to expire old versions (0 to disable)"
  type        = number
  default     = 90
}

# -----------------------------------------------------------------------------
# CloudFront Configuration
# -----------------------------------------------------------------------------

variable "price_class" {
  description = "CloudFront price class (PriceClass_All, PriceClass_200, PriceClass_100)"
  type        = string
  default     = "PriceClass_100" # US, Canada, Europe only - cheapest
}

variable "default_ttl" {
  description = "Default TTL for cached objects in seconds"
  type        = number
  default     = 86400 # 1 day
}

variable "max_ttl" {
  description = "Maximum TTL for cached objects in seconds"
  type        = number
  default     = 604800 # 7 days
}

variable "min_ttl" {
  description = "Minimum TTL for cached objects in seconds"
  type        = number
  default     = 0
}

variable "compress" {
  description = "Enable automatic compression for CloudFront"
  type        = bool
  default     = true
}

# -----------------------------------------------------------------------------
# Custom Domain (Optional - for future use)
# -----------------------------------------------------------------------------

variable "custom_domain" {
  description = "Custom domain for CloudFront (optional, requires ACM certificate)"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for custom domain (must be in us-east-1)"
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Tags
# -----------------------------------------------------------------------------

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
