/**
 * Cart Routes
 * 
 * Cart management endpoints.
 * All routes require authentication.
 */

import { Router, type Router as RouterType } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from './cart.controller.js';

// ===========================================
// Cart Routes (mounted at /cart)
// ===========================================

const cartRouter: RouterType = Router();

// GET /cart - Get current user's cart
cartRouter.get('/', authMiddleware, getCart);

// POST /cart/items - Add item to cart
cartRouter.post('/items', authMiddleware, addItem);

// PATCH /cart/items/:id - Update item quantity
cartRouter.patch('/items/:id', authMiddleware, updateItem);

// DELETE /cart/items/:id - Remove item from cart
cartRouter.delete('/items/:id', authMiddleware, removeItem);

// DELETE /cart - Clear entire cart
cartRouter.delete('/', authMiddleware, clearCart);

export { cartRouter };
