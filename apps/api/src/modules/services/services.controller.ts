import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { servicesService, ProviderNotFoundError, ProviderNotActiveError, ServiceNotFoundError, ServiceNotOwnedError, InvalidServiceTypeFieldError } from './services.service.js';
import { createServiceSchema, updateServiceSchema, serviceQuerySchema, providerServiceQuerySchema } from '../../types/service.types.js';
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
 * Get provider's services with filters, sorting, and pagination
 * GET /provider/services
 * 
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - serviceType: APPOINTMENT | DELIVERY_DATE | PICKUP_DROPOFF
 * - status: ACTIVE | INACTIVE | DELETED
 * - categoryId: uuid
 * - minPrice: number
 * - maxPrice: number
 * - isAvailable: boolean
 * - search: string (keyword search)
 * - sortBy: newest | oldest | price_asc | price_desc | name_asc | name_desc
 * - includeDeleted: boolean (default false)
 */
export async function getProviderServices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const query = providerServiceQuerySchema.parse(req.query);
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
 * Get provider service stats
 * GET /provider/services/stats
 */
export async function getProviderServiceStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const stats = await servicesService.getProviderServiceStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
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
 * Get public services list with filters, sorting, and pagination
 * GET /services
 * 
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - providerId: uuid (filter by provider)
 * - categoryId: uuid (filter by category)
 * - serviceType: APPOINTMENT | DELIVERY_DATE | PICKUP_DROPOFF
 * - minPrice: number
 * - maxPrice: number
 * - isAvailable: boolean (default true)
 * - search: string (keyword search in name, description)
 * - sortBy: newest | oldest | price_asc | price_desc | name_asc | name_desc
 */
export async function getPublicServices(req: Request, res: Response, next: NextFunction): Promise<void> {
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
 * Get services by category
 * GET /services/category/:categoryId
 */
export async function getServicesByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { categoryId } = req.params;
    const query = serviceQuerySchema.parse(req.query);
    const result = await servicesService.getServicesByCategory(categoryId, query);

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
 * Get services by provider (public view)
 * GET /services/provider/:providerId
 */
export async function getServicesByProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { providerId } = req.params;
    const query = serviceQuerySchema.parse(req.query);
    const result = await servicesService.getServicesByProvider(providerId, query);

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
 * Search services
 * GET /services/search
 */
export async function searchServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query (q) is required' });
      return;
    }

    const query = serviceQuerySchema.parse(req.query);
    const result = await servicesService.searchServices(q, query);

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
 * Get featured services
 * GET /services/featured
 */
export async function getFeaturedServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const result = await servicesService.getFeaturedServices(Math.min(limit, 50));

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific service by ID (public view)
 * GET /services/:id
 */
export async function getPublicServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const service = await servicesService.getPublicServiceById(id);

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
