import { prisma } from '../../lib/db.js';
import type { 
  Prisma as PrismaTypes, 
  ServiceType as PrismaServiceType, 
  ServiceStatus as PrismaServiceStatus 
} from '@prisma/client';
import prismaClient from '@prisma/client';
const { Prisma, ServiceType, ServiceStatus } = prismaClient;
import type { CreateServiceInput, UpdateServiceInput, ServiceQuery, ProviderServiceQuery } from '../../types/service.types.js';
import { ServiceSortBy } from '../../types/service.types.js';

// ===========================================
// Sorting Helper
// ===========================================

function getSortOrder(sortBy: string): PrismaTypes.ServiceOrderByWithRelationInput {
  switch (sortBy) {
    case ServiceSortBy.NEWEST:
      return { createdAt: 'desc' };
    case ServiceSortBy.OLDEST:
      return { createdAt: 'asc' };
    case ServiceSortBy.PRICE_ASC:
      return { price: 'asc' };
    case ServiceSortBy.PRICE_DESC:
      return { price: 'desc' };
    case ServiceSortBy.NAME_ASC:
      return { name: 'asc' };
    case ServiceSortBy.NAME_DESC:
      return { name: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}

// ===========================================
// Service Provider Repository
// ===========================================

export const providerRepository = {
  async findById(id: string) {
    return prisma.serviceProvider.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
  },

  async findByUserId(userId: string) {
    return prisma.serviceProvider.findUnique({
      where: { userId },
    });
  },

  async create(userId: string, data: {
    businessName: string;
    description?: string;
    logoUrl?: string;
    category: string;
  }) {
    return prisma.serviceProvider.create({
      data: {
        userId,
        businessName: data.businessName,
        description: data.description,
        logoUrl: data.logoUrl,
        category: data.category as 'HOME' | 'PERSONAL' | 'PROFESSIONAL',
      },
    });
  },

  async update(id: string, data: Partial<{
    businessName: string;
    description: string;
    logoUrl: string;
    status: string;
  }>) {
    return prisma.serviceProvider.update({
      where: { id },
      data: data as PrismaTypes.ServiceProviderUpdateInput,
    });
  },
};

// ===========================================
// Service Repository
// ===========================================

export const serviceRepository = {
  async findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
            status: true,
            category: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
      },
    });
  },

  /**
   * Find services by provider ID (for provider dashboard)
   * Includes all statuses except DELETED by default
   */
  async findByProviderId(providerId: string, query: ProviderServiceQuery) {
    const { 
      page, 
      limit, 
      serviceType, 
      status,
      categoryId,
      minPrice,
      maxPrice,
      isAvailable, 
      search, 
      sortBy,
      includeDeleted,
    } = query;
    const skip = (page - 1) * limit;

    // Build price filter
    let priceFilter: PrismaTypes.DecimalFilter<"Service"> | undefined;
    if (minPrice !== undefined || maxPrice !== undefined) {
      priceFilter = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    }

    const where: PrismaTypes.ServiceWhereInput = {
      providerId,
      // By default exclude DELETED, unless includeDeleted is true
      ...(includeDeleted ? {} : { status: { not: 'DELETED' as PrismaServiceStatus } }),
      ...(status && { status: status as PrismaServiceStatus }),
      ...(serviceType && { serviceType: serviceType as PrismaServiceType }),
      ...(categoryId && { categoryId }),
      ...(priceFilter && { price: priceFilter }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { nameAr: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, nameAr: true },
          },
        },
        orderBy: getSortOrder(sortBy),
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      filters: {
        ...(serviceType && { serviceType }),
        ...(categoryId && { categoryId }),
        ...(status && { status }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(search && { search }),
      },
      sortBy,
    };
  },

  /**
   * Find public services (for customers)
   * Only returns ACTIVE services from ACTIVE providers
   */
  async findPublic(query: ServiceQuery) {
    const { 
      page, 
      limit, 
      providerId, 
      categoryId, 
      serviceType, 
      minPrice, 
      maxPrice, 
      isAvailable, 
      search,
      sortBy,
    } = query;
    const skip = (page - 1) * limit;

    // Build price filter
    let priceFilter: PrismaTypes.DecimalFilter<"Service"> | undefined;
    if (minPrice !== undefined || maxPrice !== undefined) {
      priceFilter = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    }

    const where: PrismaTypes.ServiceWhereInput = {
      status: 'ACTIVE' as PrismaServiceStatus,
      // Default to available services only, unless explicitly set to false
      isAvailable: isAvailable !== false,
      provider: { status: 'ACTIVE' },
      ...(providerId && { providerId }),
      ...(categoryId && { categoryId }),
      ...(serviceType && { serviceType: serviceType as PrismaServiceType }),
      ...(priceFilter && { price: priceFilter }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { nameAr: { contains: search } },
          { description: { contains: search } },
          { descriptionAr: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              logoUrl: true,
              category: true,
            },
          },
          category: {
            select: { id: true, name: true, nameAr: true },
          },
        },
        orderBy: getSortOrder(sortBy),
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      filters: {
        ...(serviceType && { serviceType }),
        ...(categoryId && { categoryId }),
        ...(providerId && { providerId }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(search && { search }),
      },
      sortBy,
    };
  },

  /**
   * Find services by category (for category browsing)
   */
  async findByCategory(categoryId: string, query: ServiceQuery) {
    return this.findPublic({ ...query, categoryId });
  },

  /**
   * Find services by provider (for provider profile page)
   */
  async findByProvider(providerId: string, query: ServiceQuery) {
    return this.findPublic({ ...query, providerId });
  },

  /**
   * Search services with keyword
   */
  async search(keyword: string, query: ServiceQuery) {
    return this.findPublic({ ...query, search: keyword });
  },

  /**
   * Get featured/popular services
   * For now, returns newest services. Can be enhanced with popularity metrics later.
   */
  async findFeatured(limit: number = 10) {
    const where: PrismaTypes.ServiceWhereInput = {
      status: 'ACTIVE' as PrismaServiceStatus,
      isAvailable: true,
      provider: { status: 'ACTIVE' },
    };

    const data = await prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
            category: true,
          },
        },
        category: {
          select: { id: true, name: true, nameAr: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { data };
  },

  async create(providerId: string, input: CreateServiceInput) {
    return prisma.service.create({
      data: {
        providerId,
        name: input.name,
        nameAr: input.nameAr,
        description: input.description,
        descriptionAr: input.descriptionAr,
        price: input.price,
        serviceType: input.serviceType as PrismaServiceType,
        durationMinutes: 'durationMinutes' in input ? input.durationMinutes : null,
        preparationDays: 'preparationDays' in input ? input.preparationDays : null,
        categoryId: input.categoryId,
        images: input.images,
        isAvailable: input.isAvailable,
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
          },
        },
        category: {
          select: { id: true, name: true, nameAr: true },
        },
      },
    });
  },

  async update(id: string, input: UpdateServiceInput) {
    return prisma.service.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.descriptionAr !== undefined && { descriptionAr: input.descriptionAr }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.images !== undefined && { images: input.images }),
        ...(input.isAvailable !== undefined && { isAvailable: input.isAvailable }),
        ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
        ...(input.preparationDays !== undefined && { preparationDays: input.preparationDays }),
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
          },
        },
        category: {
          select: { id: true, name: true, nameAr: true },
        },
      },
    });
  },

  async softDelete(id: string) {
    return prisma.service.update({
      where: { id },
      data: { status: 'DELETED' as PrismaServiceStatus },
    });
  },

  /**
   * Count services by provider (for stats)
   */
  async countByProvider(providerId: string) {
    const [total, active, inactive] = await Promise.all([
      prisma.service.count({ where: { providerId, status: { not: 'DELETED' as PrismaServiceStatus } } }),
      prisma.service.count({ where: { providerId, status: 'ACTIVE' as PrismaServiceStatus } }),
      prisma.service.count({ where: { providerId, status: 'INACTIVE' as PrismaServiceStatus } }),
    ]);
    return { total, active, inactive };
  },
};
