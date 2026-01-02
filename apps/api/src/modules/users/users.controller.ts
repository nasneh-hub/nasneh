/**
 * Users Controller
 * 
 * HTTP handlers for user profile endpoints.
 */

import type { Request, Response } from 'express';
import { usersService, ProfileError } from './users.service.js';
import {
  updateProfileSchema,
  adminUpdateUserSchema,
  userQuerySchema,
  ProfileErrorCode,
  UserRole,
} from '../../types/user.types.js';

// ===========================================
// Type Extensions
// ===========================================

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ===========================================
// Profile Endpoints
// ===========================================

/**
 * GET /users/me
 * Get current user's profile
 */
export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await usersService.getMyProfile(userId);

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return handleProfileError(res, error);
  }
}

/**
 * PATCH /users/me
 * Update current user's profile
 */
export async function updateMyProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const profile = await usersService.updateMyProfile(userId, parseResult.data);

    return res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return handleProfileError(res, error);
  }
}

// ===========================================
// Admin Endpoints
// ===========================================

/**
 * GET /users
 * List users (admin only)
 */
export async function listUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate query parameters
    const parseResult = userQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await usersService.listUsers(userRole, parseResult.data);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleProfileError(res, error);
  }
}

/**
 * GET /users/:id
 * Get user by ID (admin can view any, others can only view own)
 */
export async function getUserById(req: AuthenticatedRequest, res: Response) {
  try {
    const requesterId = req.user?.id;
    const requesterRole = mapToUserRole(req.user?.role);
    const { id: targetUserId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await usersService.getUserById(requesterId, requesterRole, targetUserId);

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return handleProfileError(res, error);
  }
}

/**
 * PATCH /users/:id
 * Update user by ID (admin can update any, others can only update own)
 */
export async function updateUserById(req: AuthenticatedRequest, res: Response) {
  try {
    const requesterId = req.user?.id;
    const requesterRole = mapToUserRole(req.user?.role);
    const { id: targetUserId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Use admin schema for admins, regular schema for others
    const schema = requesterRole === UserRole.ADMIN ? adminUpdateUserSchema : updateProfileSchema;
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const profile = await usersService.updateUserById(
      requesterId,
      requesterRole,
      targetUserId,
      parseResult.data
    );

    return res.json({
      success: true,
      data: profile,
      message: 'User updated successfully',
    });
  } catch (error) {
    return handleProfileError(res, error);
  }
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Map user role string to UserRole enum
 */
function mapToUserRole(role?: string): UserRole {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return UserRole.ADMIN;
    case 'PROVIDER':
    case 'VENDOR':
      return UserRole.PROVIDER;
    case 'DRIVER':
      return UserRole.DRIVER;
    default:
      return UserRole.CUSTOMER;
  }
}

/**
 * Handle profile errors and return appropriate HTTP response
 */
function handleProfileError(res: Response, error: unknown) {
  if (error instanceof ProfileError) {
    const statusCode = getStatusCodeForError(error.code);
    return res.status(statusCode).json({
      error: error.message,
      code: error.code,
    });
  }

  console.error('Profile error:', error);
  return res.status(500).json({ error: 'Internal server error' });
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: ProfileErrorCode): number {
  switch (code) {
    case ProfileErrorCode.USER_NOT_FOUND:
      return 404;
    case ProfileErrorCode.PERMISSION_DENIED:
      return 403;
    case ProfileErrorCode.EMAIL_ALREADY_EXISTS:
    case ProfileErrorCode.PHONE_ALREADY_EXISTS:
      return 409;
    case ProfileErrorCode.CANNOT_UPDATE_OWN_ROLE:
    case ProfileErrorCode.CANNOT_SUSPEND_SELF:
      return 422;
    default:
      return 400;
  }
}
