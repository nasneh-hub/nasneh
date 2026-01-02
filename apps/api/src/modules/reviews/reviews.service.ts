import { PrismaClient, ReviewableType, ReviewStatus } from '@prisma/client';
import {
  reviewsRepository,
  ReviewWithReviewer,
  ReviewFilters,
} from './reviews.repository';
import {
  ReviewErrorCode,
  ReviewDTO,
  ReviewListResponse,
  REVIEW_STATUS_TRANSITIONS,
} from '../../types/review.types';

const prisma = new PrismaClient();

// ===========================================
// Error Classes
// ===========================================

export class ReviewError extends Error {
  constructor(
    public code: ReviewErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ReviewError';
  }
}

// ===========================================
// Helper Functions
// ===========================================

function toReviewDTO(review: ReviewWithReviewer): ReviewDTO {
  return {
    id: review.id,
    reviewerId: review.reviewerId,
    reviewerName: review.reviewer.name,
    reviewerAvatar: review.reviewer.avatarUrl,
    reviewableType: review.reviewableType as ReviewableType,
    reviewableId: review.reviewableId,
    rating: review.rating,
    comment: review.comment,
    status: review.status as ReviewStatus,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

/**
 * Validate that the reviewable entity exists
 */
async function validateReviewableExists(
  reviewableType: ReviewableType,
  reviewableId: string
): Promise<boolean> {
  let exists = false;

  switch (reviewableType) {
    case 'PRODUCT':
      exists = !!(await prisma.product.findUnique({ where: { id: reviewableId } }));
      break;
    case 'SERVICE':
      exists = !!(await prisma.service.findUnique({ where: { id: reviewableId } }));
      break;
    case 'VENDOR':
      exists = !!(await prisma.vendor.findUnique({ where: { id: reviewableId } }));
      break;
    case 'PROVIDER':
      exists = !!(await prisma.serviceProvider.findUnique({ where: { id: reviewableId } }));
      break;
    case 'DRIVER':
      // Driver is a user with driver role - check if user exists
      // For MVP, we'll just check if user exists
      exists = !!(await prisma.user.findUnique({ where: { id: reviewableId } }));
      break;
    default:
      return false;
  }

  return exists;
}

// ===========================================
// Service Functions
// ===========================================

export const reviewsService = {
  /**
   * Create a new review
   */
  async createReview(
    userId: string,
    data: {
      reviewableType: ReviewableType;
      reviewableId: string;
      rating: number;
      comment?: string;
    }
  ): Promise<ReviewDTO> {
    // Check if reviewable exists
    const reviewableExists = await validateReviewableExists(
      data.reviewableType,
      data.reviewableId
    );
    if (!reviewableExists) {
      throw new ReviewError(
        'REVIEWABLE_NOT_FOUND',
        `${data.reviewableType} with ID ${data.reviewableId} not found`,
        404
      );
    }

    // Check for duplicate review
    const existingReview = await reviewsRepository.findByUserAndReviewable(
      userId,
      data.reviewableType,
      data.reviewableId
    );
    if (existingReview) {
      throw new ReviewError(
        'DUPLICATE_REVIEW',
        'You have already reviewed this item',
        409
      );
    }

    // Create review
    const review = await reviewsRepository.create({
      reviewerId: userId,
      reviewableType: data.reviewableType,
      reviewableId: data.reviewableId,
      rating: data.rating,
      comment: data.comment,
    });

    return toReviewDTO(review);
  },

  /**
   * Get review by ID
   */
  async getReview(reviewId: string): Promise<ReviewDTO> {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) {
      throw new ReviewError('REVIEW_NOT_FOUND', 'Review not found', 404);
    }
    return toReviewDTO(review);
  },

  /**
   * List reviews with filters
   */
  async listReviews(
    query: {
      reviewableType?: ReviewableType;
      reviewableId?: string;
      reviewerId?: string;
      status?: ReviewStatus;
      page: number;
      limit: number;
      sortBy: 'createdAt' | 'rating';
      sortOrder: 'asc' | 'desc';
    },
    userRole: string,
    userId?: string
  ): Promise<ReviewListResponse> {
    const filters: ReviewFilters = {};

    // Apply filters
    if (query.reviewableType) {
      filters.reviewableType = query.reviewableType;
    }
    if (query.reviewableId) {
      filters.reviewableId = query.reviewableId;
    }
    if (query.reviewerId) {
      filters.reviewerId = query.reviewerId;
    }

    // Non-admin users can only see APPROVED reviews (unless viewing their own)
    if (userRole !== 'ADMIN') {
      if (query.reviewerId && query.reviewerId === userId) {
        // User viewing their own reviews - can see all statuses
        if (query.status) {
          filters.status = query.status;
        }
      } else {
        // Non-admin viewing others' reviews - only APPROVED
        filters.status = 'APPROVED';
      }
    } else {
      // Admin can filter by any status
      if (query.status) {
        filters.status = query.status;
      }
    }

    const { reviews, total } = await reviewsRepository.findMany(
      filters,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder
    );

    const totalPages = Math.ceil(total / query.limit);

    const response: ReviewListResponse = {
      data: reviews.map(toReviewDTO),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    };

    // Include stats if filtering by specific reviewable
    if (query.reviewableType && query.reviewableId) {
      response.stats = await reviewsRepository.getStats(
        query.reviewableType,
        query.reviewableId
      );
    }

    return response;
  },

  /**
   * Update own review (only while PENDING)
   */
  async updateReview(
    reviewId: string,
    userId: string,
    userRole: string,
    data: { rating?: number; comment?: string }
  ): Promise<ReviewDTO> {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) {
      throw new ReviewError('REVIEW_NOT_FOUND', 'Review not found', 404);
    }

    // Check ownership (admin can update any)
    if (userRole !== 'ADMIN' && review.reviewerId !== userId) {
      throw new ReviewError(
        'PERMISSION_DENIED',
        'You can only update your own reviews',
        403
      );
    }

    // Non-admin can only update PENDING reviews
    if (userRole !== 'ADMIN' && review.status !== 'PENDING') {
      throw new ReviewError(
        'CANNOT_UPDATE_MODERATED',
        'Cannot update a review that has been moderated',
        422
      );
    }

    const updated = await reviewsRepository.update(reviewId, data);
    return toReviewDTO(updated);
  },

  /**
   * Delete own review
   */
  async deleteReview(
    reviewId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) {
      throw new ReviewError('REVIEW_NOT_FOUND', 'Review not found', 404);
    }

    // Check ownership (admin can delete any)
    if (userRole !== 'ADMIN' && review.reviewerId !== userId) {
      throw new ReviewError(
        'PERMISSION_DENIED',
        'You can only delete your own reviews',
        403
      );
    }

    await reviewsRepository.delete(reviewId);
  },

  /**
   * Approve review (admin only)
   */
  async approveReview(reviewId: string): Promise<ReviewDTO> {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) {
      throw new ReviewError('REVIEW_NOT_FOUND', 'Review not found', 404);
    }

    // Check valid transition
    const allowedTransitions = REVIEW_STATUS_TRANSITIONS[review.status as ReviewStatus];
    if (!allowedTransitions.includes('APPROVED')) {
      throw new ReviewError(
        'ALREADY_APPROVED',
        'Review is already approved',
        422
      );
    }

    const updated = await reviewsRepository.updateStatus(reviewId, 'APPROVED');
    return toReviewDTO(updated);
  },

  /**
   * Reject review (admin only)
   */
  async rejectReview(reviewId: string): Promise<ReviewDTO> {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) {
      throw new ReviewError('REVIEW_NOT_FOUND', 'Review not found', 404);
    }

    // Check valid transition
    const allowedTransitions = REVIEW_STATUS_TRANSITIONS[review.status as ReviewStatus];
    if (!allowedTransitions.includes('REJECTED')) {
      throw new ReviewError(
        'ALREADY_REJECTED',
        'Review is already rejected',
        422
      );
    }

    const updated = await reviewsRepository.updateStatus(reviewId, 'REJECTED');
    return toReviewDTO(updated);
  },

  /**
   * Get user's reviews
   */
  async getUserReviews(
    userId: string,
    page: number,
    limit: number
  ): Promise<ReviewListResponse> {
    const { reviews, total } = await reviewsRepository.findMany(
      { reviewerId: userId },
      page,
      limit,
      'createdAt',
      'desc'
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: reviews.map(toReviewDTO),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};
