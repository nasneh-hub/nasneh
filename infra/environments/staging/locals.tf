# Nasneh Infrastructure - Staging Locals
# =======================================
# Local values for the staging environment.

locals {
  # Resource naming convention
  name_prefix = "${var.project_name}-${var.environment}"

  # Common tags for all staging resources
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Repository  = "nasneh-hub/nasneh"
  }

  # Staging-specific configurations
  # These can be overridden via tfvars
  staging_config = {
    # Networking
    vpc_cidr             = "10.0.0.0/16"
    public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
    private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]

    # Compute
    api_min_instances = 1
    api_max_instances = 2
    api_desired       = 1

    # Database
    db_allocated_storage = 20
    db_max_storage       = 50
    db_multi_az          = false # Single AZ for staging

    # Cache
    redis_node_type      = "cache.t3.micro"
    redis_num_cache_nodes = 1

    # Domain
    domain_name = "staging.nasneh.com"
  }
}
