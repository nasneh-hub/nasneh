/**
 * Addresses Routes
 * 
 * Address management endpoints.
 */

import { Router, type Router as RouterType } from 'express';
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
myAddressesRouter.get('/', listMyAddresses);

// POST /users/me/addresses - Create address
myAddressesRouter.post('/', createMyAddress);

// GET /users/me/addresses/:id - Get specific address
myAddressesRouter.get('/:id', getMyAddress);

// PATCH /users/me/addresses/:id - Update address
myAddressesRouter.patch('/:id', updateMyAddress);

// DELETE /users/me/addresses/:id - Delete address
myAddressesRouter.delete('/:id', deleteMyAddress);

// POST /users/me/addresses/:id/default - Set as default
myAddressesRouter.post('/:id/default', setMyDefaultAddress);

// ===========================================
// Admin User Addresses Routes (mounted at /users/:userId/addresses)
// ===========================================

const userAddressesRouter: RouterType = Router({ mergeParams: true });

// GET /users/:userId/addresses - List user's addresses (admin only)
userAddressesRouter.get('/', listUserAddresses);

// POST /users/:userId/addresses - Create address for user (admin only)
userAddressesRouter.post('/', createUserAddress);

export { myAddressesRouter, userAddressesRouter };
