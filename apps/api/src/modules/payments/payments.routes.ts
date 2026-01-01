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
import {
  handleApsWebhook,
  handleApsReturn,
} from './webhook.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import {
  captureRawBody,
  jsonWithRawBody,
} from '../../middleware/rawBody.middleware';

const router: Router = Router();

// ===========================================
// Webhook Routes (no auth - called by APS)
// ===========================================

// POST /payments/webhook - APS webhook callback
// Uses raw body capture for signature verification
router.post('/webhook', captureRawBody, jsonWithRawBody, handleApsWebhook);

// GET /payments/return - APS return URL (customer redirect)
router.get('/return', handleApsReturn);

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
