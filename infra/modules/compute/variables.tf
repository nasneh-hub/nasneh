# Nasneh Infrastructure - Compute Module Variables
# =================================================
# Input variables for ECS Fargate + ALB module.

variable "name_prefix" {
  description = "Prefix for resource names (e.g., nasneh-staging)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for ECR and CloudWatch"
  type        = string
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------

variable "vpc_id" {
  description = "VPC ID where resources will be deployed"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for ALB"
  type        = string
}

variable "api_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

# -----------------------------------------------------------------------------
# Database Connection (for environment variables)
# -----------------------------------------------------------------------------

variable "database_endpoint" {
  description = "RDS endpoint (hostname:port)"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Database name"
  type        = string
}

# -----------------------------------------------------------------------------
# Container Configuration
# -----------------------------------------------------------------------------

variable "container_image" {
  description = "Docker image for the API container (ECR URI or placeholder)"
  type        = string
  default     = "amazon/amazon-ecs-sample" # Placeholder until CI/CD builds real image
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "container_cpu" {
  description = "CPU units for the container (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "Memory for the container in MB"
  type        = number
  default     = 512
}

# -----------------------------------------------------------------------------
# Service Configuration
# -----------------------------------------------------------------------------

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "min_capacity" {
  description = "Minimum number of ECS tasks for autoscaling"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of ECS tasks for autoscaling"
  type        = number
  default     = 2
}

# -----------------------------------------------------------------------------
# Health Check Configuration
# -----------------------------------------------------------------------------

variable "health_check_path" {
  description = "Path for ALB health checks"
  type        = string
  default     = "/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

variable "healthy_threshold" {
  description = "Number of consecutive health checks to be considered healthy"
  type        = number
  default     = 2
}

variable "unhealthy_threshold" {
  description = "Number of consecutive health checks to be considered unhealthy"
  type        = number
  default     = 3
}

# -----------------------------------------------------------------------------
# Environment Variables (Placeholders - real values via Secrets Manager)
# -----------------------------------------------------------------------------

variable "environment_variables" {
  description = "Environment variables for the container (non-sensitive)"
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
