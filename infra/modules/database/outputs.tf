# Nasneh Infrastructure - Database Module Outputs
# ================================================
# Outputs for use by compute module (ECS tasks)

# -----------------------------------------------------------------------------
# Connection Outputs
# -----------------------------------------------------------------------------
output "endpoint" {
  description = "RDS instance endpoint (hostname:port)"
  value       = aws_db_instance.main.endpoint
}

output "address" {
  description = "RDS instance hostname (without port)"
  value       = aws_db_instance.main.address
}

output "port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

# -----------------------------------------------------------------------------
# Database Outputs
# -----------------------------------------------------------------------------
output "db_name" {
  description = "Name of the database"
  value       = aws_db_instance.main.db_name
}

output "db_identifier" {
  description = "RDS instance identifier"
  value       = aws_db_instance.main.identifier
}

output "db_arn" {
  description = "ARN of the RDS instance"
  value       = aws_db_instance.main.arn
}

# -----------------------------------------------------------------------------
# Resource Outputs
# -----------------------------------------------------------------------------
output "db_subnet_group_name" {
  description = "Name of the DB subnet group"
  value       = aws_db_subnet_group.main.name
}

output "db_parameter_group_name" {
  description = "Name of the DB parameter group"
  value       = aws_db_parameter_group.main.name
}

# -----------------------------------------------------------------------------
# Connection String Template
# -----------------------------------------------------------------------------
output "connection_string_template" {
  description = "PostgreSQL connection string template (replace USER and PASSWORD)"
  value       = "postgresql://USER:PASSWORD@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
}
