# Nasneh Infrastructure - Compute Module ECS
# ===========================================
# ECS Fargate cluster, service, and task definition.

# -----------------------------------------------------------------------------
# ECS Cluster
# -----------------------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-cluster"
  })
}

# -----------------------------------------------------------------------------
# CloudWatch Log Group
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.name_prefix}/api"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-api-logs"
  })
}

# -----------------------------------------------------------------------------
# ECS Task Definition
# -----------------------------------------------------------------------------
resource "aws_ecs_task_definition" "api" {
  family                   = "${var.name_prefix}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = var.container_image
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = concat(
        [
          {
            name  = "NODE_ENV"
            value = "production"
          },
          {
            name  = "PORT"
            value = tostring(var.container_port)
          },
          {
            name  = "DATABASE_HOST"
            value = split(":", var.database_endpoint)[0]
          },
          {
            name  = "DATABASE_PORT"
            value = "5432"
          },
          {
            name  = "DATABASE_NAME"
            value = var.database_name
          }
        ],
        [for k, v in var.environment_variables : { name = k, value = v }]
      )

      # Secrets will be injected via Secrets Manager (configured in separate task)
      # secrets = [
      #   {
      #     name      = "DATABASE_URL"
      #     valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.name_prefix}/database-url"
      #   }
      # ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "api"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.container_port}${var.health_check_path} || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-api-task"
  })
}

# -----------------------------------------------------------------------------
# ECS Service
# -----------------------------------------------------------------------------
resource "aws_ecs_service" "api" {
  name            = "${var.name_prefix}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.api_security_group_id]
    assign_public_ip = false # Private subnets, use NAT Gateway
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.container_port
  }

  # Allow service to stabilize before marking unhealthy
  health_check_grace_period_seconds = 60

  # Deployment configuration
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  # Enable ECS managed tags
  enable_ecs_managed_tags = true
  propagate_tags          = "SERVICE"

  # Force new deployment on task definition change
  force_new_deployment = true

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-api-service"
  })

  depends_on = [aws_lb_listener.http]
}
