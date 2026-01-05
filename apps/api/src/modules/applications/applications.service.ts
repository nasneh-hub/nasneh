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


// ===========================================
// Admin Service (for both Vendor & Provider)
// ===========================================

import { prisma } from '../../lib/db.js';
import { UserRole, SubscriptionPlan } from '@prisma/client';

export class AdminApplicationsService {
  /**
   * Approve vendor application
   * Creates Vendor record and updates User role
   */
  async approveVendorApplication(applicationId: string, notes?: string) {
    const application = await vendorApplicationsRepository.findById(applicationId);

    if (!application) {
      throw new ApplicationNotFoundError();
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new Error('Application is not pending');
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.vendorApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
          notes,
        },
      });

      // Create Vendor record
      const vendor = await tx.vendor.create({
        data: {
          userId: application.userId,
          storeName: application.businessName,
          storeDescription: application.description,
          category: application.category,
          subscriptionPlan: SubscriptionPlan.BASIC,
          status: 'APPROVED',
        },
      });

      // Update User role
      await tx.user.update({
        where: { id: application.userId },
        data: { role: UserRole.VENDOR },
      });

      return { application: updatedApplication, vendor };
    });

    return {
      success: true,
      data: result,
      message: 'Vendor application approved successfully',
    };
  }

  /**
   * Reject vendor application
   */
  async rejectVendorApplication(applicationId: string, notes?: string) {
    const application = await vendorApplicationsRepository.findById(applicationId);

    if (!application) {
      throw new ApplicationNotFoundError();
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new Error('Application is not pending');
    }

    const updatedApplication = await vendorApplicationsRepository.update(
      applicationId,
      {
        status: ApplicationStatus.REJECTED,
        notes,
      }
    );

    return {
      success: true,
      data: updatedApplication,
      message: 'Vendor application rejected',
    };
  }

  /**
   * Approve provider application
   * Creates ServiceProvider record and updates User role
   */
  async approveProviderApplication(applicationId: string, notes?: string) {
    const application = await providerApplicationsRepository.findById(applicationId);

    if (!application) {
      throw new ApplicationNotFoundError();
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new Error('Application is not pending');
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.providerApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
          notes,
        },
      });

      // Create ServiceProvider record
      const provider = await tx.serviceProvider.create({
        data: {
          userId: application.userId,
          businessName: application.businessName,
          description: application.description,
          category: application.category,
          subscriptionPlan: SubscriptionPlan.BASIC,
          status: 'APPROVED',
        },
      });

      // Update User role
      await tx.user.update({
        where: { id: application.userId },
        data: { role: UserRole.PROVIDER },
      });

      return { application: updatedApplication, provider };
    });

    return {
      success: true,
      data: result,
      message: 'Provider application approved successfully',
    };
  }

  /**
   * Reject provider application
   */
  async rejectProviderApplication(applicationId: string, notes?: string) {
    const application = await providerApplicationsRepository.findById(applicationId);

    if (!application) {
      throw new ApplicationNotFoundError();
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new Error('Application is not pending');
    }

    const updatedApplication = await providerApplicationsRepository.update(
      applicationId,
      {
        status: ApplicationStatus.REJECTED,
        notes,
      }
    );

    return {
      success: true,
      data: updatedApplication,
      message: 'Provider application rejected',
    };
  }
}

// Export singleton instance
export const adminApplicationsService = new AdminApplicationsService();
