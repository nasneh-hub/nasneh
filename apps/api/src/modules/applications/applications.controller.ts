/**
 * Applications Controller - Nasneh API
 * Handles HTTP requests for vendor and provider application endpoints
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
  vendorApplicationsService,
  providerApplicationsService,
  ApplicationAlreadyExistsError,
  ApplicationNotFoundError,
} from './applications.service.js';
import { z } from 'zod';
import { VendorCategory, ProviderCategory } from '@prisma/client';

// ===========================================
// Validation Schemas
// ===========================================

const createVendorApplicationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  crNumber: z.string().optional(),
  category: z.nativeEnum(VendorCategory),
  description: z.string().optional(),
});

const createProviderApplicationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.nativeEnum(ProviderCategory),
  qualifications: z.string().optional(),
  description: z.string().optional(),
});

// ===========================================
// Vendor Application Controllers
// ===========================================

/**
 * Submit Vendor Application
 * POST /api/v1/vendor-applications
 */
export async function submitVendorApplication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    const validation = createVendorApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await vendorApplicationsService.submitApplication({
      userId: req.user!.userId,
      ...validation.data,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ApplicationAlreadyExistsError) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get My Vendor Application
 * GET /api/v1/vendor-applications/me
 */
export async function getMyVendorApplication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await vendorApplicationsService.getMyApplication(
      req.user!.userId
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// ===========================================
// Provider Application Controllers
// ===========================================

/**
 * Submit Provider Application
 * POST /api/v1/provider-applications
 */
export async function submitProviderApplication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    const validation = createProviderApplicationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await providerApplicationsService.submitApplication({
      userId: req.user!.userId,
      ...validation.data,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ApplicationAlreadyExistsError) {
      res.status(409).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get My Provider Application
 * GET /api/v1/provider-applications/me
 */
export async function getMyProviderApplication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await providerApplicationsService.getMyApplication(
      req.user!.userId
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
