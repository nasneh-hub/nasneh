import { serviceRepository, providerRepository } from './services.repository';
import { auditService } from '../../lib/audit';
import type { CreateServiceInput, UpdateServiceInput, ServiceQuery } from '../../types/service.types';

// ===========================================
// Custom Errors
// ===========================================

export class ProviderNotFoundError extends Error {
  constructor() {
    super('Provider not found');
    this.name = 'ProviderNotFoundError';
  }
}

export class ProviderNotActiveError extends Error {
  constructor() {
    super('Provider is not active');
    this.name = 'ProviderNotActiveError';
  }
}

export class ServiceNotFoundError extends Error {
  constructor() {
    super('Service not found');
    this.name = 'ServiceNotFoundError';
  }
}

export class ServiceNotOwnedError extends Error {
  constructor() {
    super('Service does not belong to this provider');
    this.name = 'ServiceNotOwnedError';
  }
}

export class InvalidServiceTypeFieldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidServiceTypeFieldError';
  }
}

// ===========================================
// Service Type Validation
// ===========================================

function validateServiceTypeFields(input: CreateServiceInput): void {
  const { serviceType } = input;

  switch (serviceType) {
    case 'APPOINTMENT':
      if (!('durationMinutes' in input) || !input.durationMinutes) {
        throw new InvalidServiceTypeFieldError('APPOINTMENT services require durationMinutes');
      }
      break;
    case 'DELIVERY_DATE':
      if (!('preparationDays' in input) || input.preparationDays === undefined) {
        throw new InvalidServiceTypeFieldError('DELIVERY_DATE services require preparationDays');
      }
      break;
    case 'PICKUP_DROPOFF':
      // preparationDays is optional for PICKUP_DROPOFF
      break;
  }
}

// ===========================================
// Services Service
// ===========================================

export const servicesService = {
  /**
   * Get provider by user ID
   */
  async getProviderByUserId(userId: string) {
    const provider = await providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    return provider;
  },

  /**
   * Create a new service
   */
  async createService(userId: string, input: CreateServiceInput) {
    // Get provider for this user
    const provider = await providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    // Check provider is active
    if (provider.status !== 'ACTIVE') {
      throw new ProviderNotActiveError();
    }

    // Validate service type specific fields
    validateServiceTypeFields(input);

    // Create the service
    const service = await serviceRepository.create(provider.id, input);

    // Audit log
    await auditService.log({
      action: 'service.created',
      entityType: 'service',
      entityId: service.id,
      actorId: userId,
      actorRole: 'provider',
      diff: {
        after: {
          name: service.name,
          serviceType: service.serviceType,
          price: Number(service.price),
        },
      },
    });

    return service;
  },

  /**
   * Get a service by ID
   */
  async getServiceById(serviceId: string) {
    const service = await serviceRepository.findById(serviceId);
    if (!service || service.status === 'DELETED') {
      throw new ServiceNotFoundError();
    }
    return service;
  },

  /**
   * Get services by provider (for provider dashboard)
   */
  async getProviderServices(userId: string, query: ServiceQuery) {
    const provider = await providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    return serviceRepository.findByProviderId(provider.id, query);
  },

  /**
   * Get public services (for customers)
   */
  async getPublicServices(query: ServiceQuery) {
    return serviceRepository.findPublic(query);
  },

  /**
   * Update a service
   */
  async updateService(userId: string, serviceId: string, input: UpdateServiceInput) {
    // Get provider for this user
    const provider = await providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    // Get the service
    const service = await serviceRepository.findById(serviceId);
    if (!service || service.status === 'DELETED') {
      throw new ServiceNotFoundError();
    }

    // Check ownership
    if (service.providerId !== provider.id) {
      throw new ServiceNotOwnedError();
    }

    // Validate service type specific fields if updating them
    // For APPOINTMENT type, don't allow clearing durationMinutes
    if (service.serviceType === 'APPOINTMENT' && input.durationMinutes === null) {
      throw new InvalidServiceTypeFieldError('Cannot remove durationMinutes from APPOINTMENT service');
    }

    // For DELIVERY_DATE type, don't allow clearing preparationDays
    if (service.serviceType === 'DELIVERY_DATE' && input.preparationDays === null) {
      throw new InvalidServiceTypeFieldError('Cannot remove preparationDays from DELIVERY_DATE service');
    }

    // Store old values for audit
    const oldValue = {
      name: service.name,
      price: Number(service.price),
      isAvailable: service.isAvailable,
    };

    // Update the service
    const updatedService = await serviceRepository.update(serviceId, input);

    // Audit log
    await auditService.log({
      action: 'service.updated',
      entityType: 'service',
      entityId: serviceId,
      actorId: userId,
      actorRole: 'provider',
      diff: {
        before: oldValue,
        after: {
          name: updatedService.name,
          price: Number(updatedService.price),
          isAvailable: updatedService.isAvailable,
        },
      },
    });

    return updatedService;
  },

  /**
   * Soft delete a service
   */
  async deleteService(userId: string, serviceId: string) {
    // Get provider for this user
    const provider = await providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    // Get the service
    const service = await serviceRepository.findById(serviceId);
    if (!service || service.status === 'DELETED') {
      throw new ServiceNotFoundError();
    }

    // Check ownership
    if (service.providerId !== provider.id) {
      throw new ServiceNotOwnedError();
    }

    // Soft delete
    await serviceRepository.softDelete(serviceId);

    // Audit log
    await auditService.log({
      action: 'service.deleted',
      entityType: 'service',
      entityId: serviceId,
      actorId: userId,
      actorRole: 'provider',
      diff: {
        before: { name: service.name, status: service.status },
        after: { status: 'DELETED' },
      },
    });

    return { success: true };
  },

  /**
   * Toggle service availability
   */
  async toggleAvailability(userId: string, serviceId: string) {
    // Get provider for this user
    const provider = await providerRepository.findByUserId(userId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }

    // Get the service
    const service = await serviceRepository.findById(serviceId);
    if (!service || service.status === 'DELETED') {
      throw new ServiceNotFoundError();
    }

    // Check ownership
    if (service.providerId !== provider.id) {
      throw new ServiceNotOwnedError();
    }

    // Toggle availability
    const updatedService = await serviceRepository.update(serviceId, {
      isAvailable: !service.isAvailable,
    });

    // Audit log
    await auditService.log({
      action: 'service.availability_toggled',
      entityType: 'service',
      entityId: serviceId,
      actorId: userId,
      actorRole: 'provider',
      diff: {
        before: { isAvailable: service.isAvailable },
        after: { isAvailable: updatedService.isAvailable },
      },
    });

    return updatedService;
  },
};
