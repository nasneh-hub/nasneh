/**
 * Auth Routes - Nasneh API
 * Following TECHNICAL_SPEC.md §5. Authentication Flow
 *
 * Endpoints:
 * - POST /auth/request-otp  - Request OTP for phone (rate limited: 5/hour)
 * - POST /auth/verify-otp   - Verify OTP and get tokens (rate limited: 10/hour)
 * - POST /auth/refresh      - Refresh access token (with token rotation)
 * - POST /auth/logout       - Logout (invalidate refresh token)
 * - POST /auth/logout-all   - Logout from all devices (protected)
 * - GET  /auth/sessions     - Get active sessions (protected)
 * - GET  /auth/me           - Get current user (protected)
 */

import { Router } from 'express';
import {
  requestOtp,
  verifyOtp,
  refreshToken,
  logout,
  logoutAll,
  getSessions,
  getCurrentUser,
} from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  otpRateLimit,
  otpCooldown,
  loginRateLimit,
} from '../../middleware/rate-limit.middleware.js';

const router: Router = Router();

// ===========================================
// Public Routes
// ===========================================

/**
 * @route   POST /auth/request-otp
 * @desc    Request OTP for phone number
 * @access  Public
 * @body    { phone: "+973XXXXXXXX" }
 * @rateLimit 5 requests per hour per phone, 60s cooldown between requests
 */
router.post('/request-otp', otpRateLimit, otpCooldown, requestOtp);

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP and get tokens
 * @access  Public
 * @body    { phone: "+973XXXXXXXX", otp: "123456" }
 * @rateLimit 10 attempts per hour per phone
 */
router.post('/verify-otp', loginRateLimit, verifyOtp);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken: "..." }
 * @note    Implements token rotation - old refresh token is invalidated
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /auth/logout
 * @desc    Logout and invalidate refresh token
 * @access  Public (but can include auth for access token blacklisting)
 * @body    { refreshToken: "..." }
 */
router.post('/logout', logout);

// ===========================================
// Protected Routes
// ===========================================

/**
 * @route   POST /auth/logout-all
 * @desc    Logout from all devices (revoke all refresh tokens)
 * @access  Protected
 * @returns { success: true, revokedCount: number }
 */
router.post('/logout-all', authMiddleware, logoutAll);

/**
 * @route   GET /auth/sessions
 * @desc    Get all active sessions for current user
 * @access  Protected
 * @returns { sessions: [{ createdAt, expiresAt, userAgent, ipAddress }] }
 */
router.get('/sessions', authMiddleware, getSessions);

/**
 * @route   GET /auth/me
 * @desc    Get current authenticated user
 * @access  Protected
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;
