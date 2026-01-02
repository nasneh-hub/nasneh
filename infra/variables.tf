# Nasneh Infrastructure - Root Variables
# =======================================
# Common variables used across all environments.

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "nasneh"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "me-south-1" # AWS Bahrain
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
