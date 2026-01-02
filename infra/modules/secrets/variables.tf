# Nasneh Infrastructure - Secrets Module Variables
# =================================================
# Input variables for AWS Secrets Manager module.

variable "name_prefix" {
  description = "Prefix for resource names (e.g., nasneh-staging)"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

# -----------------------------------------------------------------------------
# Secret Configuration
# -----------------------------------------------------------------------------

variable "recovery_window_in_days" {
  description = "Number of days before a deleted secret is permanently removed (0 for immediate)"
  type        = number
  default     = 7 # 7 days for staging, 30 for production
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
