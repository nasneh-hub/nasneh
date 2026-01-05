/**
 * Applications Routes - Nasneh API
 *
 * Endpoints:
 * - POST   /api/v1/vendor-applications       - Submit vendor application
 * - GET    /api/v1/vendor-applications/me    - Get my vendor application status
 * - POST   /api/v1/provider-applications     - Submit provider application
 * - GET    /api/v1/provider-applications/me  - Get my provider application status
 */

import { Router } from 'express';
import {
  submitVendorApplication,
  getMyVendorApplication,
  submitProviderApplication,
  getMyProviderApplication,
} from './applications.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

// ===========================================
// Vendor Applications Routes
// ===========================================

const vendorApplicationsRouter: Router = Router();

/**
 * @route   POST /api/v1/vendor-applications
 * @desc    Submit a vendor application
 * @access  Protected (authenticated users)
 * @body    { businessName, crNumber?, category, description? }
 */
vendorApplicationsRouter.post('/', authMiddleware, submitVendorApplication);

/**
 * @route   GET /api/v1/vendor-applications/me
 * @desc    Get my vendor application status
 * @access  Protected (authenticated users)
 */
vendorApplicationsRouter.get('/me', authMiddleware, getMyVendorApplication);

// ===========================================
// Provider Applications Routes
// ===========================================

const providerApplicationsRouter: Router = Router();

/**
 * @route   POST /api/v1/provider-applications
 * @desc    Submit a provider application
 * @access  Protected (authenticated users)
 * @body    { businessName, category, qualifications?, description? }
 */
providerApplicationsRouter.post('/', authMiddleware, submitProviderApplication);

/**
 * @route   GET /api/v1/provider-applications/me
 * @desc    Get my provider application status
 * @access  Protected (authenticated users)
 */
providerApplicationsRouter.get('/me', authMiddleware, getMyProviderApplication);

export { vendorApplicationsRouter, providerApplicationsRouter };
