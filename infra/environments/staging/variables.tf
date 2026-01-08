# Nasneh Infrastructure - Staging Variables
# ==========================================
# Variables specific to the staging environment.

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "nasneh"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "me-south-1" # AWS Bahrain
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}

# ============================================
# Staging-Specific Variables
# ============================================

variable "api_instance_type" {
  description = "EC2 instance type for API servers"
  type        = string
  default     = "t3.small" # Cost-effective for staging
}

variable "db_instance_class" {
  description = "RDS instance class for database"
  type        = string
  default     = "db.t3.micro" # Minimal for staging
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for critical resources"
  type        = bool
  default     = false # Disabled for staging
}

# ============================================
# Database Credentials (Sensitive)
# ============================================
# DO NOT commit actual values to the repository.
# Use terraform.tfvars (gitignored) or environment variables:
#   export TF_VAR_db_username="your_username"
#   export TF_VAR_db_password="your_password"

variable "db_username" {
  description = "Master username for RDS PostgreSQL"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Master password for RDS PostgreSQL"
  type        = string
  sensitive   = true
}


# ============================================
# Storage / CDN Variables
# ============================================

variable "enable_storage" {
  description = "Enable S3 storage module (set to false to skip)"
  type        = bool
  default     = true
}

variable "enable_cdn" {
  description = "Enable CloudFront CDN (set to false for S3 only)"
  type        = bool
  default     = true
}


# ============================================
# Monitoring Variables
# ============================================

variable "enable_monitoring" {
  description = "Enable CloudWatch alarms and monitoring"
  type        = bool
  default     = true
}

variable "alert_email" {
  description = "Email address for CloudWatch alarm notifications (leave empty to skip)"
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Frontend Variables
# -----------------------------------------------------------------------------
variable "enable_frontend" {
  description = "Enable frontend ECS services (customer-web and dashboard)"
  type        = bool
  default     = false
}

variable "customer_web_image" {
  description = "Docker image for customer-web app"
  type        = string
  default     = "339712742092.dkr.ecr.me-south-1.amazonaws.com/nasneh-staging-customer-web:latest"
}

variable "dashboard_image" {
  description = "Docker image for dashboard app"
  type        = string
  default     = "339712742092.dkr.ecr.me-south-1.amazonaws.com/nasneh-staging-dashboard:latest"
}
