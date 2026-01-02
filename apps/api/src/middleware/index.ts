/**
 * Middleware Index - Nasneh API
 * Exports all middleware
 */

export {
  authMiddleware,
  requireRoles,
  optionalAuth,
  AuthenticatedRequest,
} from './auth.middleware.js';

export {
  ApiError,
  notFoundHandler,
  errorHandler,
} from './error.middleware.js';

export {
  rateLimit,
  otpRateLimit,
  otpCooldown,
  apiRateLimit,
  loginRateLimit,
} from './rate-limit.middleware.js';

export {
  captureRawBody,
  jsonWithRawBody,
  RawBodyRequest,
} from './rawBody.middleware.js';
