/**
 * Products Service - Nasneh API
 * Business logic for product operations
 * Following TECHNICAL_SPEC.md §4. API Endpoints - Vendor Dashboard
 */

import { productsRepository } from './products.repository.js';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  ProductStatus,
} from '../../types/product.types.js';

export class ProductsService {
  /**
   * Create a new product for a vendor
   */
  async createProduct(vendorId: string, data: CreateProductInput) {
    const product = await productsRepository.create(vendorId, data);

    return {
      success: true,
      message: 'Product created successfully',
      product,
    };
  }

  /**
   * Get product by ID
   * Validates that product exists and is not deleted
   */
  async getProductById(id: string) {
    const product = await productsRepository.findById(id);

    if (!product) {
      throw new ProductNotFoundError(id);
    }

    if (product.status === ProductStatus.DELETED) {
      throw new ProductNotFoundError(id);
    }

    return {
      success: true,
      product,
    };
  }

  /**
   * Get vendor's products (for vendor dashboard)
   * Includes all statuses except DELETED
   */
  async getVendorProducts(vendorId: string, query: ProductQueryInput) {
    // Override vendorId to ensure vendor only sees their own products
    const result = await productsRepository.findMany({
      ...query,
      vendorId,
      // Don't filter by status - vendor can see ACTIVE and INACTIVE
    });

    // Filter out DELETED products
    result.data = result.data.filter((p) => p.status !== ProductStatus.DELETED);

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Update a product
   * Validates ownership before update
   */
  async updateProduct(
    productId: string,
    vendorId: string,
    data: UpdateProductInput
  ) {
    // Check ownership
    const isOwner = await productsRepository.belongsToVendor(productId, vendorId);
    if (!isOwner) {
      throw new ProductNotFoundError(productId);
    }

    // Check product exists and is not deleted
    const existing = await productsRepository.findById(productId);
    if (!existing || existing.status === ProductStatus.DELETED) {
      throw new ProductNotFoundError(productId);
    }

    const product = await productsRepository.update(productId, data);

    return {
      success: true,
      message: 'Product updated successfully',
      product,
    };
  }

  /**
   * Soft delete a product
   * Sets status to DELETED instead of removing from database
   */
  async deleteProduct(productId: string, vendorId: string) {
    // Check ownership
    const isOwner = await productsRepository.belongsToVendor(productId, vendorId);
    if (!isOwner) {
      throw new ProductNotFoundError(productId);
    }

    // Check product exists and is not already deleted
    const existing = await productsRepository.findById(productId);
    if (!existing || existing.status === ProductStatus.DELETED) {
      throw new ProductNotFoundError(productId);
    }

    await productsRepository.softDelete(productId);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  /**
   * Get products for public listing (customer view)
   * Only shows ACTIVE and available products
   */
  async getPublicProducts(query: ProductQueryInput) {
    const result = await productsRepository.findMany({
      ...query,
      status: ProductStatus.ACTIVE,
      isAvailable: true,
    });

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get featured products for homepage
   */
  async getFeaturedProducts(limit: number = 10) {
    const products = await productsRepository.getFeatured(limit);

    return {
      success: true,
      products,
    };
  }
}

// ===========================================
// Custom Errors
// ===========================================

export class ProductNotFoundError extends Error {
  public statusCode = 404;

  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundError';
  }
}

// Export singleton instance
export const productsService = new ProductsService();
