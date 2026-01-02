# Nasneh Infrastructure - Secrets Module
# =======================================
# AWS Secrets Manager for application secrets.
#
# Design Decision: Single JSON blob per category
# ----------------------------------------------
# We use a single secret with JSON blob for related secrets because:
# 1. Fewer API calls (one GetSecretValue vs multiple)
# 2. Easier rotation (rotate all related secrets together)
# 3. Lower cost ($0.40/secret/month)
# 4. Simpler IAM policies
#
# Categories:
# - nasneh/{env}/api: Application secrets (JWT, OTP, etc.)
# - nasneh/{env}/database: Database credentials
# - nasneh/{env}/external: External service keys (WhatsApp, SMS)

# -----------------------------------------------------------------------------
# API Application Secrets
# -----------------------------------------------------------------------------
# Contains: JWT_SECRET, OTP_SECRET, REDIS_URL
resource "aws_secretsmanager_secret" "api" {
  name                    = "${var.name_prefix}/api"
  description             = "Nasneh API application secrets (JWT, OTP, Redis)"
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name        = "${var.name_prefix}-api-secrets"
    Category    = "application"
    Environment = var.environment
  })
}

# Initial placeholder values - MUST be updated before deploy
resource "aws_secretsmanager_secret_version" "api" {
  secret_id = aws_secretsmanager_secret.api.id
  secret_string = jsonencode({
    JWT_SECRET        = "CHANGE_ME_BEFORE_DEPLOY_MIN_32_CHARS"
    JWT_REFRESH_SECRET = "CHANGE_ME_BEFORE_DEPLOY_MIN_32_CHARS"
    OTP_SECRET        = "CHANGE_ME_BEFORE_DEPLOY_MIN_32_CHARS"
    REDIS_URL         = "redis://localhost:6379"
  })

  lifecycle {
    # Ignore changes to secret_string after initial creation
    # Secrets should be updated via AWS Console or CLI, not Terraform
    ignore_changes = [secret_string]
  }
}

# -----------------------------------------------------------------------------
# Database Credentials
# -----------------------------------------------------------------------------
# Contains: DATABASE_URL, DB_USERNAME, DB_PASSWORD
resource "aws_secretsmanager_secret" "database" {
  name                    = "${var.name_prefix}/database"
  description             = "Nasneh database credentials"
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name        = "${var.name_prefix}-database-secrets"
    Category    = "database"
    Environment = var.environment
  })
}

# Initial placeholder values - MUST be updated before deploy
resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id
  secret_string = jsonencode({
    DB_USERNAME  = "nasneh_app"
    DB_PASSWORD  = "CHANGE_ME_BEFORE_DEPLOY"
    DATABASE_URL = "postgresql://nasneh_app:CHANGE_ME@localhost:5432/nasneh"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# -----------------------------------------------------------------------------
# External Service Keys
# -----------------------------------------------------------------------------
# Contains: WhatsApp API, SMS API credentials
resource "aws_secretsmanager_secret" "external" {
  name                    = "${var.name_prefix}/external"
  description             = "Nasneh external service API keys (WhatsApp, SMS)"
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name        = "${var.name_prefix}-external-secrets"
    Category    = "external"
    Environment = var.environment
  })
}

# Initial placeholder values - MUST be updated before deploy
resource "aws_secretsmanager_secret_version" "external" {
  secret_id = aws_secretsmanager_secret.external.id
  secret_string = jsonencode({
    WHATSAPP_API_URL   = "https://api.whatsapp.example.com"
    WHATSAPP_API_TOKEN = "CHANGE_ME_BEFORE_DEPLOY"
    SMS_API_URL        = "https://api.sms.example.com"
    SMS_API_KEY        = "CHANGE_ME_BEFORE_DEPLOY"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# -----------------------------------------------------------------------------
# IAM Policy for ECS Task to Read Secrets
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "secrets_read" {
  statement {
    sid    = "GetSecretValues"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = [
      aws_secretsmanager_secret.api.arn,
      aws_secretsmanager_secret.database.arn,
      aws_secretsmanager_secret.external.arn
    ]
  }
}

resource "aws_iam_policy" "secrets_read" {
  name        = "${var.name_prefix}-secrets-read"
  description = "Allow ECS tasks to read secrets from Secrets Manager"
  policy      = data.aws_iam_policy_document.secrets_read.json

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-secrets-read-policy"
  })
}
