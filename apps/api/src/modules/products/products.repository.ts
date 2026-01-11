/**
 * Products Repository - Nasneh API
 * Database operations for products
 */

import { prisma } from '../../lib/db.js';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  ProductStatus,
} from '../../types/product.types.js';

export class ProductsRepository {
  /**
   * Create a new product
   */
  async create(vendorId: string, data: CreateProductInput) {
    return prisma.product.create({
      data: {
        vendorId,
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        price: data.price,
        categoryId: data.categoryId,
        images: data.images,
        isAvailable: data.isAvailable,
        status: ProductStatus.ACTIVE,
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Find product by ID
   */
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
            category: true,
            status: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
            category: true,
            status: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Find many products filters and pagination
   */
  async findMany(query: ProductQueryInput) {
    const {
      vendorId,
      categoryId,
      status,
      isAvailable,
      minPrice,
      maxPrice,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: any = {};

    if (vendorId) where.vendorId = vendorId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (typeof isAvailable === 'boolean') where.isAvailable = isAvailable;

    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    // Search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Default: only show active products
    if (!status) {
      where.status = ProductStatus.ACTIVE;
    }

    // Count total
    const total = await prisma.product.count({ where });

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update a product
   */
  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.images && { images: data.images }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Soft delete a product (set status to DELETED)
   */
  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: ProductStatus.DELETED },
    });
  }

  /**
   * Hard delete a product
   */
  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Check if product belongs to vendor
   */
  async belongsToVendor(productId: string, vendorId: string): Promise<boolean> {
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId },
      select: { id: true },
    });
    return !!product;
  }

  /**
   * Get featured products (for homepage)
   */
  async getFeatured(limit: number = 10) {
    return prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        isAvailable: true,
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get products by vendor
   */
  async getByVendor(vendorId: string, includeInactive: boolean = false) {
    const where: any = { vendorId };
    if (!includeInactive) {
      where.status = ProductStatus.ACTIVE;
    }

    return prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Export singleton instance
export const productsRepository = new ProductsRepository();
