/**
 * Lib Index - Nasneh API
 * Exports all library utilities
 */

export {
  getRedisClient,
  OTP_KEY_PREFIX,
  RATE_LIMIT_KEY_PREFIX,
  getOtpKey,
  getRateLimitKey,
} from './redis.js';

export { prisma } from './db.js';

export {
  WhatsAppClient,
  getWhatsAppClient,
  sendWhatsAppOtpWithTimeout,
} from './whatsapp.js';

export {
  SmsClient,
  getSmsClient,
  sendSmsOtp,
} from './sms.js';
