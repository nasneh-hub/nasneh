/**
 * Availability Controller
 * 
 * Handles HTTP requests for availability management.
 * 
 * Provider endpoints:
 * - GET /provider/calendar - Get provider's availability rules and settings
 * - PATCH /provider/calendar - Update availability rules (bulk)
 * - POST /provider/calendar/rules - Create a single availability rule
 * - PATCH /provider/calendar/rules/:id - Update a single rule
 * - DELETE /provider/calendar/rules/:id - Delete a single rule
 * - POST /provider/calendar/overrides - Create an override
 * - PATCH /provider/calendar/overrides/:id - Update an override
 * - DELETE /provider/calendar/overrides/:id - Delete an override
 * - PATCH /provider/calendar/settings - Update availability settings
 * 
 * Public endpoints:
 * - GET /services/:id/slots - Get available slots for a service
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ZodError } from 'zod';
import { prisma } from '../../lib/db';
import {
  createAvailabilityRule,
  createBulkAvailabilityRules,
  getAvailabilityRules,
  updateAvailabilityRule,
  deleteAvailabilityRule,
  createAvailabilityOverride,
  getAvailabilityOverrides,
  updateAvailabilityOverride,
  deleteAvailabilityOverride,
  getAvailabilitySettings,
  updateAvailabilitySettings,
  getAvailableSlots,
  getAvailableDates,
  AvailabilityNotFoundError,
  AvailabilityConflictError,
  AvailabilityValidationError,
} from './availability.service';
import {
  createAvailabilityRuleSchema,
  updateAvailabilityRuleSchema,
  bulkAvailabilityRulesSchema,
  createAvailabilityOverrideSchema,
  updateAvailabilityOverrideSchema,
  updateAvailabilitySettingsSchema,
  getSlotsQuerySchema,
} from '../../types/availability.types';

// ===========================================
// Helper: Get Provider ID from User
// ===========================================

async function getProviderIdFromUser(userId: string): Promise<string | null> {
  const provider = await prisma.serviceProvider.findFirst({
    where: { userId },
    select: { id: true },
  });
  return provider?.id ?? null;
}

// ===========================================
// Provider Calendar Controller
// ===========================================

/**
 * Get provider's availability rules, overrides, and settings
 * GET /provider/calendar
 * 
 * Query params:
 * - startDate: YYYY-MM-DD (for overrides, default: today)
 * - endDate: YYYY-MM-DD (for overrides, default: 30 days from startDate)
 */
export async function getProviderCalendar(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    // Parse date range for overrides
    const today = new Date();
    const startDate = req.query.startDate as string ?? today.toISOString().split('T')[0];
    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    const endDate = req.query.endDate as string ?? defaultEndDate.toISOString().split('T')[0];

    const [rules, overrides, settings] = await Promise.all([
      getAvailabilityRules(providerId, false),
      getAvailabilityOverrides(providerId, startDate, endDate),
      getAvailabilitySettings(providerId),
    ]);

    res.json({
      success: true,
      data: {
        rules,
        overrides,
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update availability rules (bulk replace)
 * PATCH /provider/calendar
 * 
 * Body: { rules: [{ dayOfWeek, startTime, endTime, isActive? }] }
 */
export async function updateProviderCalendar(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const input = bulkAvailabilityRulesSchema.parse(req.body);
    const rules = await createBulkAvailabilityRules(providerId, input.rules);

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    if (error instanceof AvailabilityValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Create a single availability rule
 * POST /provider/calendar/rules
 */
export async function createRule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const input = createAvailabilityRuleSchema.parse(req.body);
    const rule = await createAvailabilityRule(providerId, input);

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    if (error instanceof AvailabilityConflictError) {
      res.status(409).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Update a single availability rule
 * PATCH /provider/calendar/rules/:id
 */
export async function updateRule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const { id } = req.params;
    const input = updateAvailabilityRuleSchema.parse(req.body);
    const rule = await updateAvailabilityRule(id, providerId, input);

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    if (error instanceof AvailabilityNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof AvailabilityConflictError) {
      res.status(409).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Delete a single availability rule
 * DELETE /provider/calendar/rules/:id
 */
export async function deleteRule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const { id } = req.params;
    await deleteAvailabilityRule(id, providerId);

    res.json({
      success: true,
      message: 'Rule deleted successfully',
    });
  } catch (error) {
    if (error instanceof AvailabilityNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Create an availability override
 * POST /provider/calendar/overrides
 */
export async function createOverride(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const input = createAvailabilityOverrideSchema.parse(req.body);
    const override = await createAvailabilityOverride(providerId, input);

    res.status(201).json({
      success: true,
      data: override,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update an availability override
 * PATCH /provider/calendar/overrides/:id
 */
export async function updateOverride(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const { id } = req.params;
    const input = updateAvailabilityOverrideSchema.parse(req.body);
    const override = await updateAvailabilityOverride(id, providerId, input);

    res.json({
      success: true,
      data: override,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    if (error instanceof AvailabilityNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Delete an availability override
 * DELETE /provider/calendar/overrides/:id
 */
export async function deleteOverride(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const { id } = req.params;
    await deleteAvailabilityOverride(id, providerId);

    res.json({
      success: true,
      message: 'Override deleted successfully',
    });
  } catch (error) {
    if (error instanceof AvailabilityNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Update availability settings
 * PATCH /provider/calendar/settings
 */
export async function updateSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const providerId = await getProviderIdFromUser(userId);
    if (!providerId) {
      res.status(404).json({ error: 'Provider profile not found' });
      return;
    }

    const input = updateAvailabilitySettingsSchema.parse(req.body);
    const settings = await updateAvailabilitySettings(providerId, input);

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    next(error);
  }
}

// ===========================================
// Public Slots Controller
// ===========================================

/**
 * Get available slots for a service
 * GET /services/:id/slots
 * 
 * Query params:
 * - startDate: YYYY-MM-DD (required)
 * - endDate: YYYY-MM-DD (required)
 */
export async function getServiceSlots(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: serviceId } = req.params;
    
    // Get service to find provider
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        providerId: true,
        serviceType: true,
        durationMinutes: true,
        preparationDays: true,
        status: true,
        isAvailable: true,
      },
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    if (service.status !== 'ACTIVE' || !service.isAvailable) {
      res.status(400).json({ error: 'Service is not available' });
      return;
    }

    const query = getSlotsQuerySchema.parse(req.query);

    // For APPOINTMENT type, return time slots
    if (service.serviceType === 'APPOINTMENT') {
      const availability = await getAvailableSlots(service.providerId, {
        ...query,
        serviceId,
      });

      res.json({
        success: true,
        data: availability,
      });
      return;
    }

    // For DELIVERY_DATE and PICKUP_DROPOFF, return date availability
    const dateAvailability = await getAvailableDates(
      service.providerId,
      query.startDate,
      query.endDate,
      service.preparationDays ?? 0
    );

    res.json({
      success: true,
      data: dateAvailability,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    next(error);
  }
}
