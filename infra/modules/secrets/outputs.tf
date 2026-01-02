# Nasneh Infrastructure - Secrets Module Outputs
# ===============================================
# Outputs for ECS task definition and IAM configuration.

# -----------------------------------------------------------------------------
# Secret ARNs (for ECS task definition secrets block)
# -----------------------------------------------------------------------------

output "api_secret_arn" {
  description = "ARN of the API application secrets"
  value       = aws_secretsmanager_secret.api.arn
}

output "database_secret_arn" {
  description = "ARN of the database credentials secret"
  value       = aws_secretsmanager_secret.database.arn
}

output "external_secret_arn" {
  description = "ARN of the external services secret"
  value       = aws_secretsmanager_secret.external.arn
}

# -----------------------------------------------------------------------------
# Secret Names (for reference)
# -----------------------------------------------------------------------------

output "api_secret_name" {
  description = "Name of the API application secrets"
  value       = aws_secretsmanager_secret.api.name
}

output "database_secret_name" {
  description = "Name of the database credentials secret"
  value       = aws_secretsmanager_secret.database.name
}

output "external_secret_name" {
  description = "Name of the external services secret"
  value       = aws_secretsmanager_secret.external.name
}

# -----------------------------------------------------------------------------
# IAM Policy (for ECS task execution role)
# -----------------------------------------------------------------------------

output "secrets_read_policy_arn" {
  description = "ARN of the IAM policy for reading secrets"
  value       = aws_iam_policy.secrets_read.arn
}

# -----------------------------------------------------------------------------
# All Secret ARNs (for convenience)
# -----------------------------------------------------------------------------

output "all_secret_arns" {
  description = "List of all secret ARNs for IAM policies"
  value = [
    aws_secretsmanager_secret.api.arn,
    aws_secretsmanager_secret.database.arn,
    aws_secretsmanager_secret.external.arn
  ]
}
