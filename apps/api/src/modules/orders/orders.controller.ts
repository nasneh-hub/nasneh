/**
 * Orders Controller - Nasneh API
 * Handles HTTP requests for order endpoints
 */

import { Response, NextFunction } from 'express';
import {
  ordersService,
  OrderNotFoundError,
  InvalidStatusTransitionError,
  UnauthorizedOrderAccessError,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  VendorNotFoundError,
  ProductNotFoundError,
  ProductNotAvailableError,
  ProductVendorMismatchError,
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
} from './orders.service';
import {
  updateOrderStatusSchema,
  orderQuerySchema,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  createOrderSchema,
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
} from '../../types/order.types';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/db';
import { ActorRole } from '../../lib/audit';

// ===========================================
// Vendor Endpoints
// ===========================================

/**
 * Get Vendor Orders
 * GET /vendor/orders
 */
export async function getVendorOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate query params
    const validation = orderQuerySchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    // Get vendor ID from authenticated user
    const vendorId = await getVendorIdFromUser(req.user!.userId);
    if (!vendorId) {
      res.status(403).json({
        success: false,
        error: 'User is not a vendor',
      });
      return;
    }

    const result = await ordersService.getVendorOrders(vendorId, validation.data);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Vendor Order by ID
 * GET /vendor/orders/:id
 */
export async function getVendorOrderById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Get vendor ID from authenticated user
    const vendorId = await getVendorIdFromUser(req.user!.userId);
    if (!vendorId) {
      res.status(403).json({
        success: false,
        error: 'User is not a vendor',
      });
      return;
    }

    const result = await ordersService.getOrderById(id);

    // Verify vendor ownership
    if (result.order.vendorId !== vendorId) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update Order Status
 * PATCH /vendor/orders/:id/status
 */
export async function updateOrderStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Validate input
    const validation = updateOrderStatusSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    // Get vendor ID from authenticated user
    const vendorId = await getVendorIdFromUser(req.user!.userId);
    if (!vendorId) {
      res.status(403).json({
        success: false,
        error: 'User is not a vendor',
      });
      return;
    }

    const result = await ordersService.updateOrderStatus({
      orderId: id,
      vendorId,
      newStatus: validation.data.status,
      actorId: req.user!.userId,
      actorRole: ActorRole.VENDOR,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof InvalidStatusTransitionError) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof UnauthorizedOrderAccessError) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get Order History (Audit Logs)
 * GET /vendor/orders/:id/history
 */
export async function getOrderHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Get vendor ID from authenticated user
    const vendorId = await getVendorIdFromUser(req.user!.userId);
    if (!vendorId) {
      res.status(403).json({
        success: false,
        error: 'User is not a vendor',
      });
      return;
    }

    // First verify vendor owns this order
    const orderResult = await ordersService.getOrderById(id);
    if (orderResult.order.vendorId !== vendorId) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    const result = await ordersService.getOrderHistory(id);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

// ===========================================
// Customer Endpoints
// ===========================================

/**
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
 * Create Order
 * POST /orders
 */
export async function createOrder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await ordersService.createOrder({
      customerId: req.user!.userId,
      input: validation.data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof VendorNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof ProductNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof ProductNotAvailableError) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof ProductVendorMismatchError) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
=======
>>>>>>> c1acc74 (feat(orders): implement order status flow with audit logging)
 * Get Customer Orders
 * GET /orders
 */
export async function getCustomerOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate query params
    const validation = orderQuerySchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await ordersService.getCustomerOrders(
      req.user!.userId,
      validation.data
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Customer Order by ID
 * GET /orders/:id
 */
export async function getCustomerOrderById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const result = await ordersService.getOrderById(id);

    // Verify customer ownership
    if (result.order.customerId !== req.user!.userId) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
      });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Cancel Order (Customer)
 * PATCH /orders/:id/cancel
 */
export async function cancelOrder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await ordersService.cancelOrder({
      orderId: id,
      actorId: req.user!.userId,
      actorRole: ActorRole.CUSTOMER,
      reason,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof InvalidStatusTransitionError) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error instanceof UnauthorizedOrderAccessError) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}

// ===========================================
// Helper Functions
// ===========================================

/**
 * Get vendor ID from user ID
 * Returns null if user is not a vendor
 */
async function getVendorIdFromUser(userId: string): Promise<string | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });

  return vendor?.id || null;
}
