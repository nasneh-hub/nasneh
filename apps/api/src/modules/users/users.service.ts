/**
 * Users Service
 * 
 * Business logic for user profile operations with RBAC.
 */

import { usersRepository } from './users.repository.js';
import {
  ProfileErrorCode,
  UserRole,
  type UpdateProfileInput,
  type AdminUpdateUserInput,
  type UserQuery,
  type PaginatedUsersResponse,
} from '../../types/user.types.js';
import type { Prisma } from '@prisma/client';

// ===========================================
// Custom Errors
// ===========================================

export class ProfileError extends Error {
  constructor(
    public code: ProfileErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}

// ===========================================
// Service
// ===========================================

export const usersService = {
  /**
   * Get current user's profile
   */
  async getMyProfile(userId: string) {
    const user = await usersRepository.findById(userId);
    
    if (!user) {
      throw new ProfileError(
        ProfileErrorCode.USER_NOT_FOUND,
        'User not found'
      );
    }

    return user;
  },

  /**
   * Update current user's profile
   * Users can only update their own profile
   */
  async updateMyProfile(userId: string, data: UpdateProfileInput) {
    // Check if user exists
    const userExists = await usersRepository.exists(userId);
    if (!userExists) {
      throw new ProfileError(
        ProfileErrorCode.USER_NOT_FOUND,
        'User not found'
      );
    }

    // Check email uniqueness if being updated
    if (data.email) {
      const existingUser = await usersRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ProfileError(
          ProfileErrorCode.EMAIL_ALREADY_EXISTS,
          'Email is already in use'
        );
      }
    }

    // Update profile
    return usersRepository.update(userId, {
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      preferredLang: data.preferredLang,
    });
  },

  /**
   * Get user by ID (admin only)
   */
  async getUserById(
    requesterId: string,
    requesterRole: UserRole,
    targetUserId: string
  ) {
    // Only admins can view other users' profiles
    if (requesterRole !== UserRole.ADMIN && requesterId !== targetUserId) {
      throw new ProfileError(
        ProfileErrorCode.PERMISSION_DENIED,
        'You can only view your own profile'
      );
    }

    const user = await usersRepository.findById(targetUserId);
    
    if (!user) {
      throw new ProfileError(
        ProfileErrorCode.USER_NOT_FOUND,
        'User not found'
      );
    }

    return user;
  },

  /**
   * Update user by ID (admin only for other users)
   */
  async updateUserById(
    requesterId: string,
    requesterRole: UserRole,
    targetUserId: string,
    data: AdminUpdateUserInput
  ) {
    // Non-admins can only update their own profile
    if (requesterRole !== UserRole.ADMIN && requesterId !== targetUserId) {
      throw new ProfileError(
        ProfileErrorCode.PERMISSION_DENIED,
        'You can only update your own profile'
      );
    }

    // Non-admins cannot update role or status
    if (requesterRole !== UserRole.ADMIN && (data.role || data.status)) {
      throw new ProfileError(
        ProfileErrorCode.PERMISSION_DENIED,
        'Only admins can update role or status'
      );
    }

    // Check if target user exists
    const userExists = await usersRepository.exists(targetUserId);
    if (!userExists) {
      throw new ProfileError(
        ProfileErrorCode.USER_NOT_FOUND,
        'User not found'
      );
    }

    // Admins cannot change their own role
    if (requesterRole === UserRole.ADMIN && requesterId === targetUserId && data.role) {
      throw new ProfileError(
        ProfileErrorCode.CANNOT_UPDATE_OWN_ROLE,
        'Admins cannot change their own role'
      );
    }

    // Admins cannot suspend themselves
    if (requesterRole === UserRole.ADMIN && requesterId === targetUserId && data.status === 'SUSPENDED') {
      throw new ProfileError(
        ProfileErrorCode.CANNOT_SUSPEND_SELF,
        'Admins cannot suspend themselves'
      );
    }

    // Check email uniqueness if being updated
    if (data.email) {
      const existingUser = await usersRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== targetUserId) {
        throw new ProfileError(
          ProfileErrorCode.EMAIL_ALREADY_EXISTS,
          'Email is already in use'
        );
      }
    }

    // Build update data
    const updateData: Prisma.UserUpdateInput = {
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      preferredLang: data.preferredLang,
    };

    // Admin-only fields
    if (requesterRole === UserRole.ADMIN) {
      if (data.role) updateData.role = data.role as any;
      if (data.status) updateData.status = data.status as any;
    }

    return usersRepository.update(targetUserId, updateData);
  },

  /**
   * List users with pagination (admin only)
   */
  async listUsers(
    requesterRole: UserRole,
    query: UserQuery
  ): Promise<PaginatedUsersResponse> {
    // Only admins can list users
    if (requesterRole !== UserRole.ADMIN) {
      throw new ProfileError(
        ProfileErrorCode.PERMISSION_DENIED,
        'Only admins can list users'
      );
    }

    const { page, limit, role, status, search } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role as any;
    if (status) where.status = status as any;

    // Search by name, email, or phone
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const { total, users } = await usersRepository.findMany({
      skip,
      take: limit,
      where,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users as any,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};
