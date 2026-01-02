import { z } from 'zod';

// ===========================================
// Enums (match Prisma schema)
// ===========================================

export const ReviewableType = {
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE',
  VENDOR: 'VENDOR',
  PROVIDER: 'PROVIDER',
  DRIVER: 'DRIVER',
} as const;

export type ReviewableType = (typeof ReviewableType)[keyof typeof ReviewableType];

export const ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

// ===========================================
// Error Codes
// ===========================================

export const ReviewErrorCode = {
  REVIEW_NOT_FOUND: 'REVIEW_NOT_FOUND',
  DUPLICATE_REVIEW: 'DUPLICATE_REVIEW',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_REVIEWABLE_TYPE: 'INVALID_REVIEWABLE_TYPE',
  REVIEWABLE_NOT_FOUND: 'REVIEWABLE_NOT_FOUND',
  CANNOT_UPDATE_MODERATED: 'CANNOT_UPDATE_MODERATED',
  INVALID_RATING: 'INVALID_RATING',
  ALREADY_APPROVED: 'ALREADY_APPROVED',
  ALREADY_REJECTED: 'ALREADY_REJECTED',
} as const;

export type ReviewErrorCode = (typeof ReviewErrorCode)[keyof typeof ReviewErrorCode];

// ===========================================
// Validation Schemas
// ===========================================

export const createReviewSchema = z.object({
  reviewableType: z.enum(['PRODUCT', 'SERVICE', 'VENDOR', 'PROVIDER', 'DRIVER']),
  reviewableId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const reviewQuerySchema = z.object({
  reviewableType: z.enum(['PRODUCT', 'SERVICE', 'VENDOR', 'PROVIDER', 'DRIVER']).optional(),
  reviewableId: z.string().uuid().optional(),
  reviewerId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ReviewQuery = z.infer<typeof reviewQuerySchema>;

// ===========================================
// Response Types
// ===========================================

export interface ReviewDTO {
  id: string;
  reviewerId: string;
  reviewerName: string | null;
  reviewerAvatar: string | null;
  reviewableType: ReviewableType;
  reviewableId: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewListResponse {
  data: ReviewDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

// ===========================================
// Allowed Status Transitions
// ===========================================

export const REVIEW_STATUS_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['REJECTED'], // Admin can change decision
  REJECTED: ['APPROVED'], // Admin can change decision
};
