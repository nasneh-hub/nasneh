/**
 * Categories Repository - Nasneh API
 * Database operations for categories
 */

import { prisma } from '../../lib/db';

export interface CreateCategoryInput {
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  nameAr?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export class CategoriesRepository {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Find category by ID
   */
  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
            imageUrl: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  /**
   * Get all root categories (no parent)
   */
  async getRootCategories() {
    return prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
            imageUrl: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Get all categories (flat list)
   */
  async getAll(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };

    return prisma.category.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  /**
   * Get category tree (hierarchical)
   */
  async getTree() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Build tree structure
    const categoryMap = new Map();
    const roots: any[] = [];

    // First pass: create map
    categories.forEach((cat: typeof categories[number]) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach((cat: typeof categories[number]) => {
      const node = categoryMap.get(cat.id);
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Delete a category (soft delete by setting isActive to false)
   */
  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Check if slug is unique
   */
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
    return !existing;
  }
}

// Export singleton instance
export const categoriesRepository = new CategoriesRepository();
