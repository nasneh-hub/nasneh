# Nasneh Infrastructure - Storage Module
# =======================================
# S3 bucket for static assets with CloudFront CDN.

# -----------------------------------------------------------------------------
# S3 Bucket
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "assets" {
  count = var.enable_storage ? 1 : 0

  bucket        = "${var.name_prefix}-${var.bucket_suffix}"
  force_destroy = var.force_destroy

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-${var.bucket_suffix}"
  })
}

# -----------------------------------------------------------------------------
# S3 Bucket Versioning
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_versioning" "assets" {
  count = var.enable_storage ? 1 : 0

  bucket = aws_s3_bucket.assets[0].id

  versioning_configuration {
    status = var.versioning_enabled ? "Enabled" : "Suspended"
  }
}

# -----------------------------------------------------------------------------
# S3 Bucket Public Access Block (Block ALL public access)
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_public_access_block" "assets" {
  count = var.enable_storage ? 1 : 0

  bucket = aws_s3_bucket.assets[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -----------------------------------------------------------------------------
# S3 Bucket Server-Side Encryption
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  count = var.enable_storage ? 1 : 0

  bucket = aws_s3_bucket.assets[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# -----------------------------------------------------------------------------
# S3 Bucket Lifecycle Rules
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  count = var.enable_storage && var.lifecycle_expiration_days > 0 ? 1 : 0

  bucket = aws_s3_bucket.assets[0].id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = var.lifecycle_expiration_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# -----------------------------------------------------------------------------
# S3 Bucket CORS Configuration (for web uploads)
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_cors_configuration" "assets" {
  count = var.enable_storage ? 1 : 0

  bucket = aws_s3_bucket.assets[0].id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"] # Restrict in production
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

# -----------------------------------------------------------------------------
# S3 Bucket Policy (CloudFront OAC access only)
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_policy" "assets" {
  count = var.enable_storage && var.enable_cdn ? 1 : 0

  bucket = aws_s3_bucket.assets[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.assets[0].arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.assets[0].arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.assets]
}
