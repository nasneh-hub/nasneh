/**
 * Addresses Repository
 * 
 * Database operations for user addresses.
 */

import { prisma } from '../../lib/db.js';
import type { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// ===========================================
// Repository
// ===========================================

export const addressesRepository = {
  /**
   * Find address by ID
   */
  async findById(addressId: string) {
    return prisma.address.findUnique({
      where: { id: addressId },
    });
  },

  /**
   * Find all addresses for a user
   */
  async findByUserId(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' }, // Default address first
        { createdAt: 'desc' },
      ],
    });
  },

  /**
   * Create address
   */
  async create(userId: string, data: {
    label: string;
    addressLine: string;
    area: string;
    block?: string | null;
    road?: string | null;
    building?: string | null;
    floor?: string | null;
    apartment?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    isDefault?: boolean;
  }) {
    return prisma.address.create({
      data: {
        userId,
        label: data.label,
        addressLine: data.addressLine,
        area: data.area,
        block: data.block,
        road: data.road,
        building: data.building,
        floor: data.floor,
        apartment: data.apartment,
        latitude: data.latitude ? new Decimal(data.latitude) : null,
        longitude: data.longitude ? new Decimal(data.longitude) : null,
        isDefault: data.isDefault ?? false,
      },
    });
  },

  /**
   * Update address
   */
  async update(addressId: string, data: Prisma.AddressUpdateInput) {
    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  },

  /**
   * Delete address
   */
  async delete(addressId: string) {
    return prisma.address.delete({
      where: { id: addressId },
    });
  },

  /**
   * Set address as default (within transaction)
   * Unsets other defaults for the user
   */
  async setDefault(userId: string, addressId: string) {
    return prisma.$transaction(async (tx) => {
      // First, unset all defaults for this user
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // Then, set the specified address as default
      return tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  },

  /**
   * Count addresses for a user
   */
  async countByUserId(userId: string) {
    return prisma.address.count({
      where: { userId },
    });
  },

  /**
   * Check if address exists
   */
  async exists(addressId: string) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
      select: { id: true },
    });
    return !!address;
  },

  /**
   * Get default address for user
   */
  async getDefaultByUserId(userId: string) {
    return prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  },
};
