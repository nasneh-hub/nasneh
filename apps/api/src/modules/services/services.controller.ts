import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { servicesService, ProviderNotFoundError, ProviderNotActiveError, ServiceNotFoundError, ServiceNotOwnedError, InvalidServiceTypeFieldError } from './services.service';
import { createServiceSchema, updateServiceSchema, serviceQuerySchema } from '../../types/service.types';
import { ZodError } from 'zod';

// ===========================================
// Provider Services Controller
// ===========================================

/**
 * Create a new service
 * POST /provider/services
 */
export async function createService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const input = createServiceSchema.parse(req.body);
    const service = await servicesService.createService(userId, input);

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    if (error instanceof ProviderNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ProviderNotActiveError) {
      res.status(403).json({ error: error.message });
      return;
    }
    if (error instanceof InvalidServiceTypeFieldError) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Get provider's services
 * GET /provider/services
 */
export async function getProviderServices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const query = serviceQuerySchema.parse(req.query);
    const result = await servicesService.getProviderServices(userId, query);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    if (error instanceof ProviderNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Get a specific service by ID (provider view)
 * GET /provider/services/:id
 */
export async function getProviderServiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const service = await servicesService.getServiceById(id);

    // Verify ownership
    const provider = await servicesService.getProviderByUserId(userId);
    if (service.providerId !== provider.id) {
      res.status(403).json({ error: 'Service does not belong to this provider' });
      return;
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    if (error instanceof ServiceNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ProviderNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Update a service
 * PATCH /provider/services/:id
 */
export async function updateService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const input = updateServiceSchema.parse(req.body);
    const service = await servicesService.updateService(userId, id, input);

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }
    if (error instanceof ProviderNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ServiceNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ServiceNotOwnedError) {
      res.status(403).json({ error: error.message });
      return;
    }
    if (error instanceof InvalidServiceTypeFieldError) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Delete a service (soft delete)
 * DELETE /provider/services/:id
 */
export async function deleteService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    await servicesService.deleteService(userId, id);

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    if (error instanceof ProviderNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ServiceNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ServiceNotOwnedError) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Toggle service availability
 * PATCH /provider/services/:id/toggle
 */
export async function toggleServiceAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const service = await servicesService.toggleAvailability(userId, id);

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    if (error instanceof ProviderNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ServiceNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ServiceNotOwnedError) {
      res.status(403).json({ error: error.message });
      return;
    }
    next(error);
  }
}

// ===========================================
// Public Services Controller
// ===========================================

/**
 * Get public services list
 * GET /services
 */
export async function getPublicServices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = serviceQuerySchema.parse(req.query);
    const result = await servicesService.getPublicServices(query);

    res.json({
      success: true,
      ...result,
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
 * Get a specific service by ID (public view)
 * GET /services/:id
 */
export async function getPublicServiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const service = await servicesService.getServiceById(id);

    // Only return active services to public
    if (service.status !== 'ACTIVE') {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    if (error instanceof ServiceNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
}
