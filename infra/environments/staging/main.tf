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
# FUTURE MODULES (Placeholders)
# =============================================================================
# Uncomment as modules are implemented

# module "compute" {
#   source = "../../modules/compute"
#   ...
# }

# module "database" {
#   source = "../../modules/database"
#   ...
# }

# module "cache" {
#   source = "../../modules/cache"
#   ...
# }

# module "secrets" {
#   source = "../../modules/secrets"
#   ...
# }
