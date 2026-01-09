# Nasneh Infrastructure - Staging Environment
# ============================================
# Main configuration for the staging environment.

terraform {
  required_version = ">= 1.5.0"

  # Backend configuration for state management
  # Uncomment and configure when ready to use remote state
  # backend "s3" {
  #   bucket         = "nasneh-terraform-state"
  #   key            = "staging/terraform.tfstate"
  #   region         = "me-south-1"
  #   encrypt        = true
  #   dynamodb_table = "nasneh-terraform-locks"
  # }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# =============================================================================
# DNS - ROUTE53 HOSTED ZONE
# =============================================================================
# Reference existing hosted zone for nasneh.com (created manually in AWS Console)

data "aws_route53_zone" "main" {
  name         = "nasneh.com"
  private_zone = false
}

# =============================================================================
# SSL/TLS - ACM CERTIFICATE
# =============================================================================
# ACM certificate for api-staging.nasneh.com
# Certificate must be in the same region as ALB (me-south-1)

resource "aws_acm_certificate" "api" {
  domain_name       = "api-staging.nasneh.com"
  validation_method = "DNS"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-api-cert"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# DNS validation record for ACM certificate
resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for certificate validation
resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]
}

# Route53 A record for api-staging.nasneh.com pointing to ALB
resource "aws_route53_record" "api_staging" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api-staging.nasneh.com"
  type    = "A"

  alias {
    name                   = module.compute.alb_dns_name
    zone_id                = module.compute.alb_zone_id
    evaluate_target_health = true
  }
}

# =============================================================================
# SSL/TLS - FRONTEND CERTIFICATES
# =============================================================================

# ACM certificate for staging.nasneh.com (customer-web)
resource "aws_acm_certificate" "customer_web" {
  domain_name       = "staging.nasneh.com"
  validation_method = "DNS"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-customer-web-cert"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# DNS validation record for customer-web certificate
resource "aws_route53_record" "customer_web_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.customer_web.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for customer-web certificate validation
resource "aws_acm_certificate_validation" "customer_web" {
  certificate_arn         = aws_acm_certificate.customer_web.arn
  validation_record_fqdns = [for record in aws_route53_record.customer_web_cert_validation : record.fqdn]
}

# ACM certificate for staging-dashboard.nasneh.com (dashboard)
resource "aws_acm_certificate" "dashboard" {
  domain_name       = "staging-dashboard.nasneh.com"
  validation_method = "DNS"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-dashboard-cert"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# DNS validation record for dashboard certificate
resource "aws_route53_record" "dashboard_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.dashboard.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for dashboard certificate validation
resource "aws_acm_certificate_validation" "dashboard" {
  certificate_arn         = aws_acm_certificate.dashboard.arn
  validation_record_fqdns = [for record in aws_route53_record.dashboard_cert_validation : record.fqdn]
}

# =============================================================================
# ALB LISTENER CERTIFICATES (SNI)
# =============================================================================

resource "aws_lb_listener_certificate" "customer_web" {
  listener_arn    = module.compute.https_listener_arn
  certificate_arn = aws_acm_certificate_validation.customer_web.certificate_arn
}

resource "aws_lb_listener_certificate" "dashboard" {
  listener_arn    = module.compute.https_listener_arn
  certificate_arn = aws_acm_certificate_validation.dashboard.certificate_arn
}

# =============================================================================
# ROUTE53 - FRONTEND DNS RECORDS
# =============================================================================

# Route53 A record for staging.nasneh.com pointing to ALB
resource "aws_route53_record" "customer_web" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "staging.nasneh.com"
  type    = "A"

  alias {
    name                   = module.compute.alb_dns_name
    zone_id                = module.compute.alb_zone_id
    evaluate_target_health = true
  }
}

# Route53 A record for staging-dashboard.nasneh.com pointing to ALB
resource "aws_route53_record" "dashboard" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "staging-dashboard.nasneh.com"
  type    = "A"

  alias {
    name                   = module.compute.alb_dns_name
    zone_id                = module.compute.alb_zone_id
    evaluate_target_health = true
  }
}

# =============================================================================
# NETWORKING MODULE
# =============================================================================
# VPC, Subnets, Internet Gateway, NAT Gateway, Route Tables, Security Groups
# Region: me-south-1 (AWS Bahrain) - Using 2 AZs (a, b)

module "networking" {
  source = "../../modules/networking"

  name_prefix          = local.name_prefix
  vpc_cidr             = local.staging_config.vpc_cidr
  availability_zones   = ["me-south-1a", "me-south-1b"]
  public_subnet_cidrs  = local.staging_config.public_subnet_cidrs
  private_subnet_cidrs = local.staging_config.private_subnet_cidrs

  # NAT Gateway configuration
  # Single NAT for staging (cost-effective ~$32/month)
  # For production, set single_nat_gateway = false for HA
  enable_nat_gateway = true
  single_nat_gateway = true

  tags = local.common_tags
}

# =============================================================================
# DATABASE MODULE
# =============================================================================
# RDS PostgreSQL in private subnets only
# Security: Only accessible from API security group on port 5432

module "database" {
  source = "../../modules/database"

  name_prefix                = local.name_prefix
  vpc_id                     = module.networking.vpc_id
  private_subnet_ids         = module.networking.private_subnet_ids
  database_security_group_id = module.networking.database_security_group_id

  # Database configuration
  db_name     = "nasneh"
  db_username = var.db_username
  db_password = var.db_password

  # Instance configuration (staging - cost-effective)
  instance_class        = var.db_instance_class
  engine_version        = "15.10"  # Available in me-south-1
  allocated_storage     = local.staging_config.db_allocated_storage
  max_allocated_storage = local.staging_config.db_max_storage
  storage_type          = "gp3"

  # High availability (disabled for staging)
  multi_az = local.staging_config.db_multi_az

  # Backup configuration
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # Security (relaxed for staging)
  publicly_accessible   = false
  deletion_protection   = var.enable_deletion_protection
  skip_final_snapshot   = true

  tags = local.common_tags
}

# =============================================================================
# COMPUTE MODULE
# =============================================================================
# ECS Fargate + ALB for API deployment
# ALB in public subnets, ECS tasks in private subnets

module "compute" {
  source = "../../modules/compute"

  name_prefix = local.name_prefix
  aws_region  = var.aws_region

  # Networking
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  private_subnet_ids    = module.networking.private_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
  api_security_group_id = module.networking.api_security_group_id

  # Database connection (for environment variables)
  database_endpoint = module.database.endpoint
  database_name     = module.database.db_name

  # Container configuration (placeholder image until CI/CD builds real image)
  container_image  = "amazon/amazon-ecs-sample"
  container_port   = 3000
  container_cpu    = 256   # 0.25 vCPU
  container_memory = 512   # MB

  # Service configuration (minimal for staging)
  desired_count = local.staging_config.api_desired
  min_capacity  = local.staging_config.api_min_instances
  max_capacity  = local.staging_config.api_max_instances

  # Health check
  health_check_path = "/health"

  # SSL/TLS Configuration
  enable_https    = true
  certificate_arn = aws_acm_certificate_validation.api.certificate_arn

  # Environment variables (non-sensitive placeholders)
  environment_variables = {
    APP_NAME      = "nasneh-api"
    ENVIRONMENT   = var.environment
    # CORS: Frontend URLs (must match actual deployed URLs)
    FRONTEND_URL  = "https://staging.nasneh.com"
    DASHBOARD_URL = "https://staging-dashboard.nasneh.com"
  }

  # Secrets from Secrets Manager
  enable_secrets      = true
  api_secret_arn      = module.secrets.api_secret_arn
  database_secret_arn = module.secrets.database_secret_arn
  external_secret_arn = module.secrets.external_secret_arn

  # Frontend ECS Services (customer-web + dashboard)
  enable_frontend            = var.enable_frontend
  frontend_cpu               = 256
  frontend_memory            = 512
  frontend_desired_count     = 1
  customer_web_image         = var.customer_web_image
  dashboard_image            = var.dashboard_image
  customer_web_domain        = "staging.nasneh.com"
  dashboard_domain           = "staging-dashboard.nasneh.com"
  frontend_security_group_id = module.networking.frontend_security_group_id
  api_url                    = "https://api-staging.nasneh.com"

  tags = local.common_tags

  depends_on = [module.secrets]
}

# =============================================================================
# STORAGE MODULE
# =============================================================================
# S3 bucket for static assets + CloudFront CDN
# S3 has Block Public Access ON, only accessible via CloudFront OAC

module "storage" {
  source = "../../modules/storage"

  name_prefix = local.name_prefix
  aws_region  = var.aws_region

  # Feature toggles (set to false to disable)
  enable_storage = var.enable_storage
  enable_cdn     = var.enable_cdn

  # S3 configuration
  bucket_suffix             = "assets"
  force_destroy             = true  # Allow deletion for staging
  versioning_enabled        = true
  lifecycle_expiration_days = 90

  # CloudFront configuration
  price_class = "PriceClass_100"  # US, Canada, Europe - cheapest
  default_ttl = 86400             # 1 day
  max_ttl     = 604800            # 7 days
  compress    = true

  # Custom domain (optional - leave empty for now)
  # custom_domain       = "cdn.staging.nasneh.com"
  # acm_certificate_arn = "arn:aws:acm:us-east-1:xxx:certificate/xxx"

  tags = local.common_tags
}

# =============================================================================
# SECRETS MODULE
# =============================================================================
# AWS Secrets Manager for application secrets
# Secrets are injected into ECS tasks via ARN references

module "secrets" {
  source = "../../modules/secrets"

  name_prefix             = local.name_prefix
  environment             = var.environment
  recovery_window_in_days = 7  # 7 days for staging, 30 for production

  tags = local.common_tags
}


# =============================================================================
# MONITORING MODULE
# =============================================================================
# CloudWatch alarms, SNS notifications, and log retention
# Alerts for: CPU > 80%, Memory > 80%, 5XX errors, Running tasks < desired

module "monitoring" {
  source = "../../modules/monitoring"

  name_prefix = local.name_prefix
  environment = var.environment

  # ECS resources (for alarms)
  ecs_cluster_name   = module.compute.cluster_name
  ecs_service_name   = module.compute.service_name
  desired_task_count = local.staging_config.api_desired

  # ALB resources (for alarms)
  alb_arn_suffix          = module.compute.alb_arn_suffix
  target_group_arn_suffix = module.compute.target_group_arn_suffix

  # Log configuration
  log_retention_days      = 14  # 14 days for staging
  existing_log_group_name = module.compute.log_group_name

  # Alarm thresholds
  cpu_threshold_percent    = 80
  memory_threshold_percent = 80
  error_5xx_threshold      = 1

  # Notifications
  alert_email   = var.alert_email
  enable_alarms = var.enable_monitoring

  tags = local.common_tags

  depends_on = [module.compute]
}


# =============================================================================
# AMPLIFY MODULE
# =============================================================================
# AWS Amplify for frontend deployment (customer-web + dashboard)
# Note: After terraform apply, connect GitHub via AWS Console for auto-deploy

module "amplify" {
  source = "../../modules/amplify"

  name_prefix = local.name_prefix
  environment = var.environment

  # API URL for frontend apps
  api_url = "https://api-staging.nasneh.com/api/v1"

  # Custom domains (disabled initially - enable after verifying Amplify works)
  enable_custom_domains = false
  root_domain           = "nasneh.com"

  tags = local.common_tags

  depends_on = [aws_acm_certificate_validation.api]
}
