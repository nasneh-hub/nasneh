/**
 * Environment Configuration - Nasneh API
 * All environment variables are loaded here with defaults
 * Following TECHNICAL_SPEC.md - no hardcoded values
 */

import { z } from 'zod';

/**
 * Environment schema validation
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('4000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().optional(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // AWS
  AWS_REGION: z.string().default('me-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SNS_REGION: z.string().default('me-south-1'),
  AWS_S3_BUCKET: z.string().default('nasneh-dev-media'),
  AWS_S3_REGION: z.string().default('me-south-1'),

  // WhatsApp Business API
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),

  // OTP
  OTP_EXPIRY_MINUTES: z.string().default('5'),
  OTP_MAX_ATTEMPTS: z.string().default('5'),
  OTP_RESEND_COOLDOWN_SECONDS: z.string().default('60'),
  OTP_WHATSAPP_TIMEOUT_SECONDS: z.string().default('10'),
  OTP_MOCK_ENABLED: z.string().default('false'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  RATE_LIMIT_OTP_PER_HOUR: z.string().default('5'),
  RATE_LIMIT_LOGIN_PER_HOUR: z.string().default('10'),

  // URLs
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  DASHBOARD_URL: z.string().default('http://localhost:3001'),

  // Amazon Payment Services (APS)
  APS_MERCHANT_IDENTIFIER: z.string().optional(),
  APS_ACCESS_CODE: z.string().optional(),
  APS_SHA_REQUEST_PHRASE: z.string().optional(),
  APS_SHA_RESPONSE_PHRASE: z.string().optional(),
  APS_API_URL: z.string().default('https://sbpaymentservices.payfort.com/FortAPI/paymentApi'),
  APS_CHECKOUT_URL: z.string().default('https://sbcheckout.payfort.com/FortAPI/paymentPage'),
  APS_CURRENCY: z.string().default('BHD'),
});

/**
 * Parse and validate environment variables
 */
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }

  return parsed.data;
}

/**
 * Typed environment configuration
 */
export const env = loadEnv();

/**
 * Derived configuration values
 */
export const config = {
  // Server
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  environment: env.ENVIRONMENT as 'development' | 'staging' | 'production',
  port: parseInt(env.PORT, 10),
  apiVersion: env.API_VERSION,

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },

  // OTP
  otp: {
    expiryMinutes: parseInt(env.OTP_EXPIRY_MINUTES, 10),
    maxAttempts: parseInt(env.OTP_MAX_ATTEMPTS, 10),
    resendCooldownSeconds: parseInt(env.OTP_RESEND_COOLDOWN_SECONDS, 10),
    whatsappTimeoutSeconds: parseInt(env.OTP_WHATSAPP_TIMEOUT_SECONDS, 10),
    mockEnabled: env.OTP_MOCK_ENABLED === 'true',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    otpPerHour: parseInt(env.RATE_LIMIT_OTP_PER_HOUR, 10),
    loginPerHour: parseInt(env.RATE_LIMIT_LOGIN_PER_HOUR, 10),
  },

  // AWS
  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    snsRegion: env.AWS_SNS_REGION,
    s3Bucket: env.AWS_S3_BUCKET,
    s3Region: env.AWS_S3_REGION,
  },

  // WhatsApp
  whatsapp: {
    apiUrl: env.WHATSAPP_API_URL,
    apiToken: env.WHATSAPP_API_TOKEN,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    isConfigured: Boolean(env.WHATSAPP_API_URL && env.WHATSAPP_API_TOKEN),
  },

  // Redis
  redis: {
    url: env.REDIS_URL,
  },

  // URLs
  urls: {
    frontend: env.FRONTEND_URL,
    dashboard: env.DASHBOARD_URL,
  },

  // APS
  aps: {
    merchantIdentifier: env.APS_MERCHANT_IDENTIFIER,
    accessCode: env.APS_ACCESS_CODE,
    shaRequestPhrase: env.APS_SHA_REQUEST_PHRASE,
    shaResponsePhrase: env.APS_SHA_RESPONSE_PHRASE,
    apiUrl: env.APS_API_URL,
    checkoutUrl: env.APS_CHECKOUT_URL,
    currency: env.APS_CURRENCY,
    isConfigured: Boolean(
      env.APS_MERCHANT_IDENTIFIER &&
      env.APS_ACCESS_CODE &&
      env.APS_SHA_REQUEST_PHRASE
    ),
  },
} as const;

export type Config = typeof config;
