/**
 * Admin Applications Controller - Nasneh API
 * Handles admin endpoints for reviewing vendor/provider applications
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
  vendorApplicationsService,
  providerApplicationsService,
  adminApplicationsService,
  ApplicationNotFoundError,
} from './applications.service.js';
import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

// ===========================================
// Validation Schemas
// ===========================================

const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

// ===========================================
// Vendor Application Admin Controllers
// ===========================================

/**
 * List All Vendor Applications (Admin)
 * GET /api/v1/admin/vendor-applications
 */
export async function listVendorApplications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.query;

    // Validate status if provided
    const validStatus = status
      ? (status as ApplicationStatus)
      : undefined;

    const result = await vendorApplicationsService.getAllApplications(validStatus);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Update Vendor Application Status (Admin)
 * PATCH /api/v1/admin/vendor-applications/:id
 */
export async function updateVendorApplicationStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Validate input
    const validation = updateApplicationStatusSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { status, notes } = validation.data;

    let result;
    if (status === 'APPROVED') {
      result = await adminApplicationsService.approveVendorApplication(id, notes);
    } else {
      result = await adminApplicationsService.rejectVendorApplication(id, notes);
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ApplicationNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof Error && error.message === 'Application is not pending') {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

// ===========================================
// Provider Application Admin Controllers
// ===========================================

/**
 * List All Provider Applications (Admin)
 * GET /api/v1/admin/provider-applications
 */
export async function listProviderApplications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.query;

    // Validate status if provided
    const validStatus = status
      ? (status as ApplicationStatus)
      : undefined;

    const result = await providerApplicationsService.getAllApplications(validStatus);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Update Provider Application Status (Admin)
 * PATCH /api/v1/admin/provider-applications/:id
 */
export async function updateProviderApplicationStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Validate input
    const validation = updateApplicationStatusSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { status, notes } = validation.data;

    let result;
    if (status === 'APPROVED') {
      result = await adminApplicationsService.approveProviderApplication(id, notes);
    } else {
      result = await adminApplicationsService.rejectProviderApplication(id, notes);
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ApplicationNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof Error && error.message === 'Application is not pending') {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}
