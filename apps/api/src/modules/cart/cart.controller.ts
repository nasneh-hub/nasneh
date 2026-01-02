/**
 * Cart Controller
 * 
 * HTTP handlers for cart endpoints.
 */

import type { Request, Response } from 'express';
import { cartService, CartError } from './cart.service.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
  CartErrorCode,
} from '../../types/cart.types.js';

// ===========================================
// Type Extensions
// ===========================================

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Handle cart errors and return appropriate HTTP response
 */
function handleCartError(res: Response, error: unknown) {
  if (error instanceof CartError) {
    const statusCode = getStatusCodeForError(error.code);
    return res.status(statusCode).json({
      error: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
    });
  }

  console.error('Cart error:', error);
  return res.status(500).json({ error: 'Internal server error' });
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: CartErrorCode): number {
  switch (code) {
    case CartErrorCode.CART_NOT_FOUND:
    case CartErrorCode.CART_ITEM_NOT_FOUND:
    case CartErrorCode.PRODUCT_NOT_FOUND:
      return 404;
    case CartErrorCode.PERMISSION_DENIED:
      return 403;
    case CartErrorCode.DIFFERENT_VENDOR:
      return 409;
    case CartErrorCode.PRODUCT_NOT_AVAILABLE:
      return 422;
    case CartErrorCode.INVALID_QUANTITY:
      return 400;
    default:
      return 400;
  }
}

// ===========================================
// Controller Functions
// ===========================================

/**
 * GET /cart
 * Get current user's cart
 */
export async function getCart(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cart = await cartService.getCart(userId);

    return res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return handleCartError(res, error);
  }
}

/**
 * POST /cart/items
 * Add item to cart
 */
export async function addItem(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const parseResult = addCartItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const cart = await cartService.addItem(userId, parseResult.data);

    return res.status(201).json({
      success: true,
      data: cart,
      message: 'Item added to cart',
    });
  } catch (error) {
    return handleCartError(res, error);
  }
}

/**
 * PATCH /cart/items/:id
 * Update cart item quantity
 */
export async function updateItem(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id: itemId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const parseResult = updateCartItemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const cart = await cartService.updateItemQuantity(userId, itemId, parseResult.data);

    return res.json({
      success: true,
      data: cart,
      message: 'Cart item updated',
    });
  } catch (error) {
    return handleCartError(res, error);
  }
}

/**
 * DELETE /cart/items/:id
 * Remove item from cart
 */
export async function removeItem(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id: itemId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cart = await cartService.removeItem(userId, itemId);

    return res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart',
    });
  } catch (error) {
    return handleCartError(res, error);
  }
}

/**
 * DELETE /cart
 * Clear entire cart
 */
export async function clearCart(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cart = await cartService.clearCart(userId);

    return res.json({
      success: true,
      data: cart,
      message: 'Cart cleared',
    });
  } catch (error) {
    return handleCartError(res, error);
  }
}
