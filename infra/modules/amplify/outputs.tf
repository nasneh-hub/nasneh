# =============================================================================
# AWS AMPLIFY MODULE - OUTPUTS
# =============================================================================

# -----------------------------------------------------------------------------
# Customer Web Outputs
# -----------------------------------------------------------------------------
output "customer_web_app_id" {
  description = "Amplify App ID for customer-web"
  value       = aws_amplify_app.customer_web.id
}

output "customer_web_app_arn" {
  description = "Amplify App ARN for customer-web"
  value       = aws_amplify_app.customer_web.arn
}

output "customer_web_default_domain" {
  description = "Default Amplify domain for customer-web"
  value       = aws_amplify_app.customer_web.default_domain
}

output "customer_web_staging_url" {
  description = "Staging URL for customer-web (develop branch)"
  value       = "https://develop.${aws_amplify_app.customer_web.default_domain}"
}

# -----------------------------------------------------------------------------
# Dashboard Outputs
# -----------------------------------------------------------------------------
output "dashboard_app_id" {
  description = "Amplify App ID for dashboard"
  value       = aws_amplify_app.dashboard.id
}

output "dashboard_app_arn" {
  description = "Amplify App ARN for dashboard"
  value       = aws_amplify_app.dashboard.arn
}

output "dashboard_default_domain" {
  description = "Default Amplify domain for dashboard"
  value       = aws_amplify_app.dashboard.default_domain
}

output "dashboard_staging_url" {
  description = "Staging URL for dashboard (develop branch)"
  value       = "https://develop.${aws_amplify_app.dashboard.default_domain}"
}

# -----------------------------------------------------------------------------
# Custom Domain Outputs (when enabled)
# -----------------------------------------------------------------------------
output "customer_web_custom_domain_status" {
  description = "Custom domain association status for customer-web"
  value       = var.enable_custom_domains ? aws_amplify_domain_association.customer_web[0].domain_status : "not_enabled"
}

output "dashboard_custom_domain_status" {
  description = "Custom domain association status for dashboard"
  value       = var.enable_custom_domains ? aws_amplify_domain_association.dashboard[0].domain_status : "not_enabled"
}

# -----------------------------------------------------------------------------
# Summary Output
# -----------------------------------------------------------------------------
output "amplify_apps_summary" {
  description = "Summary of all Amplify apps and their URLs"
  value = {
    customer_web = {
      app_id      = aws_amplify_app.customer_web.id
      staging_url = "https://develop.${aws_amplify_app.customer_web.default_domain}"
    }
    dashboard = {
      app_id      = aws_amplify_app.dashboard.id
      staging_url = "https://develop.${aws_amplify_app.dashboard.default_domain}"
    }
  }
}
