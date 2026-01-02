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
  engine_version        = "15.4"
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

  # Environment variables (non-sensitive placeholders)
  environment_variables = {
    APP_NAME    = "nasneh-api"
    ENVIRONMENT = var.environment
  }

  tags = local.common_tags
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
# FUTURE MODULES (Placeholders)
# =============================================================================
# Uncomment as modules are implemented

# module "secrets" {
#   source = "../../modules/secrets"
#   ...
# }
