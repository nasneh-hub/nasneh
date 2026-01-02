/**
 * Cart Routes
 * 
 * Cart management endpoints.
 */

import { Router, type Router as RouterType } from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from './cart.controller';

// ===========================================
// Cart Routes (mounted at /cart)
// ===========================================

const cartRouter: RouterType = Router();

// GET /cart - Get current user's cart
cartRouter.get('/', getCart);

// POST /cart/items - Add item to cart
cartRouter.post('/items', addItem);

// PATCH /cart/items/:id - Update item quantity
cartRouter.patch('/items/:id', updateItem);

// DELETE /cart/items/:id - Remove item from cart
cartRouter.delete('/items/:id', removeItem);

// DELETE /cart - Clear entire cart
cartRouter.delete('/', clearCart);

export { cartRouter };
