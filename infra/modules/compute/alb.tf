# Nasneh Infrastructure - Compute Module ALB
# ===========================================
# Application Load Balancer for API traffic.

# -----------------------------------------------------------------------------
# Application Load Balancer
# -----------------------------------------------------------------------------
resource "aws_lb" "api" {
  name               = "${var.name_prefix}-api-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false # Disabled for staging

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-api-alb"
  })
}

# -----------------------------------------------------------------------------
# Target Group
# -----------------------------------------------------------------------------
resource "aws_lb_target_group" "api" {
  name        = "${var.name_prefix}-api-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Required for Fargate

  health_check {
    enabled             = true
    healthy_threshold   = var.healthy_threshold
    unhealthy_threshold = var.unhealthy_threshold
    interval            = var.health_check_interval
    timeout             = var.health_check_timeout
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200"
  }

  # Deregistration delay (faster for staging)
  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-api-tg"
  })
}

# -----------------------------------------------------------------------------
# HTTP Listener (Port 80)
# In production, redirect to HTTPS. For staging, forward directly.
# -----------------------------------------------------------------------------
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-http-listener"
  })
}

# -----------------------------------------------------------------------------
# HTTPS Listener (Port 443) - Placeholder
# Uncomment when SSL certificate is configured
# -----------------------------------------------------------------------------
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.api.arn
#   port              = 443
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
#   certificate_arn   = var.certificate_arn
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.api.arn
#   }
# }
