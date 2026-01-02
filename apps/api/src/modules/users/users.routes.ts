/**
 * Users Routes
 * 
 * User profile endpoints.
 */

import { Router, type Router as RouterType } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  listUsers,
  getUserById,
  updateUserById,
} from './users.controller';

const router: RouterType = Router();

// ===========================================
// Current User Profile
// ===========================================

// GET /users/me - Get current user's profile
router.get('/me', getMyProfile);

// PATCH /users/me - Update current user's profile
router.patch('/me', updateMyProfile);

// ===========================================
// Admin User Management
// ===========================================

// GET /users - List users (admin only)
router.get('/', listUsers);

// GET /users/:id - Get user by ID
// - Admin: can view any user
// - Others: can only view own profile (redirected to /me)
router.get('/:id', getUserById);

// PATCH /users/:id - Update user by ID
// - Admin: can update any user (including role/status)
// - Others: can only update own profile (excluding role/status)
router.patch('/:id', updateUserById);

export default router;
