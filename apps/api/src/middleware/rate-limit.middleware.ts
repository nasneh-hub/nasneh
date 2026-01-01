/**
 * Rate Limiting Middleware - Nasneh API
 * Following TECHNICAL_SPEC.md §6. Security - Rate Limiting
 *
 * OTP Rate Limits:
 * - 5 requests per hour per phone number
 * - 60 second cooldown between requests
 */

import { Request, Response, NextFunction } from 'express';
import { getRedisClient, getRateLimitKey } from '../lib/redis';
import { config } from '../config/env';
import { ApiError } from './error.middleware';

// ===========================================
// Types
// ===========================================

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  keyGenerator: (req: Request) => string | null;
  errorMessage?: string;
}

// ===========================================
// Rate Limit Middleware Factory
// ===========================================

export function rateLimit(options: RateLimitConfig) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const key = options.keyGenerator(req);

      if (!key) {
        // No key generated, skip rate limiting
        next();
        return;
      }

      const redis = await getRedisClient();
      const rateLimitKey = `rate:${key}`;

      // Get current count
      const currentCount = await redis.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      if (count >= options.maxRequests) {
        // Get TTL to show when limit resets
        const ttl = await redis.ttl(rateLimitKey);
        const resetMinutes = Math.ceil(ttl / 60);

        res.status(429).json({
          success: false,
          error: options.errorMessage || 'Too many requests',
          retryAfter: ttl,
          message: `Rate limit exceeded. Try again in ${resetMinutes} minute(s).`,
        });
        return;
      }

      // Increment counter
      const newCount = await redis.incr(rateLimitKey);

      // Set expiry on first request
      if (newCount === 1) {
        await redis.expire(rateLimitKey, options.windowSeconds);
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - newCount).toString());

      next();
    } catch (error) {
      // On error, allow the request (fail open for availability)
      console.error('[RateLimit] Error:', error);
      next();
    }
  };
}

// ===========================================
// OTP Rate Limiter
// ===========================================

/**
 * Rate limiter for OTP requests
 * - 5 requests per hour per phone number
 */
export const otpRateLimit = rateLimit({
  maxRequests: config.rateLimit.otpPerHour,
  windowSeconds: 3600, // 1 hour
  keyGenerator: (req: Request) => {
    const phone = req.body?.phone;
    if (!phone || typeof phone !== 'string') {
      return null;
    }
    return `otp:${phone}`;
  },
  errorMessage: 'Too many OTP requests for this phone number',
});

// ===========================================
// OTP Cooldown Middleware
// ===========================================

/**
 * Cooldown between OTP requests
 * - 60 seconds between requests for same phone
 */
export async function otpCooldown(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const phone = req.body?.phone;

    if (!phone || typeof phone !== 'string') {
      next();
      return;
    }

    const redis = await getRedisClient();
    const cooldownKey = `cooldown:otp:${phone}`;

    // Check if cooldown is active
    const cooldownActive = await redis.get(cooldownKey);

    if (cooldownActive) {
      const ttl = await redis.ttl(cooldownKey);

      res.status(429).json({
        success: false,
        error: 'Please wait before requesting another OTP',
        retryAfter: ttl,
        message: `Please wait ${ttl} seconds before requesting another OTP.`,
      });
      return;
    }

    // Set cooldown after successful validation (will be set in controller)
    // Store reference for later use
    (req as any).setCooldown = async () => {
      await redis.set(cooldownKey, '1', { EX: config.otp.resendCooldownSeconds });
    };

    next();
  } catch (error) {
    console.error('[OtpCooldown] Error:', error);
    next();
  }
}

// ===========================================
// General API Rate Limiter
// ===========================================

/**
 * General API rate limiter
 * - 100 requests per minute per IP
 */
export const apiRateLimit = rateLimit({
  maxRequests: config.rateLimit.maxRequests,
  windowSeconds: Math.floor(config.rateLimit.windowMs / 1000),
  keyGenerator: (req: Request) => {
    // Get IP from various headers (for proxied requests)
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.headers['x-real-ip']?.toString() ||
      req.socket.remoteAddress ||
      'unknown';
    return `api:${ip}`;
  },
  errorMessage: 'Too many requests from this IP',
});

// ===========================================
// Login Rate Limiter
// ===========================================

/**
 * Rate limiter for login attempts
 * - 10 attempts per hour per phone
 */
export const loginRateLimit = rateLimit({
  maxRequests: config.rateLimit.loginPerHour,
  windowSeconds: 3600, // 1 hour
  keyGenerator: (req: Request) => {
    const phone = req.body?.phone;
    if (!phone || typeof phone !== 'string') {
      return null;
    }
    return `login:${phone}`;
  },
  errorMessage: 'Too many login attempts for this phone number',
});
