# Nasneh Infrastructure - Database Module
# ========================================
# RDS PostgreSQL for staging/production environments
# Region: AWS Bahrain (me-south-1)

# -----------------------------------------------------------------------------
# DB Subnet Group
# Places RDS in private subnets only
# -----------------------------------------------------------------------------
resource "aws_db_subnet_group" "main" {
  name        = "${var.name_prefix}-db-subnet-group"
  description = "DB subnet group for ${var.name_prefix}"
  subnet_ids  = var.private_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-db-subnet-group"
  })
}

# -----------------------------------------------------------------------------
# DB Parameter Group
# PostgreSQL 15 optimized settings
# -----------------------------------------------------------------------------
resource "aws_db_parameter_group" "main" {
  name        = "${var.name_prefix}-pg15-params"
  family      = "postgres15"
  description = "PostgreSQL 15 parameter group for ${var.name_prefix}"

  # Connection settings (static parameter - requires reboot)
  parameter {
    name         = "max_connections"
    value        = "100"
    apply_method = "pending-reboot"
  }

  # Logging settings
  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries taking more than 1 second
  }

  # Timezone
  parameter {
    name  = "timezone"
    value = "Asia/Bahrain"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-pg15-params"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# RDS PostgreSQL Instance
# -----------------------------------------------------------------------------
resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-postgres"

  # Engine configuration
  engine               = "postgres"
  engine_version       = var.engine_version
  instance_class       = var.instance_class
  parameter_group_name = aws_db_parameter_group.main.name

  # Storage configuration
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = var.storage_type
  storage_encrypted     = true

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = var.db_port

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.database_security_group_id]
  publicly_accessible    = var.publicly_accessible
  multi_az               = var.multi_az

  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window
  copy_tags_to_snapshot   = true

  # Security configuration
  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : var.final_snapshot_identifier

  # Monitoring configuration
  performance_insights_enabled = var.performance_insights_enabled
  monitoring_interval          = var.monitoring_interval

  # Upgrade configuration
  auto_minor_version_upgrade  = true
  allow_major_version_upgrade = false

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-postgres"
  })
}
