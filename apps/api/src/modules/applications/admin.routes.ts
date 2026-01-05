/**
 * Admin Applications Routes - Nasneh API
 *
 * Endpoints:
 * - GET    /api/v1/admin/vendor-applications       - List all vendor applications
 * - PATCH  /api/v1/admin/vendor-applications/:id   - Approve/reject vendor application
 * - GET    /api/v1/admin/provider-applications     - List all provider applications
 * - PATCH  /api/v1/admin/provider-applications/:id - Approve/reject provider application
 */

import { Router } from 'express';
import {
  listVendorApplications,
  updateVendorApplicationStatus,
  listProviderApplications,
  updateProviderApplicationStatus,
} from './admin.controller.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';

// ===========================================
// Admin Vendor Applications Routes
// ===========================================

const adminVendorApplicationsRouter: Router = Router();

/**
 * @route   GET /api/v1/admin/vendor-applications
 * @desc    List all vendor applications (with optional status filter)
 * @access  Protected (admin only)
 * @query   status? (PENDING | APPROVED | REJECTED)
 */
adminVendorApplicationsRouter.get(
  '/',
  authMiddleware,
  requireRoles(UserRole.ADMIN),
  listVendorApplications
);

/**
 * @route   PATCH /api/v1/admin/vendor-applications/:id
 * @desc    Approve or reject a vendor application
 * @access  Protected (admin only)
 * @body    { status: 'APPROVED' | 'REJECTED', notes?: string }
 */
adminVendorApplicationsRouter.patch(
  '/:id',
  authMiddleware,
  requireRoles(UserRole.ADMIN),
  updateVendorApplicationStatus
);

// ===========================================
// Admin Provider Applications Routes
// ===========================================

const adminProviderApplicationsRouter: Router = Router();

/**
 * @route   GET /api/v1/admin/provider-applications
 * @desc    List all provider applications (with optional status filter)
 * @access  Protected (admin only)
 * @query   status? (PENDING | APPROVED | REJECTED)
 */
adminProviderApplicationsRouter.get(
  '/',
  authMiddleware,
  requireRoles(UserRole.ADMIN),
  listProviderApplications
);

/**
 * @route   PATCH /api/v1/admin/provider-applications/:id
 * @desc    Approve or reject a provider application
 * @access  Protected (admin only)
 * @body    { status: 'APPROVED' | 'REJECTED', notes?: string }
 */
adminProviderApplicationsRouter.patch(
  '/:id',
  authMiddleware,
  requireRoles(UserRole.ADMIN),
  updateProviderApplicationStatus
);

export { adminVendorApplicationsRouter, adminProviderApplicationsRouter };
