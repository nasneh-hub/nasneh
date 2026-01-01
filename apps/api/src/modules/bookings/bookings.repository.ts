import { prisma } from '../../lib/db';
import { Prisma, BookingStatus as PrismaBookingStatus } from '@prisma/client';
import type { BookingQuery } from '../../types/booking.types';

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

  async findByBookingNumber(bookingNumber: string) {
    return prisma.booking.findUnique({
      where: { bookingNumber },
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

  async findByCustomerId(customerId: string, query: BookingQuery) {
    const { page, limit, providerId, serviceId, status, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      customerId,
      ...(providerId && { providerId }),
      ...(serviceId && { serviceId }),
      ...(status && { status: status as PrismaBookingStatus }),
      ...(fromDate && { scheduledDate: { gte: new Date(fromDate) } }),
      ...(toDate && { scheduledDate: { lte: new Date(toDate) } }),
    };

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
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
        orderBy: { scheduledDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  async findByProviderId(providerId: string, query: BookingQuery) {
    const { page, limit, serviceId, status, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      providerId,
      ...(serviceId && { serviceId }),
      ...(status && { status: status as PrismaBookingStatus }),
      ...(fromDate && { scheduledDate: { gte: new Date(fromDate) } }),
      ...(toDate && { scheduledDate: { lte: new Date(toDate) } }),
    };

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
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
        orderBy: { scheduledDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
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
    serviceAddress: Prisma.InputJsonValue | null;
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
        serviceAddress: data.serviceAddress ?? Prisma.JsonNull,
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

  async updateStatus(id: string, status: PrismaBookingStatus) {
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
        status: 'CANCELLED',
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
    const where: Prisma.BookingWhereInput = {
      providerId,
      serviceId,
      scheduledDate,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
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
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
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
