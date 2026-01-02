# Nasneh Infrastructure - Database Module Variables
# ==================================================
# Input variables for the RDS PostgreSQL module.

variable "name_prefix" {
  description = "Prefix for resource names (e.g., nasneh-staging)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the database will be deployed"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "database_security_group_id" {
  description = "Security group ID for the database (allows 5432 from API SG)"
  type        = string
}

# -----------------------------------------------------------------------------
# Database Configuration
# -----------------------------------------------------------------------------

variable "db_name" {
  description = "Name of the database to create"
  type        = string
  default     = "nasneh"
}

variable "db_username" {
  description = "Master username for the database (do not commit actual value)"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Master password for the database (do not commit actual value)"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Port for the database"
  type        = number
  default     = 5432
}

# -----------------------------------------------------------------------------
# Instance Configuration
# -----------------------------------------------------------------------------

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.10"  # Available in me-south-1
}

variable "allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage for autoscaling in GB (0 to disable)"
  type        = number
  default     = 50
}

variable "storage_type" {
  description = "Storage type (gp2, gp3, io1)"
  type        = string
  default     = "gp3"
}

# -----------------------------------------------------------------------------
# High Availability & Backup
# -----------------------------------------------------------------------------

variable "multi_az" {
  description = "Enable Multi-AZ deployment for high availability"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Number of days to retain automated backups (0 to disable)"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Preferred backup window (UTC)"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Preferred maintenance window (UTC)"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

# -----------------------------------------------------------------------------
# Security & Access
# -----------------------------------------------------------------------------

variable "publicly_accessible" {
  description = "Whether the database is publicly accessible (should be false)"
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "Enable deletion protection (disable for staging)"
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion (enable for staging)"
  type        = bool
  default     = true
}

variable "final_snapshot_identifier" {
  description = "Identifier for final snapshot (if skip_final_snapshot is false)"
  type        = string
  default     = null
}

# -----------------------------------------------------------------------------
# Monitoring & Performance
# -----------------------------------------------------------------------------

variable "performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = false
}

variable "monitoring_interval" {
  description = "Enhanced monitoring interval in seconds (0 to disable)"
  type        = number
  default     = 0
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
