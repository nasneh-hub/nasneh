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

# -----------------------------------------------------------------------------
# Secrets Configuration (from Secrets Manager)
# -----------------------------------------------------------------------------

variable "api_secret_arn" {
  description = "ARN of the API application secrets in Secrets Manager"
  type        = string
  default     = ""
}

variable "database_secret_arn" {
  description = "ARN of the database credentials secret in Secrets Manager"
  type        = string
  default     = ""
}

variable "external_secret_arn" {
  description = "ARN of the external services secret in Secrets Manager"
  type        = string
  default     = ""
}

variable "enable_secrets" {
  description = "Whether to inject secrets from Secrets Manager into ECS tasks"
  type        = bool
  default     = false
}
# -----------------------------------------------------------------------------
# SSL/TLS Configuration
# -----------------------------------------------------------------------------

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS listener (leave empty to disable HTTPS)"
  type        = string
  default     = ""
}

variable "enable_https" {
  description = "Whether to enable HTTPS listener on ALB"
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# Frontend Variables
# -----------------------------------------------------------------------------
variable "enable_frontend" {
  description = "Enable frontend ECS services (customer-web and dashboard)"
  type        = bool
  default     = false
}

variable "frontend_cpu" {
  description = "CPU units for frontend containers (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend containers in MB"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend container instances"
  type        = number
  default     = 1
}

variable "customer_web_image" {
  description = "Docker image for customer-web app"
  type        = string
  default     = ""
}

variable "dashboard_image" {
  description = "Docker image for dashboard app"
  type        = string
  default     = ""
}

variable "customer_web_domain" {
  description = "Domain for customer-web app (for ALB host-based routing)"
  type        = string
  default     = "staging.nasneh.com"
}

variable "dashboard_domain" {
  description = "Domain for dashboard app (for ALB host-based routing)"
  type        = string
  default     = "staging-dashboard.nasneh.com"
}

variable "frontend_security_group_id" {
  description = "Security group ID for frontend services"
  type        = string
  default     = ""
}

variable "api_url" {
  description = "API URL for frontend apps"
  type        = string
  default     = ""
}
