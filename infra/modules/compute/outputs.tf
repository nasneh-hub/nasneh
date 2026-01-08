# Nasneh Infrastructure - Compute Module Outputs
# ===============================================
# Outputs for use by other modules and CI/CD.

# -----------------------------------------------------------------------------
# ALB Outputs
# -----------------------------------------------------------------------------
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.api.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer (for Route53)"
  value       = aws_lb.api.zone_id
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.api.arn
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.api.arn
}

output "https_listener_arn" {
  description = "ARN of the HTTPS listener"
  value       = length(aws_lb_listener.https) > 0 ? aws_lb_listener.https[0].arn : null
}

# -----------------------------------------------------------------------------
# ECS Outputs
# -----------------------------------------------------------------------------
output "cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.api.name
}

output "task_definition_arn" {
  description = "ARN of the task definition"
  value       = aws_ecs_task_definition.api.arn
}

# -----------------------------------------------------------------------------
# ECR Outputs
# -----------------------------------------------------------------------------
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.api.arn
}

# -----------------------------------------------------------------------------
# IAM Outputs
# -----------------------------------------------------------------------------
output "task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task.arn
}

# -----------------------------------------------------------------------------
# CloudWatch Outputs
# -----------------------------------------------------------------------------
output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.api.name
}

# -----------------------------------------------------------------------------
# API Endpoint
# -----------------------------------------------------------------------------
output "api_endpoint" {
  description = "HTTP endpoint for the API (use HTTPS in production)"
  value       = "http://${aws_lb.api.dns_name}"
}


# -----------------------------------------------------------------------------
# ARN Suffixes (for CloudWatch metrics)
# -----------------------------------------------------------------------------
output "alb_arn_suffix" {
  description = "ARN suffix of the ALB (for CloudWatch metrics)"
  value       = aws_lb.api.arn_suffix
}

output "target_group_arn_suffix" {
  description = "ARN suffix of the target group (for CloudWatch metrics)"
  value       = aws_lb_target_group.api.arn_suffix
}

# -----------------------------------------------------------------------------
# Frontend Outputs
# -----------------------------------------------------------------------------
output "customer_web_service_name" {
  description = "Name of the customer-web ECS service"
  value       = var.enable_frontend ? aws_ecs_service.customer_web[0].name : null
}

output "dashboard_service_name" {
  description = "Name of the dashboard ECS service"
  value       = var.enable_frontend ? aws_ecs_service.dashboard[0].name : null
}

output "customer_web_target_group_arn" {
  description = "ARN of the customer-web target group"
  value       = var.enable_frontend ? aws_lb_target_group.customer_web[0].arn : null
}

output "dashboard_target_group_arn" {
  description = "ARN of the dashboard target group"
  value       = var.enable_frontend ? aws_lb_target_group.dashboard[0].arn : null
}
