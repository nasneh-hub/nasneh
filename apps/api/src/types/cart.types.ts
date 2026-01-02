/**
 * Cart Types
 * 
 * Type definitions and Zod schemas for cart operations.
 * Follows existing repo conventions.
 */

import { z } from 'zod';

// ===========================================
// Error Codes
// ===========================================

export enum CartErrorCode {
  CART_NOT_FOUND = 'CART_NOT_FOUND',
  CART_ITEM_NOT_FOUND = 'CART_ITEM_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_NOT_AVAILABLE = 'PRODUCT_NOT_AVAILABLE',
  DIFFERENT_VENDOR = 'DIFFERENT_VENDOR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
}

// ===========================================
// Input Schemas
// ===========================================

/**
 * Add item to cart
 */
export const addCartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

/**
 * Update cart item quantity
 */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

// ===========================================
// Response Types
// ===========================================

/**
 * Cart item response
 */
export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    nameAr: string | null;
    price: number;
    images: string[];
    isAvailable: boolean;
  };
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vendor info in cart
 */
export interface CartVendorResponse {
  id: string;
  storeName: string;
  logoUrl: string | null;
}

/**
 * Full cart response
 */
export interface CartResponse {
  id: string;
  userId: string;
  vendor: CartVendorResponse | null;
  items: CartItemResponse[];
  itemCount: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Different vendor error details
 */
export interface DifferentVendorError {
  code: CartErrorCode.DIFFERENT_VENDOR;
  message: string;
  currentVendorId: string;
  currentVendorName: string;
  newVendorId: string;
  newVendorName: string;
}
