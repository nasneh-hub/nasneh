import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import { UserRole } from '../../types/auth.types';
import {
  createService,
  getProviderServices,
  getProviderServiceById,
  updateService,
  deleteService,
  toggleServiceAvailability,
  getPublicServices,
  getPublicServiceById,
} from './services.controller';

// ===========================================
// Provider Routes (/provider/services)
// ===========================================

export const providerServicesRouter: Router = Router();

// All provider routes require authentication and provider role
providerServicesRouter.use(authMiddleware);
providerServicesRouter.use(requireRoles(UserRole.PROVIDER));

// POST /provider/services - Create a new service
providerServicesRouter.post('/', createService);

// GET /provider/services - List provider's services
providerServicesRouter.get('/', getProviderServices);

// GET /provider/services/:id - Get a specific service
providerServicesRouter.get('/:id', getProviderServiceById);

// PATCH /provider/services/:id - Update a service
providerServicesRouter.patch('/:id', updateService);

// DELETE /provider/services/:id - Soft delete a service
providerServicesRouter.delete('/:id', deleteService);

// PATCH /provider/services/:id/toggle - Toggle availability
providerServicesRouter.patch('/:id/toggle', toggleServiceAvailability);

// ===========================================
// Public Routes (/services)
// ===========================================

export const publicServicesRouter: Router = Router();

// GET /services - List public services
publicServicesRouter.get('/', getPublicServices);

// GET /services/:id - Get a specific service
publicServicesRouter.get('/:id', getPublicServiceById);
