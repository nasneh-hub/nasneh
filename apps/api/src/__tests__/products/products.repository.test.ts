/**
 * Products Repository Tests - Nasneh API
 * Unit tests for products database operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from '../../modules/products/products.repository';
import { ProductStatus } from '../../types/product.types';

// Mock Prisma client
vi.mock('../../lib/db', () => ({
  prisma: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { prisma } from '../../lib/db';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;

  beforeEach(() => {
    repository = new ProductsRepository();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product with valid data', async () => {
      const vendorId = 'vendor-123';
      const productData = {
        name: 'Test Product',
        nameAr: 'منتج تجريبي',
        description: 'A test product',
        price: 10.5,
        images: ['https://example.com/image.jpg'],
        isAvailable: true,
      };

      const mockProduct = {
        id: 'product-123',
        vendorId,
        ...productData,
        status: ProductStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.create as any).mockResolvedValue(mockProduct);

      const result = await repository.create(vendorId, productData);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vendorId,
          name: productData.name,
          price: productData.price,
          status: ProductStatus.ACTIVE,
        }),
        include: expect.any(Object),
      });
      expect(result.id).toBe('product-123');
    });

    it('should use BHD 3 decimal places for price', async () => {
      const vendorId = 'vendor-123';
      const productData = {
        name: 'Test Product',
        price: 15.999, // BHD uses 3 decimals
        images: [],
        isAvailable: true,
      };

      (prisma.product.create as any).mockResolvedValue({
        id: 'product-123',
        ...productData,
        vendorId,
      });

      await repository.create(vendorId, productData);

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            price: 15.999,
          }),
        })
      );
    });
  });

  describe('findById', () => {
    it('should find product by ID with relations', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        vendor: { id: 'vendor-123', storeName: 'Test Store' },
        category: { id: 'cat-123', name: 'Food', slug: 'food' },
      };

      (prisma.product.findUnique as any).mockResolvedValue(mockProduct);

      const result = await repository.findById('product-123');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-123' },
        include: expect.any(Object),
      });
      expect(result?.vendor.storeName).toBe('Test Store');
    });

    it('should return null for non-existent product', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        { id: 'product-1', name: 'Product 1' },
        { id: 'product-2', name: 'Product 2' },
      ];

      (prisma.product.count as any).mockResolvedValue(50);
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);

      const result = await repository.findMany({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
    });

    it('should filter by vendor ID', async () => {
      (prisma.product.count as any).mockResolvedValue(10);
      (prisma.product.findMany as any).mockResolvedValue([]);

      await repository.findMany({
        vendorId: 'vendor-123',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vendorId: 'vendor-123',
          }),
        })
      );
    });

    it('should filter by price range', async () => {
      (prisma.product.count as any).mockResolvedValue(5);
      (prisma.product.findMany as any).mockResolvedValue([]);

      await repository.findMany({
        minPrice: 10,
        maxPrice: 50,
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 10, lte: 50 },
          }),
        })
      );
    });

    it('should search in name and description', async () => {
      (prisma.product.count as any).mockResolvedValue(3);
      (prisma.product.findMany as any).mockResolvedValue([]);

      await repository.findMany({
        search: 'pizza',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'pizza' } },
              { nameAr: { contains: 'pizza' } },
              { description: { contains: 'pizza' } },
            ]),
          }),
        })
      );
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const mockUpdated = {
        id: 'product-123',
        name: 'Updated Product',
        price: 25.0,
      };

      (prisma.product.update as any).mockResolvedValue(mockUpdated);

      const result = await repository.update('product-123', {
        name: 'Updated Product',
        price: 25.0,
      });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-123' },
        data: expect.objectContaining({
          name: 'Updated Product',
          price: 25.0,
        }),
        include: expect.any(Object),
      });
      expect(result.name).toBe('Updated Product');
    });
  });

  describe('softDelete', () => {
    it('should set status to DELETED', async () => {
      (prisma.product.update as any).mockResolvedValue({
        id: 'product-123',
        status: ProductStatus.DELETED,
      });

      await repository.softDelete('product-123');

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-123' },
        data: { status: ProductStatus.DELETED },
      });
    });
  });

  describe('belongsToVendor', () => {
    it('should return true if product belongs to vendor', async () => {
      (prisma.product.findFirst as any).mockResolvedValue({ id: 'product-123' });

      const result = await repository.belongsToVendor('product-123', 'vendor-123');

      expect(result).toBe(true);
    });

    it('should return false if product does not belong to vendor', async () => {
      (prisma.product.findFirst as any).mockResolvedValue(null);

      const result = await repository.belongsToVendor('product-123', 'other-vendor');

      expect(result).toBe(false);
    });
  });

  describe('getFeatured', () => {
    it('should return featured products', async () => {
      const mockFeatured = [
        { id: 'product-1', name: 'Featured 1' },
        { id: 'product-2', name: 'Featured 2' },
      ];

      (prisma.product.findMany as any).mockResolvedValue(mockFeatured);

      const result = await repository.getFeatured(10);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          status: ProductStatus.ACTIVE,
          isAvailable: true,
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toHaveLength(2);
    });
  });
});
