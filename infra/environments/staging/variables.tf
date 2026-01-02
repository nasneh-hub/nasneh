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
