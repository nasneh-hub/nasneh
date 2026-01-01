import { prisma } from '../../lib/db';
import { Prisma, ServiceType as PrismaServiceType } from '@prisma/client';
import type { CreateServiceInput, UpdateServiceInput, ServiceQuery } from '../../types/service.types';

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
      data: data as Prisma.ServiceProviderUpdateInput,
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

  async findByProviderId(providerId: string, query: ServiceQuery) {
    const { page, limit, serviceType, isAvailable, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {
      providerId,
      status: { not: 'DELETED' },
      ...(serviceType && { serviceType: serviceType as PrismaServiceType }),
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
        orderBy: { createdAt: 'desc' },
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
    };
  },

  async findPublic(query: ServiceQuery) {
    const { page, limit, providerId, categoryId, serviceType, minPrice, maxPrice, isAvailable, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {
      status: 'ACTIVE',
      isAvailable: isAvailable ?? true,
      provider: { status: 'ACTIVE' },
      ...(providerId && { providerId }),
      ...(categoryId && { categoryId }),
      ...(serviceType && { serviceType: serviceType as PrismaServiceType }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
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
        orderBy: { createdAt: 'desc' },
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
    };
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
      data: { status: 'DELETED' },
    });
  },
};
