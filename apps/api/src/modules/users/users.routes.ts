/**
 * Users Routes
 * 
 * User profile endpoints.
 * All routes require authentication.
 */

import { Router, type Router as RouterType } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';
import {
  getMyProfile,
  updateMyProfile,
  listUsers,
  getUserById,
  updateUserById,
} from './users.controller.js';

const router: RouterType = Router();

// ===========================================
// Current User Profile (Authenticated Users)
// ===========================================

// GET /users/me - Get current user's profile
router.get('/me', authMiddleware, getMyProfile);

// PATCH /users/me - Update current user's profile
router.patch('/me', authMiddleware, updateMyProfile);

// ===========================================
// Admin User Management
// ===========================================

// GET /users - List users (admin only)
router.get('/', authMiddleware, requireRoles(UserRole.ADMIN), listUsers);

// GET /users/:id - Get user by ID
// - Admin: can view any user
// - Others: can only view own profile (redirected to /me)
router.get('/:id', authMiddleware, getUserById);

// PATCH /users/:id - Update user by ID
// - Admin: can update any user (including role/status)
// - Others: can only update own profile (excluding role/status)
router.patch('/:id', authMiddleware, updateUserById);

export default router;
