# Nasneh Monitoring Module

Terraform module for CloudWatch monitoring, alarms, and SNS notifications.

## Overview

This module creates:

- **SNS Topic** for alert notifications
- **CloudWatch Alarms** for ECS and ALB metrics
- **CloudWatch Dashboard** for visibility
- **Log Group** with retention policy

## Resources Created

| Resource | Description |
|----------|-------------|
| `aws_sns_topic` | Alert notification topic |
| `aws_sns_topic_subscription` | Email subscription (optional) |
| `aws_cloudwatch_log_group` | API logs with retention |
| `aws_cloudwatch_metric_alarm` | 4 alarms (CPU, Memory, 5XX, Tasks) |
| `aws_cloudwatch_dashboard` | Overview dashboard |

## Alarms

| Alarm | Metric | Threshold | Description |
|-------|--------|-----------|-------------|
| ECS CPU High | CPUUtilization | > 80% | CPU above threshold for 10 min |
| ECS Memory High | MemoryUtilization | > 80% | Memory above threshold for 10 min |
| ALB 5XX Errors | HTTPCode_Target_5XX_Count | >= 1 | Any 5XX errors in 5 min |
| Running Tasks Low | RunningTaskCount | < desired | Tasks below desired count |

## Usage

```hcl
module "monitoring" {
  source = "../../modules/monitoring"

  name_prefix  = "nasneh-staging"
  environment  = "staging"

  # ECS resources
  ecs_cluster_name   = module.compute.cluster_name
  ecs_service_name   = module.compute.service_name
  desired_task_count = 1

  # ALB resources
  alb_arn_suffix         = module.compute.alb_arn_suffix
  target_group_arn_suffix = module.compute.target_group_arn_suffix

  # Log configuration
  log_retention_days = 14

  # Notifications
  alert_email   = "alerts@nasneh.com"
  enable_alarms = true

  tags = local.common_tags
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| `name_prefix` | Prefix for resource names | `string` | - | yes |
| `environment` | Environment name | `string` | - | yes |
| `ecs_cluster_name` | ECS cluster name | `string` | - | yes |
| `ecs_service_name` | ECS service name | `string` | - | yes |
| `desired_task_count` | Desired ECS task count | `number` | `1` | no |
| `alb_arn_suffix` | ALB ARN suffix | `string` | - | yes |
| `target_group_arn_suffix` | Target group ARN suffix | `string` | - | yes |
| `log_retention_days` | Log retention in days | `number` | `14` | no |
| `cpu_threshold_percent` | CPU alarm threshold | `number` | `80` | no |
| `memory_threshold_percent` | Memory alarm threshold | `number` | `80` | no |
| `error_5xx_threshold` | 5XX error count threshold | `number` | `1` | no |
| `alert_email` | Email for notifications | `string` | `""` | no |
| `enable_alarms` | Enable CloudWatch alarms | `bool` | `true` | no |
| `tags` | Resource tags | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| `sns_topic_arn` | ARN of the SNS topic |
| `sns_topic_name` | Name of the SNS topic |
| `cpu_alarm_arn` | ARN of CPU alarm |
| `memory_alarm_arn` | ARN of memory alarm |
| `alb_5xx_alarm_arn` | ARN of 5XX alarm |
| `running_tasks_alarm_arn` | ARN of running tasks alarm |
| `dashboard_name` | CloudWatch dashboard name |
| `dashboard_url` | URL to CloudWatch dashboard |
| `log_group_name` | CloudWatch log group name |
| `log_retention_days` | Log retention period |

## Email Subscription

After `terraform apply`, check your email for SNS subscription confirmation.

**Important:** You must confirm the subscription to receive alerts.

## Dashboard

Access the CloudWatch dashboard at:

```
https://me-south-1.console.aws.amazon.com/cloudwatch/home?region=me-south-1#dashboards:name=nasneh-staging-overview
```

## Cost Estimate

| Resource | Monthly Cost |
|----------|--------------|
| SNS (1000 notifications) | ~$0.50 |
| CloudWatch Alarms (4) | ~$0.40 |
| CloudWatch Dashboard | ~$3.00 |
| CloudWatch Logs (1 GB) | ~$0.50 |
| **Total** | **~$4.40** |

## Alarm Response

### ECS CPU High

1. Check CloudWatch logs for high-CPU processes
2. Consider scaling up task CPU allocation
3. Review application for CPU-intensive operations

### ECS Memory High

1. Check for memory leaks in application
2. Consider scaling up task memory allocation
3. Review container metrics for OOM events

### ALB 5XX Errors

1. Check application logs for errors
2. Verify database connectivity
3. Check ECS task health
4. Review recent deployments

### Running Tasks Low

1. Check ECS service events for failures
2. Verify task definition is valid
3. Check for resource constraints
4. Review CloudWatch logs for crash reasons
