# =============================================================================
# AWS AMPLIFY MODULE - VARIABLES
# =============================================================================

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "api_url" {
  description = "API URL for frontend apps (e.g., https://api-staging.nasneh.com)"
  type        = string
}

variable "root_domain" {
  description = "Root domain for custom domain associations (e.g., nasneh.com)"
  type        = string
  default     = ""
}

variable "enable_custom_domains" {
  description = "Whether to enable custom domain associations"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
