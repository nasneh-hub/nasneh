/**
 * Middleware Index - Nasneh API
 * Exports all middleware
 */

export {
  authMiddleware,
  requireRoles,
  optionalAuth,
  AuthenticatedRequest,
} from './auth.middleware';

export {
  ApiError,
  notFoundHandler,
  errorHandler,
} from './error.middleware';

export {
  rateLimit,
  otpRateLimit,
  otpCooldown,
  apiRateLimit,
  loginRateLimit,
} from './rate-limit.middleware';

export {
  captureRawBody,
  jsonWithRawBody,
  RawBodyRequest,
} from './rawBody.middleware';
