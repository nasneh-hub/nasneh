/**
 * Auth Routes - Nasneh API
 * Following TECHNICAL_SPEC.md §5. Authentication Flow
 *
 * Endpoints:
 * - POST /auth/request-otp  - Request OTP for phone
 * - POST /auth/verify-otp   - Verify OTP and get tokens
 * - POST /auth/refresh      - Refresh access token
 * - POST /auth/logout       - Logout (invalidate refresh token)
 * - GET  /auth/me           - Get current user (protected)
 */

import { Router } from 'express';
import {
  requestOtp,
  verifyOtp,
  refreshToken,
  logout,
  getCurrentUser,
} from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router: Router = Router();

// ===========================================
// Public Routes
// ===========================================

/**
 * @route   POST /auth/request-otp
 * @desc    Request OTP for phone number
 * @access  Public
 * @body    { phone: "+973XXXXXXXX" }
 */
router.post('/request-otp', requestOtp);

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP and get tokens
 * @access  Public
 * @body    { phone: "+973XXXXXXXX", otp: "123456" }
 */
router.post('/verify-otp', verifyOtp);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token
 * @access  Public
 * @body    { refreshToken: "..." }
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /auth/logout
 * @desc    Logout and invalidate refresh token
 * @access  Public
 * @body    { refreshToken: "..." }
 */
router.post('/logout', logout);

// ===========================================
// Protected Routes
// ===========================================

/**
 * @route   GET /auth/me
 * @desc    Get current authenticated user
 * @access  Protected
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;
