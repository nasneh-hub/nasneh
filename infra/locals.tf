# Nasneh Infrastructure - Local Values
# =====================================
# Computed local values used across modules.

locals {
  # Resource naming convention: {project}-{environment}-{resource}
  name_prefix = "${var.project_name}-${var.environment}"

  # Common tags applied to all resources
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Repository  = "nasneh-hub/nasneh"
    },
    var.tags
  )

  # Environment-specific configurations
  is_production = var.environment == "production"
  is_staging    = var.environment == "staging"
}
