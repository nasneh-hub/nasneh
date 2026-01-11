/**
 * Admin DB Scripts Routes - Nasneh API
 * Protected endpoints for running database scripts
 */

import { Router } from 'express';
import * as controller from './db-scripts.controller.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';

const router: Router = Router();

// All admin routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(requireRoles(UserRole.ADMIN));

// POST /admin/db-scripts/populate-slugs - Populate slugs for existing data
router.post('/populate-slugs', controller.populateSlugs);

// POST /admin/db-scripts/seed - Run seed:staging script
router.post('/seed', controller.runSeed);

// GET /admin/db-scripts/verify - Verify data counts and samples
router.get('/verify', controller.verifyData);

export default router;
