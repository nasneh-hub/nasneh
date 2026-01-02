# Storage Module

This module manages S3 bucket and CloudFront CDN for static assets.

## Resources Created

| Resource | Description |
|----------|-------------|
| S3 Bucket | Static assets storage with versioning |
| S3 Bucket Policy | CloudFront OAC access only |
| Public Access Block | All public access blocked |
| Server-Side Encryption | AES256 encryption at rest |
| Lifecycle Rules | Expire old versions after 90 days |
| CORS Configuration | Allow GET/HEAD from any origin |
| CloudFront OAC | Origin Access Control for S3 |
| CloudFront Distribution | CDN with HTTPS redirect |

## Architecture

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                                                         │
    Users ──────────┼──► CloudFront (HTTPS)                                   │
                    │         │                                               │
                    │         │ Origin Access Control (OAC)                   │
                    │         ▼                                               │
                    │    ┌────────────────────────────────────────┐          │
                    │    │            S3 Bucket                   │          │
                    │    │  ┌─────────────────────────────────┐   │          │
                    │    │  │ • Block Public Access: ON       │   │          │
                    │    │  │ • Versioning: Enabled           │   │          │
                    │    │  │ • Encryption: AES256            │   │          │
                    │    │  │ • Access: CloudFront OAC only   │   │          │
                    │    │  └─────────────────────────────────┘   │          │
                    │    └────────────────────────────────────────┘          │
                    │                                                         │
                    └─────────────────────────────────────────────────────────┘
```

## Usage

```hcl
module "storage" {
  source = "../../modules/storage"

  name_prefix = "nasneh-staging"
  aws_region  = "me-south-1"

  # Feature toggles
  enable_storage = true
  enable_cdn     = true

  # S3 configuration
  bucket_suffix             = "assets"
  force_destroy             = true  # Allow deletion for staging
  versioning_enabled        = true
  lifecycle_expiration_days = 90

  # CloudFront configuration
  price_class = "PriceClass_100"  # Cheapest
  default_ttl = 86400             # 1 day
  compress    = true

  tags = local.common_tags
}
```

## Inputs

| Name | Description | Type | Default |
|------|-------------|------|---------|
| name_prefix | Prefix for resource names | string | - |
| aws_region | AWS region | string | - |
| enable_storage | Enable entire module | bool | true |
| enable_cdn | Enable CloudFront | bool | true |
| bucket_suffix | Suffix for bucket name | string | assets |
| force_destroy | Allow bucket deletion | bool | false |
| versioning_enabled | Enable S3 versioning | bool | true |
| lifecycle_expiration_days | Days to expire old versions | number | 90 |
| price_class | CloudFront price class | string | PriceClass_100 |
| default_ttl | Default cache TTL (seconds) | number | 86400 |
| compress | Enable compression | bool | true |
| custom_domain | Custom domain (optional) | string | "" |
| acm_certificate_arn | ACM cert ARN (optional) | string | "" |

## Outputs

| Name | Description |
|------|-------------|
| bucket_name | S3 bucket name |
| bucket_arn | S3 bucket ARN |
| cloudfront_distribution_id | CloudFront distribution ID |
| cloudfront_domain_name | CloudFront domain name |
| cdn_url | Full HTTPS URL for CDN |
| storage_enabled | Whether storage is enabled |
| cdn_enabled | Whether CDN is enabled |

## Feature Toggles

### Disable Entire Module

```hcl
module "storage" {
  source = "../../modules/storage"
  
  enable_storage = false  # Skip all resources
  # ...
}
```

### Disable CloudFront Only

```hcl
module "storage" {
  source = "../../modules/storage"
  
  enable_storage = true
  enable_cdn     = false  # S3 only, no CDN
  # ...
}
```

## Security

### S3 Bucket

- **Block Public Access:** All public access is blocked
- **Bucket Policy:** Only CloudFront OAC can access objects
- **Encryption:** Server-side encryption with AES256
- **Versioning:** Enabled for recovery and audit

### CloudFront

- **HTTPS Only:** HTTP redirects to HTTPS
- **OAC:** Origin Access Control (modern, more secure than OAI)
- **TLS 1.2:** Minimum protocol version

## Custom Domain (Future)

To use a custom domain:

1. Create ACM certificate in **us-east-1** (required for CloudFront)
2. Pass `custom_domain` and `acm_certificate_arn` variables
3. Create Route53 alias record pointing to CloudFront

```hcl
module "storage" {
  source = "../../modules/storage"
  
  custom_domain       = "cdn.nasneh.com"
  acm_certificate_arn = "arn:aws:acm:us-east-1:123456789:certificate/xxx"
  # ...
}
```

## Cost Estimate (Staging)

| Resource | Monthly Cost |
|----------|--------------|
| S3 Storage (10 GB) | ~$0.25 |
| S3 Requests | ~$0.50 |
| CloudFront (10 GB transfer) | ~$1.00 |
| **Total** | **~$2** |

> **Note:** Costs scale with usage. Staging typically has minimal traffic.

## CI/CD Integration

```bash
# Upload assets to S3
aws s3 sync ./dist s3://$BUCKET_NAME --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## Status

✅ **Implemented** - DevOps Gate Sprint 2.5
