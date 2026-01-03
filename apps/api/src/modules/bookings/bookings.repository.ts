import { prisma } from '../../lib/db.js';
import type * as PrismaTypes from '@prisma/client';
import prismaPkg from '@prisma/client';

const prismaMod = prismaPkg as any;
const { BookingStatus, Prisma } = prismaMod;

type PrismaBookingStatusType = PrismaTypes.BookingStatus;
import type { BookingQuery } from '../../types/booking.types.js';

// ===========================================
// Bookings Repository
// ===========================================

export const bookingRepository = {
  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            serviceType: true,
            durationMinutes: true,
          },
        },
      },
    });
  },

  async findMany(query: BookingQuery) {
    const {
      customerId,
      providerId,
      serviceId,
      status,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      ...(customerId && { customerId }),
      ...(providerId && { providerId }),
      ...(serviceId && { serviceId }),
      ...(status && { status: status as PrismaBookingStatusType }),
      ...(fromDate && toDate && {
        scheduledDate: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      }),
    };

    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          provider: {
            select: {
              id: true,
              businessName: true,
              logoUrl: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              serviceType: true,
              durationMinutes: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  },

  async create(data: {
    bookingNumber: string;
    customerId: string;
    providerId: string;
    serviceId: string;
    scheduledDate: Date;
    scheduledTime: Date | null;
    endTime: Date | null;
    price: number;
    commission: number;
    total: number;
    serviceAddress: any;
    notes: string | null;
  }) {
    return prisma.booking.create({
      data: {
        bookingNumber: data.bookingNumber,
        customerId: data.customerId,
        providerId: data.providerId,
        serviceId: data.serviceId,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        endTime: data.endTime,
        price: data.price,
        commission: data.commission,
        total: data.total,
        serviceAddress: data.serviceAddress ?? (Prisma.JsonNull as any),
        notes: data.notes,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            serviceType: true,
            durationMinutes: true,
          },
        },
      },
    });
  },

  async updateStatus(id: string, status: PrismaBookingStatusType) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            serviceType: true,
            durationMinutes: true,
          },
        },
      },
    });
  },

  async cancel(id: string, cancelledBy: string, reason: string) {
    return prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED' as PrismaBookingStatusType,
        cancellationReason: reason,
        cancelledBy,
        cancelledAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            serviceType: true,
            durationMinutes: true,
          },
        },
      },
    });
  },

  // Check for conflicting bookings (for double-booking prevention)
  async findConflictingBookings(
    providerId: string,
    serviceId: string,
    scheduledDate: Date,
    scheduledTime: Date | null,
    endTime: Date | null,
    excludeBookingId?: string
  ) {
    const where: any = {
      providerId,
      serviceId,
      scheduledDate,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] as PrismaBookingStatusType[] },
      ...(excludeBookingId && { id: { not: excludeBookingId } }),
    };

    // For appointment type services, check time overlap
    if (scheduledTime && endTime) {
      where.OR = [
        // New booking starts during existing booking
        {
          scheduledTime: { lte: scheduledTime },
          endTime: { gt: scheduledTime },
        },
        // New booking ends during existing booking
        {
          scheduledTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        // New booking contains existing booking
        {
          scheduledTime: { gte: scheduledTime },
          endTime: { lte: endTime },
        },
      ];
    }

    return prisma.booking.findMany({
      where,
      select: {
        id: true,
        bookingNumber: true,
        scheduledTime: true,
        endTime: true,
      },
    });
  },

  // Find active bookings for a provider on a specific date (for availability engine)
  async findActiveBookingsForProvider(
    providerId: string,
    dateStr: string
  ) {
    const date = new Date(dateStr);
    return prisma.booking.findMany({
      where: {
        providerId,
        scheduledDate: date,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] as PrismaBookingStatusType[] },
      },
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        endTime: true,
      },
    });
  },

  // Generate unique booking number
  async generateBookingNumber(): Promise<string> {
    const prefix = 'BK';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    
    // Get count of bookings today for sequence
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const count = await prisma.booking.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });
    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}${date}${sequence}`;
  },
};
