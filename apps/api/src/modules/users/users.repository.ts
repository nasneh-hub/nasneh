/**
 * Users Repository
 * 
 * Database operations for user profiles.
 */

import { prisma } from '../../lib/db';
import type { Prisma } from '@prisma/client';

// ===========================================
// Select Fields (exclude sensitive data)
// ===========================================

const userSelectFields = {
  id: true,
  phone: true,
  name: true,
  email: true,
  avatarUrl: true,
  role: true,
  status: true,
  preferredLang: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ===========================================
// Repository
// ===========================================

export const usersRepository = {
  /**
   * Find user by ID
   */
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: userSelectFields,
    });
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  /**
   * Find user by phone
   */
  async findByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });
  },

  /**
   * Update user profile
   */
  async update(userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: userSelectFields,
    });
  },

  /**
   * List users with pagination and filters (admin only)
   */
  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        select: userSelectFields,
      }),
    ]);

    return { total, users };
  },

  /**
   * Check if user exists
   */
  async exists(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return !!user;
  },
};
