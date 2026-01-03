import { reviewsRepository } from './reviews.repository.js';
import type * as PrismaTypes from '@prisma/client';
import prismaPkg from '@prisma/client';

const prismaMod = prismaPkg as any;
const { ReviewableType, ReviewStatus } = prismaMod;

type ReviewableTypeType = PrismaTypes.ReviewableType;
type ReviewStatusType = PrismaTypes.ReviewStatus;
import type { 
  ReviewWithReviewer, 
  ReviewFilters 
} from './reviews.repository.js';

export class ReviewError extends Error {
  constructor(public message: string, public statusCode: number, public code: string) {
    super(message);
    this.name = 'ReviewError';
  }
}

export const reviewsService = {
  /**
   * Create a new review
   */
  async createReview(reviewerId: string, data: any): Promise<ReviewWithReviewer> {
    // Check if user already reviewed this
    const existing = await reviewsRepository.findByUserAndReviewable(
      reviewerId,
      data.reviewableType,
      data.reviewableId
    );

    if (existing) {
      throw new ReviewError('You have already reviewed this', 400, 'ALREADY_REVIEWED');
    }

    return reviewsRepository.create({
      reviewerId,
      ...data
    });
  },

  /**
   * List reviews with filters
   */
  async listReviews(filters: ReviewFilters, userRole: string, userId?: string): Promise<{ reviews: ReviewWithReviewer[]; total: number }> {
    // Non-admins can only see APPROVED reviews by default
    const finalFilters = { ...filters };
    if (userRole !== 'ADMIN' && !finalFilters.status) {
      finalFilters.status = 'APPROVED' as ReviewStatusType;
    }

    return reviewsRepository.findMany(
      finalFilters,
      (filters as any).page || 1,
      (filters as any).limit || 10,
      (filters as any).sortBy || 'createdAt',
      (filters as any).sortOrder || 'desc'
    );
  },

  /**
   * Get review by ID
   */
  async getReview(id: string): Promise<ReviewWithReviewer> {
    const review = await reviewsRepository.findById(id);
    if (!review) {
      throw new ReviewError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }
    return review;
  },

  /**
   * Update review
   */
  async updateReview(id: string, userId: string, userRole: string, data: any): Promise<ReviewWithReviewer> {
    const review = await reviewsRepository.findById(id);
    if (!review) {
      throw new ReviewError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    if (userRole !== 'ADMIN' && review.reviewerId !== userId) {
      throw new ReviewError('Unauthorized', 403, 'UNAUTHORIZED');
    }

    return reviewsRepository.update(id, data);
  },

  /**
   * Get reviews for a reviewable (service or provider)
   */
  async getReviews(
    type: ReviewableTypeType,
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: ReviewWithReviewer[]; total: number; stats: any }> {
    const [result, stats] = await Promise.all([
      reviewsRepository.findMany(
        { reviewableType: type, reviewableId: id, status: 'APPROVED' as ReviewStatusType },
        page,
        limit,
        'createdAt',
        'desc'
      ),
      reviewsRepository.getStats(type, id),
    ]);

    return {
      ...result,
      stats,
    };
  },

  /**
   * Moderate a review (approve/reject)
   */
  async moderateReview(
    reviewId: string,
    status: ReviewStatusType
  ): Promise<ReviewWithReviewer> {
    return reviewsRepository.updateStatus(reviewId, status);
  },

  /**
   * Approve review
   */
  async approveReview(id: string): Promise<ReviewWithReviewer> {
    return reviewsRepository.updateStatus(id, 'APPROVED' as ReviewStatusType);
  },

  /**
   * Reject review
   */
  async rejectReview(id: string): Promise<ReviewWithReviewer> {
    return reviewsRepository.updateStatus(id, 'REJECTED' as ReviewStatusType);
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, userId: string, userRole: string): Promise<void> {
    const review = await reviewsRepository.findById(reviewId);
    
    if (!review) {
      throw new ReviewError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    // Only reviewer or admin can delete
    if (userRole !== 'ADMIN' && review.reviewerId !== userId) {
      throw new ReviewError('Unauthorized', 403, 'UNAUTHORIZED');
    }

    await reviewsRepository.delete(reviewId);
  },

  /**
   * Get reviews by user
   */
  async getUserReviews(userId: string, page: number, limit: number): Promise<{ reviews: ReviewWithReviewer[]; total: number }> {
    return reviewsRepository.findMany(
      { reviewerId: userId },
      page,
      limit,
      'createdAt',
      'desc'
    );
  },
};
