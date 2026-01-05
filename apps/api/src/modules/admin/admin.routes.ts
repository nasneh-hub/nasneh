/**
 * Admin Routes - Nasneh API
 *
 * Endpoints:
 * - GET /api/v1/admin/stats - Get platform statistics
 */

import { Router } from 'express';
import { getPlatformStats } from './admin.controller.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';

const adminRouter: Router = Router();

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform statistics
 * @access  Protected (admin only)
 * @returns { users, vendors, providers, orders, revenue }
 */
adminRouter.get(
  '/stats',
  authMiddleware,
  requireRoles(UserRole.ADMIN),
  getPlatformStats
);

export { adminRouter };
