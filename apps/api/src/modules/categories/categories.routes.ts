/**
 * Categories Routes - Nasneh API
 *
 * Public Endpoints:
 * - GET /api/v1/categories           - List all categories
 * - GET /api/v1/categories/:id       - Get category by ID
 * - GET /api/v1/categories/slug/:slug - Get category by slug
 */

import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
} from './categories.controller.js';

const router: Router = Router();

/**
 * @route   GET /api/v1/categories
 * @desc    List all categories (hierarchical tree by default)
 * @access  Public
 * @query   type: 'PRODUCT' | 'SERVICE' (optional) - filter by category type
 * @query   flat: 'true' | 'false' (optional) - return flat list vs tree
 */
router.get('/', getCategories);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/slug/:slug', getCategoryBySlug);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', getCategoryById);

export default router;
