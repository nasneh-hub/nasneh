/**
 * Addresses Routes
 * 
 * Address management endpoints.
 * All routes require authentication.
 */

import { Router, type Router as RouterType } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';
import {
  listMyAddresses,
  createMyAddress,
  getMyAddress,
  updateMyAddress,
  deleteMyAddress,
  setMyDefaultAddress,
  listUserAddresses,
  createUserAddress,
} from './addresses.controller.js';

// ===========================================
// My Addresses Routes (mounted at /users/me/addresses)
// ===========================================

const myAddressesRouter: RouterType = Router();

// GET /users/me/addresses - List my addresses
myAddressesRouter.get('/', authMiddleware, listMyAddresses);

// POST /users/me/addresses - Create address
myAddressesRouter.post('/', authMiddleware, createMyAddress);

// GET /users/me/addresses/:id - Get specific address
myAddressesRouter.get('/:id', authMiddleware, getMyAddress);

// PATCH /users/me/addresses/:id - Update address
myAddressesRouter.patch('/:id', authMiddleware, updateMyAddress);

// DELETE /users/me/addresses/:id - Delete address
myAddressesRouter.delete('/:id', authMiddleware, deleteMyAddress);

// POST /users/me/addresses/:id/default - Set as default
myAddressesRouter.post('/:id/default', authMiddleware, setMyDefaultAddress);

// ===========================================
// Admin User Addresses Routes (mounted at /users/:userId/addresses)
// ===========================================

const userAddressesRouter: RouterType = Router({ mergeParams: true });

// GET /users/:userId/addresses - List user's addresses (admin only)
userAddressesRouter.get('/', authMiddleware, requireRoles(UserRole.ADMIN), listUserAddresses);

// POST /users/:userId/addresses - Create address for user (admin only)
userAddressesRouter.post('/', authMiddleware, requireRoles(UserRole.ADMIN), createUserAddress);

export { myAddressesRouter, userAddressesRouter };
