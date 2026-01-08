# Nasneh Infrastructure - Frontend ECS Services
# ==============================================
# ECS Fargate services for customer-web and dashboard Next.js apps.
# Shares the existing ECS cluster and ALB with the API.

# -----------------------------------------------------------------------------
# CloudWatch Log Groups
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "customer_web" {
  count = var.enable_frontend ? 1 : 0

  name              = "/ecs/${var.name_prefix}/customer-web"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-customer-web-logs"
    App  = "customer-web"
  })
}

resource "aws_cloudwatch_log_group" "dashboard" {
  count = var.enable_frontend ? 1 : 0

  name              = "/ecs/${var.name_prefix}/dashboard"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-dashboard-logs"
    App  = "dashboard"
  })
}

# -----------------------------------------------------------------------------
# ECS Task Definition - Customer Web
# -----------------------------------------------------------------------------
resource "aws_ecs_task_definition" "customer_web" {
  count = var.enable_frontend ? 1 : 0

  family                   = "${var.name_prefix}-customer-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "customer-web"
      image     = var.customer_web_image
      essential = true

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3000"
        },
        {
          name  = "NEXT_PUBLIC_API_URL"
          value = var.api_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.customer_web[0].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "customer-web"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-customer-web-task"
    App  = "customer-web"
  })
}

# -----------------------------------------------------------------------------
# ECS Task Definition - Dashboard
# -----------------------------------------------------------------------------
resource "aws_ecs_task_definition" "dashboard" {
  count = var.enable_frontend ? 1 : 0

  family                   = "${var.name_prefix}-dashboard"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "dashboard"
      image     = var.dashboard_image
      essential = true

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3000"
        },
        {
          name  = "NEXT_PUBLIC_API_URL"
          value = var.api_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.dashboard[0].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "dashboard"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-dashboard-task"
    App  = "dashboard"
  })
}

# -----------------------------------------------------------------------------
# Target Groups
# -----------------------------------------------------------------------------
resource "aws_lb_target_group" "customer_web" {
  count = var.enable_frontend ? 1 : 0

  name        = "${var.name_prefix}-cust-web-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 10
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200-399"
  }

  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-customer-web-tg"
    App  = "customer-web"
  })
}

resource "aws_lb_target_group" "dashboard" {
  count = var.enable_frontend ? 1 : 0

  name        = "${var.name_prefix}-dashboard-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 10
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200-399"
  }

  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-dashboard-tg"
    App  = "dashboard"
  })
}

# -----------------------------------------------------------------------------
# ALB Listener Rules (Host-based routing)
# -----------------------------------------------------------------------------
resource "aws_lb_listener_rule" "customer_web_http" {
  count = var.enable_frontend ? 1 : 0

  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.customer_web[0].arn
  }

  condition {
    host_header {
      values = [var.customer_web_domain]
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-customer-web-rule"
  })
}

resource "aws_lb_listener_rule" "dashboard_http" {
  count = var.enable_frontend ? 1 : 0

  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.dashboard[0].arn
  }

  condition {
    host_header {
      values = [var.dashboard_domain]
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-dashboard-rule"
  })
}

# HTTPS rules (when enabled)
resource "aws_lb_listener_rule" "customer_web_https" {
  count = var.enable_frontend && var.enable_https && length(aws_lb_listener.https) > 0 ? 1 : 0

  listener_arn = aws_lb_listener.https[0].arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.customer_web[0].arn
  }

  condition {
    host_header {
      values = [var.customer_web_domain]
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-customer-web-https-rule"
  })
}

resource "aws_lb_listener_rule" "dashboard_https" {
  count = var.enable_frontend && var.enable_https && length(aws_lb_listener.https) > 0 ? 1 : 0

  listener_arn = aws_lb_listener.https[0].arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.dashboard[0].arn
  }

  condition {
    host_header {
      values = [var.dashboard_domain]
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-dashboard-https-rule"
  })
}

# -----------------------------------------------------------------------------
# ECS Services
# -----------------------------------------------------------------------------
resource "aws_ecs_service" "customer_web" {
  count = var.enable_frontend ? 1 : 0

  name            = "${var.name_prefix}-customer-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.customer_web[0].arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.frontend_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.customer_web[0].arn
    container_name   = "customer-web"
    container_port   = 3000
  }

  health_check_grace_period_seconds = 120

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  enable_ecs_managed_tags = true
  propagate_tags          = "SERVICE"

  force_new_deployment = true

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-customer-web-service"
    App  = "customer-web"
  })

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "dashboard" {
  count = var.enable_frontend ? 1 : 0

  name            = "${var.name_prefix}-dashboard"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.dashboard[0].arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.frontend_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.dashboard[0].arn
    container_name   = "dashboard"
    container_port   = 3000
  }

  health_check_grace_period_seconds = 120

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  enable_ecs_managed_tags = true
  propagate_tags          = "SERVICE"

  force_new_deployment = true

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-dashboard-service"
    App  = "dashboard"
  })

  depends_on = [aws_lb_listener.http]
}
