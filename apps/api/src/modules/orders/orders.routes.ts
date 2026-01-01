/**
 * Orders Routes - Nasneh API
 * Route definitions for order endpoints
 */

import { Router, type IRouter } from 'express';
import {
  getVendorOrders,
  getVendorOrderById,
  updateOrderStatus,
  getOrderHistory,
  createOrder,
  getCustomerOrders,
  getCustomerOrderById,
  cancelOrder,
} from './orders.controller';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware';
import { UserRole } from '../../types/auth.types';

// ===========================================
// Vendor Routes
// ===========================================

export const vendorOrderRoutes: IRouter = Router();

// All vendor routes require authentication and vendor role
vendorOrderRoutes.use(authMiddleware);
vendorOrderRoutes.use(requireRoles(UserRole.VENDOR));

// GET /vendor/orders - List vendor's orders
vendorOrderRoutes.get('/', getVendorOrders);

// GET /vendor/orders/:id - Get order details
vendorOrderRoutes.get('/:id', getVendorOrderById);

// PATCH /vendor/orders/:id/status - Update order status
vendorOrderRoutes.patch('/:id/status', updateOrderStatus);

// GET /vendor/orders/:id/history - Get order history (audit logs)
vendorOrderRoutes.get('/:id/history', getOrderHistory);

// ===========================================
// Customer Routes
// ===========================================

export const customerOrderRoutes: IRouter = Router();

// All customer routes require authentication
customerOrderRoutes.use(authMiddleware);

// POST /orders - Create new order
customerOrderRoutes.post('/', createOrder);

// GET /orders - List customer's orders
customerOrderRoutes.get('/', getCustomerOrders);

// GET /orders/:id - Get order details
customerOrderRoutes.get('/:id', getCustomerOrderById);

// PATCH /orders/:id/cancel - Cancel order
customerOrderRoutes.patch('/:id/cancel', cancelOrder);
