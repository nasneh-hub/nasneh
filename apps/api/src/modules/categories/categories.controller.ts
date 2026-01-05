/**
 * Categories Controller - Nasneh API
 * Handles HTTP requests for category endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { categoriesRepository } from './categories.repository.js';

/**
 * Get All Categories
 * GET /api/v1/categories
 * Query params:
 * - type: 'PRODUCT' | 'SERVICE' (optional) - filter by category type
 * - flat: 'true' | 'false' (optional) - return flat list vs hierarchical tree
 */
export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type, flat } = req.query;

    // Get categories based on flat/tree preference
    const useFlat = flat === 'true';
    let categories = useFlat
      ? await categoriesRepository.getAll()
      : await categoriesRepository.getTree();

    // Filter by type if specified
    if (type && (type === 'PRODUCT' || type === 'SERVICE')) {
      categories = await filterCategoriesByType(categories, type, useFlat);
    }

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Category by ID
 * GET /api/v1/categories/:id
 */
export async function getCategoryById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const category = await categoriesRepository.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Category by Slug
 * GET /api/v1/categories/slug/:slug
 */
export async function getCategoryBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;

    const category = await categoriesRepository.findBySlug(slug);

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Helper: Filter categories by type (PRODUCT or SERVICE)
 * Since Category model doesn't have a type field, we filter by checking relations
 */
async function filterCategoriesByType(
  categories: any[],
  type: 'PRODUCT' | 'SERVICE',
  isFlat: boolean
): Promise<any[]> {
  // For flat list, filter directly
  if (isFlat) {
    return categories.filter((cat) => {
      if (type === 'PRODUCT') {
        return cat._count && cat._count.products > 0;
      } else {
        // For SERVICE, we need to check services count
        // Note: Current repository doesn't include services count
        // For now, we'll return categories that don't have products
        // TODO: Update repository to include services count
        return !cat._count || cat._count.products === 0;
      }
    });
  }

  // For tree, recursively filter
  return categories
    .map((cat) => {
      const hasProducts = cat._count && cat._count.products > 0;
      const matchesType =
        type === 'PRODUCT' ? hasProducts : !hasProducts;

      // Recursively filter children
      const filteredChildren = cat.children
        ? filterCategoriesByTypeRecursive(cat.children, type)
        : [];

      // Include category if it matches type OR has matching children
      if (matchesType || filteredChildren.length > 0) {
        return {
          ...cat,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter((cat) => cat !== null);
}

/**
 * Helper: Recursively filter tree categories
 */
function filterCategoriesByTypeRecursive(
  categories: any[],
  type: 'PRODUCT' | 'SERVICE'
): any[] {
  return categories
    .map((cat) => {
      const hasProducts = cat._count && cat._count.products > 0;
      const matchesType =
        type === 'PRODUCT' ? hasProducts : !hasProducts;

      const filteredChildren = cat.children
        ? filterCategoriesByTypeRecursive(cat.children, type)
        : [];

      if (matchesType || filteredChildren.length > 0) {
        return {
          ...cat,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter((cat) => cat !== null);
}
