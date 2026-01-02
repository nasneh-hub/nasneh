# Nasneh Infrastructure - Monitoring Module Outputs
# ==================================================
# Outputs for SNS topic and alarm ARNs.

# -----------------------------------------------------------------------------
# SNS Topic
# -----------------------------------------------------------------------------
output "sns_topic_arn" {
  description = "ARN of the SNS topic for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "sns_topic_name" {
  description = "Name of the SNS topic for alerts"
  value       = aws_sns_topic.alerts.name
}

# -----------------------------------------------------------------------------
# CloudWatch Alarms
# -----------------------------------------------------------------------------
output "cpu_alarm_arn" {
  description = "ARN of the ECS CPU utilization alarm"
  value       = var.enable_alarms ? aws_cloudwatch_metric_alarm.ecs_cpu_high[0].arn : null
}

output "memory_alarm_arn" {
  description = "ARN of the ECS memory utilization alarm"
  value       = var.enable_alarms ? aws_cloudwatch_metric_alarm.ecs_memory_high[0].arn : null
}

output "alb_5xx_alarm_arn" {
  description = "ARN of the ALB 5XX errors alarm"
  value       = var.enable_alarms ? aws_cloudwatch_metric_alarm.alb_5xx_errors[0].arn : null
}

output "running_tasks_alarm_arn" {
  description = "ARN of the ECS running tasks alarm"
  value       = var.enable_alarms ? aws_cloudwatch_metric_alarm.ecs_running_tasks_low[0].arn : null
}

# -----------------------------------------------------------------------------
# CloudWatch Dashboard
# -----------------------------------------------------------------------------
output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "dashboard_url" {
  description = "URL to the CloudWatch dashboard"
  value       = "https://${data.aws_region.current.name}.console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

# -----------------------------------------------------------------------------
# Log Group
# -----------------------------------------------------------------------------
output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = var.existing_log_group_name != "" ? var.existing_log_group_name : aws_cloudwatch_log_group.api[0].name
}

output "log_retention_days" {
  description = "Log retention period in days"
  value       = var.log_retention_days
}
