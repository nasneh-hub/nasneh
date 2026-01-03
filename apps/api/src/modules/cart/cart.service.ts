/**
 * Cart Service
 * 
 * Business logic for cart operations with single-vendor enforcement.
 * Uses atomic transactions to prevent race conditions.
 */

import { prisma } from '../../lib/index.js';
import { cartRepository, cartItemRepository, productRepository } from './cart.repository.js';
import {
  CartErrorCode,
  type AddCartItemInput,
  type UpdateCartItemInput,
  type CartResponse,
  type CartItemResponse,
  type DifferentVendorError,
} from '../../types/cart.types.js';
import prismaPkg from '@prisma/client';
import type * as PrismaTypes from '@prisma/client';

const prismaMod = prismaPkg as unknown as any;
const { Decimal } = prismaMod;
type Decimal = any;

// ===========================================
// Custom Errors
// ===========================================

export class CartError extends Error {
  constructor(
    public code: CartErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CartError';
  }
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Convert Decimal to number
 */
function decimalToNumber(value: Decimal): number {
  return Number(value);
}

/**
 * Format cart item for response
 */
function formatCartItem(item: any): CartItemResponse {
  const price = decimalToNumber(item.product.price);
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      nameAr: item.product.nameAr,
      price,
      images: item.product.images as string[],
      isAvailable: item.product.isAvailable,
    },
    subtotal: price * item.quantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Format cart for response
 */
function formatCart(cart: any): CartResponse {
  const items = cart.items.map(formatCartItem);
  const subtotal = items.reduce((sum: number, item: CartItemResponse) => sum + item.subtotal, 0);
  const itemCount = items.reduce((sum: number, item: CartItemResponse) => sum + item.quantity, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    vendor: cart.vendor ? {
      id: cart.vendor.id,
      storeName: cart.vendor.storeName,
      logoUrl: cart.vendor.logoUrl,
    } : null,
    items,
    itemCount,
    subtotal,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

/**
 * Get empty cart response
 */
function getEmptyCartResponse(userId: string): CartResponse {
  return {
    id: '',
    userId,
    vendor: null,
    items: [],
    itemCount: 0,
    subtotal: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ===========================================
// Service
// ===========================================

export const cartService = {
  /**
   * Get user's cart
   */
  async getCart(userId: string): Promise<CartResponse> {
    const cart = await cartRepository.findByUserId(userId);
    
    if (!cart) {
      return getEmptyCartResponse(userId);
    }

    return formatCart(cart);
  },

  /**
   * Add item to cart with single-vendor enforcement
   * Uses atomic transaction to prevent race conditions
   */
  async addItem(userId: string, input: AddCartItemInput): Promise<CartResponse> {
    const { productId, quantity } = input;

    // Validate product exists and is available
    const product = await productRepository.findById(productId);
    
    if (!product) {
      throw new CartError(
        CartErrorCode.PRODUCT_NOT_FOUND,
        'Product not found'
      );
    }

    if (!product.isAvailable || product.status !== 'ACTIVE') {
      throw new CartError(
        CartErrorCode.PRODUCT_NOT_AVAILABLE,
        'Product is not available'
      );
    }

    if (product.vendor.status !== 'APPROVED') {
      throw new CartError(
        CartErrorCode.PRODUCT_NOT_AVAILABLE,
        'Vendor is not active'
      );
    }

    const newVendorId = product.vendorId;

    // Use transaction with serializable isolation for atomicity
    await prisma.$transaction(async (tx: any) => {
      // Get or create cart with lock
      let cart = await cartRepository.findByUserIdForUpdate(tx, userId);

      if (!cart) {
        // Create new cart with vendor
        const newCart = await cartRepository.createInTransaction(tx, userId, newVendorId);
        cart = { id: newCart.id, user_id: newCart.userId, vendor_id: newCart.vendorId };
      } else if (cart.vendor_id && cart.vendor_id !== newVendorId) {
        // Different vendor - throw error with details
        const currentVendor = await tx.vendor.findUnique({
          where: { id: cart.vendor_id },
          select: { id: true, storeName: true },
        });

        const errorDetails: DifferentVendorError = {
          code: CartErrorCode.DIFFERENT_VENDOR,
          message: 'Cannot add items from different vendor. Clear cart first or remove existing items.',
          currentVendorId: cart.vendor_id,
          currentVendorName: currentVendor?.storeName || 'Unknown',
          newVendorId: newVendorId,
          newVendorName: product.vendor.storeName,
        };

        throw new CartError(
          CartErrorCode.DIFFERENT_VENDOR,
          errorDetails.message,
          errorDetails as unknown as Record<string, unknown>
        );
      } else if (!cart.vendor_id) {
        // Cart exists but no vendor set (shouldn't happen normally)
        await cartRepository.updateVendor(tx, cart.id, newVendorId);
      }

      // Check if product already in cart
      const existingItem = await cartItemRepository.findByCartAndProductInTransaction(
        tx,
        cart.id,
        productId
      );

      if (existingItem) {
        // Update quantity
        await cartItemRepository.updateQuantity(tx, existingItem.id, existingItem.quantity + quantity);
      } else {
        // Create new item
        await cartItemRepository.create(tx, {
          cartId: cart.id,
          productId,
          quantity,
        });
      }
    }, {
      isolationLevel: 'Serializable',
      maxWait: 5000,
      timeout: 10000,
    });

    // Return updated cart
    return this.getCart(userId);
  },

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(
    userId: string,
    itemId: string,
    input: UpdateCartItemInput
  ): Promise<CartResponse> {
    const { quantity } = input;

    // Find item and verify ownership
    const item = await cartItemRepository.findById(itemId);

    if (!item) {
      throw new CartError(
        CartErrorCode.CART_ITEM_NOT_FOUND,
        'Cart item not found'
      );
    }

    if (item.cart.userId !== userId) {
      throw new CartError(
        CartErrorCode.PERMISSION_DENIED,
        'You can only update your own cart items'
      );
    }

    // Update quantity
    await prisma.$transaction(async (tx: any) => {
      await cartItemRepository.updateQuantity(tx, itemId, quantity);
    });

    return this.getCart(userId);
  },

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<CartResponse> {
    // Find item and verify ownership
    const item = await cartItemRepository.findById(itemId);

    if (!item) {
      throw new CartError(
        CartErrorCode.CART_ITEM_NOT_FOUND,
        'Cart item not found'
      );
    }

    if (item.cart.userId !== userId) {
      throw new CartError(
        CartErrorCode.PERMISSION_DENIED,
        'You can only remove your own cart items'
      );
    }

    // Delete item and check if cart should be cleared
    await prisma.$transaction(async (tx: any) => {
      await cartItemRepository.deleteInTransaction(tx, itemId);

      // Check remaining items
      const remainingCount = await cartItemRepository.countByCartIdInTransaction(tx, item.cart.id);

      if (remainingCount === 0) {
        // Clear vendor from cart when empty
        await cartRepository.updateVendor(tx, item.cart.id, null);
      }
    });

    return this.getCart(userId);
  },

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<CartResponse> {
    const cart = await cartRepository.findByUserIdMinimal(userId);

    if (cart) {
      await prisma.$transaction(async (tx: any) => {
        // Delete all items
        await cartItemRepository.deleteAllByCartId(tx, cart.id);
        // Clear vendor
        await cartRepository.updateVendor(tx, cart.id, null);
      });
    }

    return getEmptyCartResponse(userId);
  },

  /**
   * Verify cart item belongs to user
   */
  async verifyItemOwnership(userId: string, itemId: string): Promise<boolean> {
    const item = await cartItemRepository.findById(itemId);
    return item?.cart.userId === userId;
  },
};
