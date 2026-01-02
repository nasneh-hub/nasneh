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

# Include root module configurations
module "root" {
  source = "../../"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  tags         = var.tags
}
