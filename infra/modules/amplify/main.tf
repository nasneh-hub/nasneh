# =============================================================================
# AWS AMPLIFY MODULE
# =============================================================================
# This module creates AWS Amplify apps for frontend deployment.
# Note: GitHub OAuth connection must be set up manually in AWS Console first,
# then the access_token can be used here.
#
# For initial setup without access_token, apps are created but not connected
# to GitHub. Manual connection via AWS Console is required.
# =============================================================================

# -----------------------------------------------------------------------------
# Customer Web App
# -----------------------------------------------------------------------------
resource "aws_amplify_app" "customer_web" {
  name        = "${var.name_prefix}-customer-web"
  description = "Nasneh Customer Web Application"
  platform    = "WEB_COMPUTE"  # Required for Next.js SSR

  # Build settings from amplify.yml in the repository
  build_spec = <<-EOT
version: 1
applications:
  - appRoot: apps/customer-web
    frontend:
      phases:
        preBuild:
          commands:
            - cd ../..
            - corepack enable
            - corepack prepare pnpm@8.15.0 --activate
            - pnpm install --frozen-lockfile
        build:
          commands:
            - cd ../..
            - pnpm turbo run build --filter=@nasneh/customer-web
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - ../../node_modules/**/*
          - ../../.pnpm-store/**/*
          - .next/cache/**/*
EOT

  # Environment variables
  environment_variables = {
    NEXT_PUBLIC_API_URL = var.api_url
    NEXT_PUBLIC_APP_ENV = var.environment
  }

  # Auto branch creation settings
  enable_auto_branch_creation   = false
  enable_branch_auto_build      = true
  enable_branch_auto_deletion   = false

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-customer-web"
    App  = "customer-web"
  })
}

# Customer Web - Develop Branch (Staging)
resource "aws_amplify_branch" "customer_web_develop" {
  app_id      = aws_amplify_app.customer_web.id
  branch_name = "develop"
  stage       = "DEVELOPMENT"

  display_name = "Staging"
  description  = "Staging environment - auto-deploy from develop branch"

  enable_auto_build = true

  environment_variables = {
    NEXT_PUBLIC_APP_ENV = "staging"
  }

  tags = merge(var.tags, {
    Environment = "staging"
  })
}

# Customer Web - Main Branch (Production) - Created but not enabled yet
resource "aws_amplify_branch" "customer_web_main" {
  app_id      = aws_amplify_app.customer_web.id
  branch_name = "main"
  stage       = "PRODUCTION"

  display_name = "Production"
  description  = "Production environment - manual deploy from main branch"

  enable_auto_build = false  # Manual deploy for production

  environment_variables = {
    NEXT_PUBLIC_APP_ENV = "production"
  }

  tags = merge(var.tags, {
    Environment = "production"
  })
}

# -----------------------------------------------------------------------------
# Dashboard App
# -----------------------------------------------------------------------------
resource "aws_amplify_app" "dashboard" {
  name        = "${var.name_prefix}-dashboard"
  description = "Nasneh Dashboard Application"
  platform    = "WEB_COMPUTE"  # Required for Next.js SSR

  # Build settings from amplify.yml in the repository
  build_spec = <<-EOT
version: 1
applications:
  - appRoot: apps/dashboard
    frontend:
      phases:
        preBuild:
          commands:
            - cd ../..
            - corepack enable
            - corepack prepare pnpm@8.15.0 --activate
            - pnpm install --frozen-lockfile
        build:
          commands:
            - cd ../..
            - pnpm turbo run build --filter=@nasneh/dashboard
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - ../../node_modules/**/*
          - ../../.pnpm-store/**/*
          - .next/cache/**/*
EOT

  # Environment variables
  environment_variables = {
    NEXT_PUBLIC_API_URL = var.api_url
    NEXT_PUBLIC_APP_ENV = var.environment
  }

  # Auto branch creation settings
  enable_auto_branch_creation   = false
  enable_branch_auto_build      = true
  enable_branch_auto_deletion   = false

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-dashboard"
    App  = "dashboard"
  })
}

# Dashboard - Develop Branch (Staging)
resource "aws_amplify_branch" "dashboard_develop" {
  app_id      = aws_amplify_app.dashboard.id
  branch_name = "develop"
  stage       = "DEVELOPMENT"

  display_name = "Staging"
  description  = "Staging environment - auto-deploy from develop branch"

  enable_auto_build = true

  environment_variables = {
    NEXT_PUBLIC_APP_ENV = "staging"
  }

  tags = merge(var.tags, {
    Environment = "staging"
  })
}

# Dashboard - Main Branch (Production) - Created but not enabled yet
resource "aws_amplify_branch" "dashboard_main" {
  app_id      = aws_amplify_app.dashboard.id
  branch_name = "main"
  stage       = "PRODUCTION"

  display_name = "Production"
  description  = "Production environment - manual deploy from main branch"

  enable_auto_build = false  # Manual deploy for production

  environment_variables = {
    NEXT_PUBLIC_APP_ENV = "production"
  }

  tags = merge(var.tags, {
    Environment = "production"
  })
}

# -----------------------------------------------------------------------------
# Domain Association - Customer Web
# -----------------------------------------------------------------------------
resource "aws_amplify_domain_association" "customer_web" {
  count = var.enable_custom_domains ? 1 : 0

  app_id      = aws_amplify_app.customer_web.id
  domain_name = var.root_domain  # nasneh.com

  # Staging subdomain
  sub_domain {
    branch_name = aws_amplify_branch.customer_web_develop.branch_name
    prefix      = "staging"  # staging.nasneh.com
  }

  # Production (root domain) - uncomment when ready
  # sub_domain {
  #   branch_name = aws_amplify_branch.customer_web_main.branch_name
  #   prefix      = ""  # nasneh.com
  # }

  wait_for_verification = false
}

# -----------------------------------------------------------------------------
# Domain Association - Dashboard
# -----------------------------------------------------------------------------
resource "aws_amplify_domain_association" "dashboard" {
  count = var.enable_custom_domains ? 1 : 0

  app_id      = aws_amplify_app.dashboard.id
  domain_name = var.root_domain  # nasneh.com

  # Staging subdomain
  sub_domain {
    branch_name = aws_amplify_branch.dashboard_develop.branch_name
    prefix      = "staging-dashboard"  # staging-dashboard.nasneh.com
  }

  # Production subdomain - uncomment when ready
  # sub_domain {
  #   branch_name = aws_amplify_branch.dashboard_main.branch_name
  #   prefix      = "dashboard"  # dashboard.nasneh.com
  # }

  wait_for_verification = false
}
