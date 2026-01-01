/**
 * Products Controller - Nasneh API
 * Handles HTTP requests for product endpoints
 * Following TECHNICAL_SPEC.md §4. API Endpoints - Vendor Dashboard
 */

import { Response, NextFunction } from 'express';
import { productsService, ProductNotFoundError } from './products.service';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../../types/product.types';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/db';

/**
 * Create Product
 * POST /vendor/products
 */
export async function createProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    const validation = createProductSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    // Get vendor ID from authenticated user
    const vendorId = await getVendorIdFromUser(req.user!.userId);
    if (!vendorId) {
      res.status(403).json({
        success: false,
        error: 'User is not a vendor',
      });
      return;
    }

    const result = await productsService.createProduct(vendorId, validation.data);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Vendor Products
 * GET /vendor/products
 */
export async function getVendorProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate query params
    const validation = productQuerySchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    // Get vendor ID from authenticated user
    const vendorId = await getVendorIdFromUser(req.user!.userId);
    if (!vendorId) {
      res.status(403).json({
        success: false,
        error: 'User is not a vendor',
      });
      return;
    }

    const result = await productsService.getVendorProducts(vendorId, validation.data);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Update Product
 * PATCH /vendor/products/:id
 */
export async function updateProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Validate input
    const validation = updateProductSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    // Check if any fields provided
    if (Object.keys(validation.data).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
      return;
    }

    // Get vendor ID from authenticated user
    const vendorId = await getVendorIdFromUser(req.user!.userId);
    if (!vendorId) {
      res.status(403).json({
        success: false,
        error: 'User is not a vendor',
      });
      return;
    }

    const result = await productsService.updateProduct(id, vendorId, validation.data);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Delete Product (soft delete)
 * DELETE /vendor/products/:id
 */
export async function deleteProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Get vendor ID from authenticated user
    const vendorId = await getVendorIdFromUser(req.user!.userId);
    if (!vendorId) {
      res.status(403).json({
        success: false,
        error: 'User is not a vendor',
      });
      return;
    }

    const result = await productsService.deleteProduct(id, vendorId);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get Public Products (customer view)
 * GET /products
 */
export async function getPublicProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate query params
    const validation = productQuerySchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await productsService.getPublicProducts(validation.data);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Product by ID (customer view)
 * GET /products/:id
 */
export async function getProductById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const result = await productsService.getProductById(id);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get Featured Products
 * GET /products/featured
 */
export async function getFeaturedProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await productsService.getFeaturedProducts(limit);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Get vendor ID from user ID
 * Returns null if user is not a vendor
 */
async function getVendorIdFromUser(userId: string): Promise<string | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });

  return vendor?.id || null;
}
