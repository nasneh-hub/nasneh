/**
 * Cart Repository
 * 
 * Data access layer for cart operations.
 */

import { prisma } from '../../lib/index.js';
import type * as PrismaTypes from '@prisma/client';

// Type for transaction client
type TransactionClient = Omit<PrismaTypes.PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// ===========================================
// Cart Repository
// ===========================================

export const cartRepository = {
  /**
   * Find cart by user ID with items and product details
   */
  async findByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                price: true,
                images: true,
                isAvailable: true,
                vendorId: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  /**
   * Find cart by user ID (minimal, for checks)
   */
  async findByUserIdMinimal(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        vendorId: true,
      },
    });
  },

  /**
   * Find cart by user ID with lock for update (within transaction)
   */
  async findByUserIdForUpdate(tx: TransactionClient, userId: string) {
    // Use raw query for SELECT FOR UPDATE
    const carts = await tx.$queryRaw<Array<{ id: string; user_id: string; vendor_id: string | null }>>`
      SELECT id, user_id, vendor_id FROM carts WHERE user_id = ${userId} FOR UPDATE
    `;
    return carts[0] || null;
  },

  /**
   * Create cart for user
   */
  async create(userId: string, vendorId?: string) {
    return prisma.cart.create({
      data: {
        userId,
        vendorId,
      },
    });
  },

  /**
   * Create cart within transaction
   */
  async createInTransaction(tx: TransactionClient, userId: string, vendorId?: string) {
    return tx.cart.create({
      data: {
        userId,
        vendorId,
      },
    });
  },

  /**
   * Update cart vendor
   */
  async updateVendor(tx: TransactionClient, cartId: string, vendorId: string | null) {
    return tx.cart.update({
      where: { id: cartId },
      data: { vendorId },
    });
  },

  /**
   * Delete cart (clear all items)
   */
  async delete(cartId: string) {
    return prisma.cart.delete({
      where: { id: cartId },
    });
  },

  /**
   * Delete cart within transaction
   */
  async deleteInTransaction(tx: TransactionClient, cartId: string) {
    return tx.cart.delete({
      where: { id: cartId },
    });
  },
};

// ===========================================
// Cart Item Repository
// ===========================================

export const cartItemRepository = {
  /**
   * Find cart item by ID
   */
  async findById(itemId: string) {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: {
          select: {
            id: true,
            userId: true,
            vendorId: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            vendorId: true,
          },
        },
      },
    });
  },

  /**
   * Find cart item by cart and product
   */
  async findByCartAndProduct(cartId: string, productId: string) {
    return prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  },

  /**
   * Find cart item by cart and product within transaction
   */
  async findByCartAndProductInTransaction(tx: TransactionClient, cartId: string, productId: string) {
    return tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  },

  /**
   * Create cart item
   */
  async create(tx: TransactionClient, data: { cartId: string; productId: string; quantity: number }) {
    return tx.cartItem.create({
      data,
    });
  },

  /**
   * Update cart item quantity
   */
  async updateQuantity(tx: TransactionClient, itemId: string, quantity: number) {
    return tx.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  },

  /**
   * Delete cart item
   */
  async delete(itemId: string) {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  },

  /**
   * Delete cart item within transaction
   */
  async deleteInTransaction(tx: TransactionClient, itemId: string) {
    return tx.cartItem.delete({
      where: { id: itemId },
    });
  },

  /**
   * Count items in cart
   */
  async countByCartId(cartId: string) {
    return prisma.cartItem.count({
      where: { cartId },
    });
  },

  /**
   * Count items in cart within transaction
   */
  async countByCartIdInTransaction(tx: TransactionClient, cartId: string) {
    return tx.cartItem.count({
      where: { cartId },
    });
  },

  /**
   * Delete all items in cart
   */
  async deleteAllByCartId(tx: TransactionClient, cartId: string) {
    return tx.cartItem.deleteMany({
      where: { cartId },
    });
  },
};

// ===========================================
// Product Repository (for cart operations)
// ===========================================

export const productRepository = {
  /**
   * Find product by ID with vendor info
   */
  async findById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
            status: true,
          },
        },
      },
    });
  },
};
