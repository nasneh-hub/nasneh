import { Router, RequestHandler } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';
import { reviewsController } from './reviews.controller.js';

// ===========================================
// Public Reviews Routes
// ===========================================

export const reviewsRoutes: Router = Router();

// List reviews (public - shows only APPROVED for non-auth/non-admin)
reviewsRoutes.get('/', reviewsController.listReviews as RequestHandler);

// Get review by ID
reviewsRoutes.get('/:id', reviewsController.getReview as RequestHandler);

// Create review (requires auth)
reviewsRoutes.post('/', authMiddleware, reviewsController.createReview as RequestHandler);

// Update own review
reviewsRoutes.patch('/:id', authMiddleware, reviewsController.updateReview as RequestHandler);

// Delete own review
reviewsRoutes.delete('/:id', authMiddleware, reviewsController.deleteReview as RequestHandler);

// ===========================================
// Admin Moderation Routes
// ===========================================

export const adminReviewsRoutes: Router = Router();

// Approve review
adminReviewsRoutes.post('/:id/approve', authMiddleware, requireRoles(UserRole.ADMIN), reviewsController.approveReview as RequestHandler);

// Reject review
adminReviewsRoutes.post('/:id/reject', authMiddleware, requireRoles(UserRole.ADMIN), reviewsController.rejectReview as RequestHandler);

// ===========================================
// User Reviews Routes (for /users/me/reviews)
// ===========================================

export const userReviewsRoutes: Router = Router();

// Get current user's reviews
userReviewsRoutes.get('/', authMiddleware, reviewsController.getMyReviews as RequestHandler);
