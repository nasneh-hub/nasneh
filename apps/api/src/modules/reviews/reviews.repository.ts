import { PrismaClient, ReviewableType, ReviewStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateReviewData {
  reviewerId: string;
  reviewableType: ReviewableType;
  reviewableId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface ReviewFilters {
  reviewableType?: ReviewableType;
  reviewableId?: string;
  reviewerId?: string;
  status?: ReviewStatus;
}

export interface ReviewWithReviewer {
  id: string;
  reviewerId: string;
  reviewableType: ReviewableType;
  reviewableId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  reviewer: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export const reviewsRepository = {
  /**
   * Create a new review
   */
  async create(data: CreateReviewData): Promise<ReviewWithReviewer> {
    return prisma.review.create({
      data: {
        reviewerId: data.reviewerId,
        reviewableType: data.reviewableType,
        reviewableId: data.reviewableId,
        rating: data.rating,
        comment: data.comment,
        status: 'PENDING',
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  },

  /**
   * Find review by ID
   */
  async findById(id: string): Promise<ReviewWithReviewer | null> {
    return prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  },

  /**
   * Find existing review by user and reviewable
   */
  async findByUserAndReviewable(
    reviewerId: string,
    reviewableType: ReviewableType,
    reviewableId: string
  ): Promise<ReviewWithReviewer | null> {
    return prisma.review.findUnique({
      where: {
        reviewerId_reviewableType_reviewableId: {
          reviewerId,
          reviewableType,
          reviewableId,
        },
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  },

  /**
   * Find reviews with filters and pagination
   */
  async findMany(
    filters: ReviewFilters,
    page: number,
    limit: number,
    sortBy: 'createdAt' | 'rating',
    sortOrder: 'asc' | 'desc'
  ): Promise<{ reviews: ReviewWithReviewer[]; total: number }> {
    const where: Prisma.ReviewWhereInput = {};

    if (filters.reviewableType) {
      where.reviewableType = filters.reviewableType;
    }
    if (filters.reviewableId) {
      where.reviewableId = filters.reviewableId;
    }
    if (filters.reviewerId) {
      where.reviewerId = filters.reviewerId;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total };
  },

  /**
   * Update review
   */
  async update(id: string, data: UpdateReviewData): Promise<ReviewWithReviewer> {
    return prisma.review.update({
      where: { id },
      data,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  },

  /**
   * Update review status
   */
  async updateStatus(id: string, status: ReviewStatus): Promise<ReviewWithReviewer> {
    return prisma.review.update({
      where: { id },
      data: { status },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  },

  /**
   * Delete review
   */
  async delete(id: string): Promise<void> {
    await prisma.review.delete({
      where: { id },
    });
  },

  /**
   * Get review statistics for a reviewable
   */
  async getStats(
    reviewableType: ReviewableType,
    reviewableId: string
  ): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    const [aggregation, distribution] = await Promise.all([
      prisma.review.aggregate({
        where: {
          reviewableType,
          reviewableId,
          status: 'APPROVED',
        },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: {
          reviewableType,
          reviewableId,
          status: 'APPROVED',
        },
        _count: true,
      }),
    ]);

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      ratingDistribution[d.rating] = d._count;
    });

    return {
      averageRating: aggregation._avg.rating ?? 0,
      totalReviews: aggregation._count,
      ratingDistribution,
    };
  },
};
