import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';
import {
  createService,
  getProviderServices,
  getProviderServiceById,
  getProviderServiceStats,
  updateService,
  deleteService,
  toggleServiceAvailability,
  getPublicServices,
  getPublicServiceById,
  getServicesByCategory,
  getServicesByProvider,
  searchServices,
  getFeaturedServices,
} from './services.controller.js';
import { getServiceSlots } from '../availability/availability.routes.js';

// ===========================================
// Provider Routes (/provider/services)
// ===========================================

export const providerServicesRouter: Router = Router();

// All provider routes require authentication and provider role
providerServicesRouter.use(authMiddleware);
providerServicesRouter.use(requireRoles(UserRole.PROVIDER));

// POST /provider/services - Create a new service
providerServicesRouter.post('/', createService);

// GET /provider/services - List provider's services with filters, sorting, pagination
providerServicesRouter.get('/', getProviderServices);

// GET /provider/services/stats - Get service stats
providerServicesRouter.get('/stats', getProviderServiceStats);

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

// GET /services - List public services with filters, sorting, pagination
publicServicesRouter.get('/', getPublicServices);

// GET /services/search - Search services by keyword
publicServicesRouter.get('/search', searchServices);

// GET /services/featured - Get featured services
publicServicesRouter.get('/featured', getFeaturedServices);

// GET /services/category/:categoryId - Get services by category
publicServicesRouter.get('/category/:categoryId', getServicesByCategory);

// GET /services/provider/:providerId - Get services by provider (public view)
publicServicesRouter.get('/provider/:providerId', getServicesByProvider);

// GET /services/:id/slots - Get available slots for a service
publicServicesRouter.get('/:id/slots', getServiceSlots);

// GET /services/:id - Get a specific service (must be last due to :id param)
publicServicesRouter.get('/:id', getPublicServiceById);
