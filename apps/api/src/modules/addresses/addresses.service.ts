/**
 * Addresses Service
 * 
 * Business logic for address management with owner-only access.
 */

import { addressesRepository } from './addresses.repository.js';
import {
  AddressErrorCode,
  type CreateAddressInput,
  type UpdateAddressInput,
} from '../../types/address.types.js';
import { UserRole } from '../../types/user.types.js';
import prismaPkg from '@prisma/client';
import type * as PrismaTypes from '@prisma/client';

const prismaMod = prismaPkg as unknown as any;
const { Decimal } = prismaMod;
type Decimal = any;

// ===========================================
// Custom Errors
// ===========================================

export class AddressError extends Error {
  constructor(
    public code: AddressErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AddressError';
  }
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Convert Decimal to number for response
 */
function decimalToNumber(value: Decimal | null): number | null {
  return value ? Number(value) : null;
}

/**
 * Format address for response
 */
function formatAddress(address: any) {
  return {
    ...address,
    latitude: decimalToNumber(address.latitude),
    longitude: decimalToNumber(address.longitude),
  };
}

// ===========================================
// Service
// ===========================================

export const addressesService = {
  /**
   * List addresses for a user
   * Owner or admin can access
   */
  async listAddresses(
    requesterId: string,
    requesterRole: UserRole,
    targetUserId: string
  ) {
    // Check permission
    if (requesterRole !== UserRole.ADMIN && requesterId !== targetUserId) {
      throw new AddressError(
        AddressErrorCode.PERMISSION_DENIED,
        'You can only access your own addresses'
      );
    }

    const addresses = await addressesRepository.findByUserId(targetUserId);
    return addresses.map(formatAddress);
  },

  /**
   * Get address by ID
   * Owner or admin can access
   */
  async getAddressById(
    requesterId: string,
    requesterRole: UserRole,
    addressId: string
  ) {
    const address = await addressesRepository.findById(addressId);

    if (!address) {
      throw new AddressError(
        AddressErrorCode.ADDRESS_NOT_FOUND,
        'Address not found'
      );
    }

    // Check permission
    if (requesterRole !== UserRole.ADMIN && requesterId !== address.userId) {
      throw new AddressError(
        AddressErrorCode.PERMISSION_DENIED,
        'You can only access your own addresses'
      );
    }

    return formatAddress(address);
  },

  /**
   * Create address
   * Owner or admin can create
   */
  async createAddress(
    requesterId: string,
    requesterRole: UserRole,
    targetUserId: string,
    data: CreateAddressInput
  ) {
    // Check permission
    if (requesterRole !== UserRole.ADMIN && requesterId !== targetUserId) {
      throw new AddressError(
        AddressErrorCode.PERMISSION_DENIED,
        'You can only create addresses for yourself'
      );
    }

    // If this is the first address or isDefault is true, handle default logic
    const existingCount = await addressesRepository.countByUserId(targetUserId);
    const shouldBeDefault = data.isDefault || existingCount === 0;

    if (shouldBeDefault && existingCount > 0) {
      // Create with transaction to ensure single default
      const address = await addressesRepository.create(targetUserId, {
        ...data,
        isDefault: false, // Create without default first
      });
      
      // Then set as default (this will unset others)
      const updatedAddress = await addressesRepository.setDefault(targetUserId, address.id);
      return formatAddress(updatedAddress);
    }

    const address = await addressesRepository.create(targetUserId, {
      ...data,
      isDefault: shouldBeDefault,
    });

    return formatAddress(address);
  },

  /**
   * Update address
   * Owner or admin can update
   */
  async updateAddress(
    requesterId: string,
    requesterRole: UserRole,
    addressId: string,
    data: UpdateAddressInput
  ) {
    const address = await addressesRepository.findById(addressId);

    if (!address) {
      throw new AddressError(
        AddressErrorCode.ADDRESS_NOT_FOUND,
        'Address not found'
      );
    }

    // Check permission
    if (requesterRole !== UserRole.ADMIN && requesterId !== address.userId) {
      throw new AddressError(
        AddressErrorCode.PERMISSION_DENIED,
        'You can only update your own addresses'
      );
    }

    // Handle default logic
    if (data.isDefault === true && !address.isDefault) {
      // Setting as default - use transaction
      const updatedAddress = await addressesRepository.setDefault(address.userId, addressId);
      
      // Update other fields if any
      const { isDefault, latitude, longitude, ...otherData } = data;
      if (Object.keys(otherData).length > 0) {
        const finalAddress = await addressesRepository.update(addressId, {
          ...otherData,
          latitude: latitude !== undefined ? (latitude ? new Decimal(latitude) : null) : undefined,
          longitude: longitude !== undefined ? (longitude ? new Decimal(longitude) : null) : undefined,
        });
        return formatAddress(finalAddress);
      }
      
      return formatAddress(updatedAddress);
    }

    // Regular update
    const { latitude, longitude, ...otherData } = data;
    const updatedAddress = await addressesRepository.update(addressId, {
      ...otherData,
      latitude: latitude !== undefined ? (latitude ? new Decimal(latitude) : null) : undefined,
      longitude: longitude !== undefined ? (longitude ? new Decimal(longitude) : null) : undefined,
    });

    return formatAddress(updatedAddress);
  },

  /**
   * Delete address
   * Owner or admin can delete
   */
  async deleteAddress(
    requesterId: string,
    requesterRole: UserRole,
    addressId: string
  ) {
    const address = await addressesRepository.findById(addressId);

    if (!address) {
      throw new AddressError(
        AddressErrorCode.ADDRESS_NOT_FOUND,
        'Address not found'
      );
    }

    // Check permission
    if (requesterRole !== UserRole.ADMIN && requesterId !== address.userId) {
      throw new AddressError(
        AddressErrorCode.PERMISSION_DENIED,
        'You can only delete your own addresses'
      );
    }

    await addressesRepository.delete(addressId);

    // If deleted address was default, set another one as default
    if (address.isDefault) {
      const remainingAddresses = await addressesRepository.findByUserId(address.userId);
      if (remainingAddresses.length > 0) {
        await addressesRepository.setDefault(address.userId, remainingAddresses[0].id);
      }
    }

    return { success: true };
  },

  /**
   * Set address as default
   * Owner or admin can set default
   */
  async setDefaultAddress(
    requesterId: string,
    requesterRole: UserRole,
    addressId: string
  ) {
    const address = await addressesRepository.findById(addressId);

    if (!address) {
      throw new AddressError(
        AddressErrorCode.ADDRESS_NOT_FOUND,
        'Address not found'
      );
    }

    // Check permission
    if (requesterRole !== UserRole.ADMIN && requesterId !== address.userId) {
      throw new AddressError(
        AddressErrorCode.PERMISSION_DENIED,
        'You can only set default for your own addresses'
      );
    }

    // Already default
    if (address.isDefault) {
      return formatAddress(address);
    }

    const updatedAddress = await addressesRepository.setDefault(address.userId, addressId);
    return formatAddress(updatedAddress);
  },

  /**
   * Get default address for user
   */
  async getDefaultAddress(
    requesterId: string,
    requesterRole: UserRole,
    targetUserId: string
  ) {
    // Check permission
    if (requesterRole !== UserRole.ADMIN && requesterId !== targetUserId) {
      throw new AddressError(
        AddressErrorCode.PERMISSION_DENIED,
        'You can only access your own addresses'
      );
    }

    const address = await addressesRepository.getDefaultByUserId(targetUserId);
    return address ? formatAddress(address) : null;
  },
};
