/**
 * Admin Controller - Nasneh API
 * Handles admin dashboard endpoints
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { adminService } from './admin.service.js';

/**
 * Get Platform Statistics
 * GET /api/v1/admin/stats
 */
export async function getPlatformStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminService.getPlatformStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
