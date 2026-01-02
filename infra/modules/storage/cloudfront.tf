# Nasneh Infrastructure - Storage Module CloudFront
# ==================================================
# CloudFront distribution with Origin Access Control (OAC).

# -----------------------------------------------------------------------------
# CloudFront Origin Access Control (OAC)
# Modern replacement for Origin Access Identity (OAI)
# -----------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "assets" {
  count = var.enable_storage && var.enable_cdn ? 1 : 0

  name                              = "${var.name_prefix}-assets-oac"
  description                       = "OAC for ${var.name_prefix} assets bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------------------------
# CloudFront Distribution
# -----------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "assets" {
  count = var.enable_storage && var.enable_cdn ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.name_prefix} static assets CDN"
  default_root_object = "index.html"
  price_class         = var.price_class

  # Origin configuration (S3 bucket)
  origin {
    domain_name              = aws_s3_bucket.assets[0].bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.assets[0].id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.assets[0].id
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.assets[0].id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    compress               = var.compress
    min_ttl                = var.min_ttl
    default_ttl            = var.default_ttl
    max_ttl                = var.max_ttl
  }

  # Custom error responses (SPA support)
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # Geo restrictions (none for now)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL/TLS configuration
  viewer_certificate {
    # Use CloudFront default certificate (*.cloudfront.net)
    # For custom domain, use ACM certificate
    cloudfront_default_certificate = var.custom_domain == "" ? true : false
    acm_certificate_arn            = var.custom_domain != "" ? var.acm_certificate_arn : null
    ssl_support_method             = var.custom_domain != "" ? "sni-only" : null
    minimum_protocol_version       = var.custom_domain != "" ? "TLSv1.2_2021" : "TLSv1"
  }

  # Custom domain aliases (optional)
  aliases = var.custom_domain != "" ? [var.custom_domain] : []

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-assets-cdn"
  })
}
