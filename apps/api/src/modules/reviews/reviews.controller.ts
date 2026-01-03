import type { Request, Response } from 'express';
import { reviewsService, ReviewError } from './reviews.service.js';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
} from '../../types/review.types.js';
import { ZodError } from 'zod';

// ===========================================
// Type Extensions
// ===========================================

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ===========================================
// Helper Functions
// ===========================================

function handleError(error: unknown, res: Response): void {
  if (error instanceof ReviewError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.errors,
    });
    return;
  }

  console.error('Unexpected error:', error);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}

// ===========================================
// Controller Functions
// ===========================================

export const reviewsController = {
  /**
   * POST /reviews - Create a new review
   */
  async createReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      const data = createReviewSchema.parse(req.body);
      const review = await reviewsService.createReview(userId, data);

      res.status(201).json(review);
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * GET /reviews - List reviews with filters
   */
  async listReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'CUSTOMER';

      const query = reviewQuerySchema.parse(req.query);
      const result = await reviewsService.listReviews(query, userRole, userId);

      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * GET /reviews/:id - Get review by ID
   */
  async getReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const review = await reviewsService.getReview(id);

      // Non-admin can only see APPROVED reviews (unless it's their own)
      const userId = req.user?.id;
      const userRole = req.user?.role || 'CUSTOMER';

      if (
        userRole !== 'ADMIN' &&
        review.status !== 'APPROVED' &&
        review.reviewerId !== userId
      ) {
        res.status(404).json({ error: 'Review not found', code: 'REVIEW_NOT_FOUND' });
        return;
      }

      res.json(review);
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * PATCH /reviews/:id - Update own review
   */
  async updateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'CUSTOMER';

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      const { id } = req.params;
      const data = updateReviewSchema.parse(req.body);

      const review = await reviewsService.updateReview(id, userId, userRole, data);
      res.json(review);
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * DELETE /reviews/:id - Delete own review
   */
  async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'CUSTOMER';

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      const { id } = req.params;
      await reviewsService.deleteReview(id, userId, userRole);

      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * POST /reviews/:id/approve - Approve review (admin only)
   */
  async approveReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;

      if (userRole !== 'ADMIN') {
        res.status(403).json({
          error: 'Only admins can approve reviews',
          code: 'PERMISSION_DENIED',
        });
        return;
      }

      const { id } = req.params;
      const review = await reviewsService.approveReview(id);

      res.json(review);
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * POST /reviews/:id/reject - Reject review (admin only)
   */
  async rejectReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;

      if (userRole !== 'ADMIN') {
        res.status(403).json({
          error: 'Only admins can reject reviews',
          code: 'PERMISSION_DENIED',
        });
        return;
      }

      const { id } = req.params;
      const review = await reviewsService.rejectReview(id);

      res.json(review);
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * GET /users/me/reviews - Get current user's reviews
   */
  async getMyReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const result = await reviewsService.getUserReviews(userId, page, limit);
      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  },
};
