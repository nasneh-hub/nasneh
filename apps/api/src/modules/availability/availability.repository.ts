import { prisma } from '../../lib/db';
import type { DayOfWeek, OverrideType } from '@prisma/client';

// ===========================================
// Availability Rules Repository
// ===========================================

export const availabilityRulesRepository = {
  // Create a new weekly rule
  async create(data: {
    providerId: string;
    dayOfWeek: DayOfWeek;
    startTime: Date;
    endTime: Date;
    isActive?: boolean;
  }) {
    return prisma.availabilityRule.create({
      data: {
        providerId: data.providerId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive ?? true,
      },
    });
  },

  // Create multiple rules at once (batch)
  async createMany(data: Array<{
    providerId: string;
    dayOfWeek: DayOfWeek;
    startTime: Date;
    endTime: Date;
    isActive?: boolean;
  }>) {
    return prisma.availabilityRule.createMany({
      data: data.map((rule) => ({
        providerId: rule.providerId,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        isActive: rule.isActive ?? true,
      })),
      skipDuplicates: true,
    });
  },

  // Get all rules for a provider
  async findByProvider(providerId: string, activeOnly = true) {
    return prisma.availabilityRule.findMany({
      where: {
        providerId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  },

  // Get rules for a specific day
  async findByProviderAndDay(providerId: string, dayOfWeek: DayOfWeek, activeOnly = true) {
    return prisma.availabilityRule.findMany({
      where: {
        providerId,
        dayOfWeek,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { startTime: 'asc' },
    });
  },

  // Get a specific rule by ID
  async findById(id: string) {
    return prisma.availabilityRule.findUnique({
      where: { id },
    });
  },

  // Update a rule
  async update(id: string, data: {
    startTime?: Date;
    endTime?: Date;
    isActive?: boolean;
  }) {
    return prisma.availabilityRule.update({
      where: { id },
      data,
    });
  },

  // Delete a rule
  async delete(id: string) {
    return prisma.availabilityRule.delete({
      where: { id },
    });
  },

  // Delete all rules for a provider on a specific day
  async deleteByProviderAndDay(providerId: string, dayOfWeek: DayOfWeek) {
    return prisma.availabilityRule.deleteMany({
      where: { providerId, dayOfWeek },
    });
  },

  // Check for overlapping rules
  async findOverlapping(
    providerId: string,
    dayOfWeek: DayOfWeek,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) {
    return prisma.availabilityRule.findMany({
      where: {
        providerId,
        dayOfWeek,
        isActive: true,
        ...(excludeId && { id: { not: excludeId } }),
        OR: [
          // New rule starts during existing rule
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          // New rule ends during existing rule
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          // New rule contains existing rule
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });
  },
};

// ===========================================
// Availability Overrides Repository
// ===========================================

export const availabilityOverridesRepository = {
  // Create a new override
  async create(data: {
    providerId: string;
    date: Date;
    type: OverrideType;
    startTime?: Date | null;
    endTime?: Date | null;
    reason?: string | null;
  }) {
    return prisma.availabilityOverride.create({
      data: {
        providerId: data.providerId,
        date: data.date,
        type: data.type,
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
        reason: data.reason ?? null,
      },
    });
  },

  // Get all overrides for a provider within a date range
  async findByProviderAndDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.availabilityOverride.findMany({
      where: {
        providerId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
  },

  // Get overrides for a specific date
  async findByProviderAndDate(providerId: string, date: Date) {
    return prisma.availabilityOverride.findMany({
      where: {
        providerId,
        date,
      },
      orderBy: { startTime: 'asc' },
    });
  },

  // Get a specific override by ID
  async findById(id: string) {
    return prisma.availabilityOverride.findUnique({
      where: { id },
    });
  },

  // Update an override
  async update(id: string, data: {
    type?: OverrideType;
    startTime?: Date | null;
    endTime?: Date | null;
    reason?: string | null;
  }) {
    return prisma.availabilityOverride.update({
      where: { id },
      data,
    });
  },

  // Delete an override
  async delete(id: string) {
    return prisma.availabilityOverride.delete({
      where: { id },
    });
  },

  // Delete all overrides for a provider on a specific date
  async deleteByProviderAndDate(providerId: string, date: Date) {
    return prisma.availabilityOverride.deleteMany({
      where: { providerId, date },
    });
  },
};

// ===========================================
// Availability Settings Repository
// ===========================================

export const availabilitySettingsRepository = {
  // Get or create settings for a provider
  async getOrCreate(providerId: string) {
    const existing = await prisma.availabilitySettings.findUnique({
      where: { providerId },
    });

    if (existing) return existing;

    return prisma.availabilitySettings.create({
      data: {
        providerId,
        timezone: 'Asia/Bahrain',
        slotDurationMinutes: 30,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
        minAdvanceHours: 24,
        maxAdvanceDays: 30,
      },
    });
  },

  // Get settings for a provider
  async findByProvider(providerId: string) {
    return prisma.availabilitySettings.findUnique({
      where: { providerId },
    });
  },

  // Update settings
  async update(providerId: string, data: {
    timezone?: string;
    slotDurationMinutes?: number;
    bufferBeforeMinutes?: number;
    bufferAfterMinutes?: number;
    minAdvanceHours?: number;
    maxAdvanceDays?: number;
  }) {
    return prisma.availabilitySettings.upsert({
      where: { providerId },
      update: data,
      create: {
        providerId,
        timezone: data.timezone ?? 'Asia/Bahrain',
        slotDurationMinutes: data.slotDurationMinutes ?? 30,
        bufferBeforeMinutes: data.bufferBeforeMinutes ?? 0,
        bufferAfterMinutes: data.bufferAfterMinutes ?? 0,
        minAdvanceHours: data.minAdvanceHours ?? 24,
        maxAdvanceDays: data.maxAdvanceDays ?? 30,
      },
    });
  },
};
