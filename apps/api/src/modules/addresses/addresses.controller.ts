/**
 * Addresses Controller
 * 
 * HTTP handlers for address endpoints.
 */

import type { Request, Response } from 'express';
import { addressesService, AddressError } from './addresses.service';
import {
  createAddressSchema,
  updateAddressSchema,
  AddressErrorCode,
} from '../../types/address.types';
import { UserRole } from '../../types/user.types';

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
 * Handle address errors and return appropriate HTTP response
 */
function handleAddressError(res: Response, error: unknown) {
  if (error instanceof AddressError) {
    const statusCode = getStatusCodeForError(error.code);
    return res.status(statusCode).json({
      error: error.message,
      code: error.code,
    });
  }

  console.error('Address error:', error);
  return res.status(500).json({ error: 'Internal server error' });
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: AddressErrorCode): number {
  switch (code) {
    case AddressErrorCode.ADDRESS_NOT_FOUND:
    case AddressErrorCode.USER_NOT_FOUND:
      return 404;
    case AddressErrorCode.PERMISSION_DENIED:
      return 403;
    case AddressErrorCode.CANNOT_DELETE_DEFAULT:
      return 422;
    default:
      return 400;
  }
}

// ===========================================
// My Addresses Endpoints
// ===========================================

/**
 * GET /users/me/addresses
 * List current user's addresses
 */
export async function listMyAddresses(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const addresses = await addressesService.listAddresses(userId, userRole, userId);

    return res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    return handleAddressError(res, error);
  }
}

/**
 * POST /users/me/addresses
 * Create address for current user
 */
export async function createMyAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const parseResult = createAddressSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const address = await addressesService.createAddress(userId, userRole, userId, parseResult.data);

    return res.status(201).json({
      success: true,
      data: address,
      message: 'Address created successfully',
    });
  } catch (error) {
    return handleAddressError(res, error);
  }
}

/**
 * GET /users/me/addresses/:id
 * Get specific address for current user
 */
export async function getMyAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);
    const { id: addressId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const address = await addressesService.getAddressById(userId, userRole, addressId);

    return res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    return handleAddressError(res, error);
  }
}

/**
 * PATCH /users/me/addresses/:id
 * Update specific address for current user
 */
export async function updateMyAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);
    const { id: addressId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const parseResult = updateAddressSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const address = await addressesService.updateAddress(userId, userRole, addressId, parseResult.data);

    return res.json({
      success: true,
      data: address,
      message: 'Address updated successfully',
    });
  } catch (error) {
    return handleAddressError(res, error);
  }
}

/**
 * DELETE /users/me/addresses/:id
 * Delete specific address for current user
 */
export async function deleteMyAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);
    const { id: addressId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await addressesService.deleteAddress(userId, userRole, addressId);

    return res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    return handleAddressError(res, error);
  }
}

/**
 * POST /users/me/addresses/:id/default
 * Set address as default for current user
 */
export async function setMyDefaultAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = mapToUserRole(req.user?.role);
    const { id: addressId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const address = await addressesService.setDefaultAddress(userId, userRole, addressId);

    return res.json({
      success: true,
      data: address,
      message: 'Default address set successfully',
    });
  } catch (error) {
    return handleAddressError(res, error);
  }
}

// ===========================================
// Admin Endpoints (for managing other users' addresses)
// ===========================================

/**
 * GET /users/:userId/addresses
 * List addresses for a specific user (admin only)
 */
export async function listUserAddresses(req: AuthenticatedRequest, res: Response) {
  try {
    const requesterId = req.user?.id;
    const requesterRole = mapToUserRole(req.user?.role);
    const { userId: targetUserId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const addresses = await addressesService.listAddresses(requesterId, requesterRole, targetUserId);

    return res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    return handleAddressError(res, error);
  }
}

/**
 * POST /users/:userId/addresses
 * Create address for a specific user (admin only)
 */
export async function createUserAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const requesterId = req.user?.id;
    const requesterRole = mapToUserRole(req.user?.role);
    const { userId: targetUserId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const parseResult = createAddressSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const address = await addressesService.createAddress(requesterId, requesterRole, targetUserId, parseResult.data);

    return res.status(201).json({
      success: true,
      data: address,
      message: 'Address created successfully',
    });
  } catch (error) {
    return handleAddressError(res, error);
  }
}
