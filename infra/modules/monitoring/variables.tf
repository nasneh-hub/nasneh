# Nasneh Infrastructure - Monitoring Module Variables
# ====================================================
# Input variables for CloudWatch alarms and SNS notifications.

# -----------------------------------------------------------------------------
# General
# -----------------------------------------------------------------------------
variable "name_prefix" {
  description = "Prefix for resource names (e.g., nasneh-staging)"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# -----------------------------------------------------------------------------
# ECS Resources (for alarms)
# -----------------------------------------------------------------------------
variable "ecs_cluster_name" {
  description = "Name of the ECS cluster to monitor"
  type        = string
}

variable "ecs_service_name" {
  description = "Name of the ECS service to monitor"
  type        = string
}

variable "desired_task_count" {
  description = "Desired number of ECS tasks (for running count alarm)"
  type        = number
  default     = 1
}

# -----------------------------------------------------------------------------
# ALB Resources (for alarms)
# -----------------------------------------------------------------------------
variable "alb_arn_suffix" {
  description = "ARN suffix of the ALB (for CloudWatch metrics)"
  type        = string
}

variable "target_group_arn_suffix" {
  description = "ARN suffix of the target group (for CloudWatch metrics)"
  type        = string
}

# -----------------------------------------------------------------------------
# Log Configuration
# -----------------------------------------------------------------------------
variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 14
}

variable "existing_log_group_name" {
  description = "Name of existing log group (if any) to update retention"
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Alarm Thresholds
# -----------------------------------------------------------------------------
variable "cpu_threshold_percent" {
  description = "CPU utilization threshold for alarm (percent)"
  type        = number
  default     = 80
}

variable "memory_threshold_percent" {
  description = "Memory utilization threshold for alarm (percent)"
  type        = number
  default     = 80
}

variable "error_5xx_threshold" {
  description = "Number of 5XX errors to trigger alarm"
  type        = number
  default     = 1
}

# -----------------------------------------------------------------------------
# Notifications
# -----------------------------------------------------------------------------
variable "alert_email" {
  description = "Email address for alarm notifications (leave empty to skip subscription)"
  type        = string
  default     = ""
}

variable "enable_alarms" {
  description = "Whether to enable CloudWatch alarms"
  type        = bool
  default     = true
}
