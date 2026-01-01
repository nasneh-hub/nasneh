/**
 * Payments Routes - Nasneh API
 * Route definitions for payment endpoints
 */

import { Router } from 'express';
import {
  initiatePayment,
  getPaymentById,
  getCustomerPayments,
} from './payments.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router: Router = Router();

// ===========================================
// Customer Payment Routes (authenticated)
// ===========================================

// POST /payments/initiate - Initiate payment for an order
router.post('/initiate', requireAuth, initiatePayment);

// GET /payments - Get customer's payments
router.get('/', requireAuth, getCustomerPayments);

// GET /payments/:id - Get payment by ID
router.get('/:id', requireAuth, getPaymentById);

export { router as paymentsRoutes };
