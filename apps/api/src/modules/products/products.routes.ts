/**
 * Products Routes - Nasneh API
 * Following TECHNICAL_SPEC.md §4. API Endpoints
 *
 * Vendor Endpoints (protected, vendor role required):
 * - GET    /vendor/products      - List vendor's products
 * - POST   /vendor/products      - Create product
 * - PATCH  /vendor/products/:id  - Update product
 * - DELETE /vendor/products/:id  - Soft delete product
 *
 * Public Endpoints:
 * - GET    /products             - List products (with filters)
 * - GET    /products/:id         - Get product details
 * - GET    /products/featured    - Get featured products
 */

import { Router } from 'express';
import {
  createProduct,
  getVendorProducts,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  getProductById,
  getFeaturedProducts,
} from './products.controller';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import { UserRole } from '../../types/auth.types';

// ===========================================
// Vendor Routes (Protected)
// ===========================================

const vendorRouter: Router = Router();

/**
 * @route   GET /vendor/products
 * @desc    List vendor's products
 * @access  Protected (Vendor only)
 * @query   page, limit, status, isAvailable, search, sortBy, sortOrder
 */
vendorRouter.get(
  '/products',
  authMiddleware,
  requireRoles(UserRole.VENDOR, UserRole.ADMIN),
  getVendorProducts
);

/**
 * @route   POST /vendor/products
 * @desc    Create a new product
 * @access  Protected (Vendor only)
 * @body    { name, nameAr?, description?, descriptionAr?, price, categoryId?, images?, isAvailable? }
 */
vendorRouter.post(
  '/products',
  authMiddleware,
  requireRoles(UserRole.VENDOR, UserRole.ADMIN),
  createProduct
);

/**
 * @route   PATCH /vendor/products/:id
 * @desc    Update a product
 * @access  Protected (Vendor only, owner)
 * @body    { name?, nameAr?, description?, descriptionAr?, price?, categoryId?, images?, isAvailable? }
 */
vendorRouter.patch(
  '/products/:id',
  authMiddleware,
  requireRoles(UserRole.VENDOR, UserRole.ADMIN),
  updateProduct
);

/**
 * @route   DELETE /vendor/products/:id
 * @desc    Soft delete a product
 * @access  Protected (Vendor only, owner)
 */
vendorRouter.delete(
  '/products/:id',
  authMiddleware,
  requireRoles(UserRole.VENDOR, UserRole.ADMIN),
  deleteProduct
);

// ===========================================
// Public Routes
// ===========================================

const publicRouter: Router = Router();

/**
 * @route   GET /products/featured
 * @desc    Get featured products for homepage
 * @access  Public
 * @query   limit (default: 10)
 */
publicRouter.get('/featured', getFeaturedProducts);

/**
 * @route   GET /products/:id
 * @desc    Get product details
 * @access  Public
 */
publicRouter.get('/:id', getProductById);

/**
 * @route   GET /products
 * @desc    List products with filters
 * @access  Public
 * @query   vendorId?, categoryId?, minPrice?, maxPrice?, search?, page, limit, sortBy, sortOrder
 */
publicRouter.get('/', getPublicProducts);

export { vendorRouter, publicRouter };
