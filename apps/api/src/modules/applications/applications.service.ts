/**
 * Applications Service - Nasneh API
 * Business logic for vendor and provider applications
 */

import {
  vendorApplicationsRepository,
  providerApplicationsRepository,
  CreateVendorApplicationInput,
  CreateProviderApplicationInput,
} from './applications.repository.js';
import { ApplicationStatus } from '@prisma/client';

// ===========================================
// Custom Errors
// ===========================================

export class ApplicationAlreadyExistsError extends Error {
  constructor(type: 'vendor' | 'provider') {
    super(`You already have a pending ${type} application`);
    this.name = 'ApplicationAlreadyExistsError';
  }
}

export class ApplicationNotFoundError extends Error {
  constructor() {
    super('Application not found');
    this.name = 'ApplicationNotFoundError';
  }
}

// ===========================================
// Vendor Applications Service
// ===========================================

export class VendorApplicationsService {
  /**
   * Submit a new vendor application
   */
  async submitApplication(data: CreateVendorApplicationInput) {
    // Check if user already has a pending application
    const hasPending = await vendorApplicationsRepository.hasPendingApplication(
      data.userId
    );

    if (hasPending) {
      throw new ApplicationAlreadyExistsError('vendor');
    }

    const application = await vendorApplicationsRepository.create(data);

    return {
      success: true,
      data: application,
      message: 'Vendor application submitted successfully',
    };
  }

  /**
   * Get user's application status
   */
  async getMyApplication(userId: string) {
    const application = await vendorApplicationsRepository.findByUserId(userId);

    if (!application) {
      return {
        success: true,
        data: null,
        message: 'No application found',
      };
    }

    return {
      success: true,
      data: application,
    };
  }

  /**
   * Get all applications (admin only)
   */
  async getAllApplications(status?: ApplicationStatus) {
    const applications = await vendorApplicationsRepository.findAll(status);

    return {
      success: true,
      data: applications,
      count: applications.length,
    };
  }

  /**
   * Get application by ID (admin only)
   */
  async getApplicationById(id: string) {
    const application = await vendorApplicationsRepository.findById(id);

    if (!application) {
      throw new ApplicationNotFoundError();
    }

    return {
      success: true,
      data: application,
    };
  }
}

// ===========================================
// Provider Applications Service
// ===========================================

export class ProviderApplicationsService {
  /**
   * Submit a new provider application
   */
  async submitApplication(data: CreateProviderApplicationInput) {
    // Check if user already has a pending application
    const hasPending = await providerApplicationsRepository.hasPendingApplication(
      data.userId
    );

    if (hasPending) {
      throw new ApplicationAlreadyExistsError('provider');
    }

    const application = await providerApplicationsRepository.create(data);

    return {
      success: true,
      data: application,
      message: 'Provider application submitted successfully',
    };
  }

  /**
   * Get user's application status
   */
  async getMyApplication(userId: string) {
    const application = await providerApplicationsRepository.findByUserId(userId);

    if (!application) {
      return {
        success: true,
        data: null,
        message: 'No application found',
      };
    }

    return {
      success: true,
      data: application,
    };
  }

  /**
   * Get all applications (admin only)
   */
  async getAllApplications(status?: ApplicationStatus) {
    const applications = await providerApplicationsRepository.findAll(status);

    return {
      success: true,
      data: applications,
      count: applications.length,
    };
  }

  /**
   * Get application by ID (admin only)
   */
  async getApplicationById(id: string) {
    const application = await providerApplicationsRepository.findById(id);

    if (!application) {
      throw new ApplicationNotFoundError();
    }

    return {
      success: true,
      data: application,
    };
  }
}

// Export singleton instances
export const vendorApplicationsService = new VendorApplicationsService();
export const providerApplicationsService = new ProviderApplicationsService();
