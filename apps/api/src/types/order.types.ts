/**
 * Order Types - Nasneh API
 * Following TECHNICAL_SPEC.md data models
 */

import { z } from 'zod';

// ===========================================
// Enums
// ===========================================

export const FulfillmentType = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
} as const;

export type FulfillmentType = (typeof FulfillmentType)[keyof typeof FulfillmentType];

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// ===========================================
// Validation Schemas
// ===========================================

// Price validation: BHD uses 3 decimal places
export const priceSchema = z
  .number()
  .nonnegative('Price must be non-negative')
  .multipleOf(0.001, 'Price must have at most 3 decimal places');

// Address schema for delivery/pickup
export const addressSchema = z.object({
  label: z.string().optional(),
  addressLine: z.string(),
  area: z.string(),
  block: z.string().optional(),
  road: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Order item input schema
export const orderItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

// Create order schema
export const createOrderSchema = z.object({
  vendorId: z.string().uuid(),
  fulfillmentType: z.nativeEnum(FulfillmentType as any),
  items: z.array(orderItemInputSchema).min(1, 'At least one item is required'),
  deliveryAddress: addressSchema.optional(),
  pickupAddress: addressSchema.optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => {
    // If delivery, deliveryAddress is required
    if (data.fulfillmentType === FulfillmentType.DELIVERY) {
      return !!data.deliveryAddress;
    }
    return true;
  },
  {
    message: 'Delivery address is required for delivery orders',
    path: ['deliveryAddress'],
  }
);

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus as any),
});

// Order query schema
export const orderQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  status: z.nativeEnum(OrderStatus as any).optional(),
  fulfillmentType: z.nativeEnum(FulfillmentType as any).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'total', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ===========================================
// Types
// ===========================================

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

// Order item response type
export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: string; // Decimal as string for precision
  quantity: number;
  subtotal: string;
  createdAt: Date;
  product?: {
    id: string;
    name: string;
    images: string[];
  };
}

// Order response type
export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  vendorId: string;
  driverId: string | null;
  fulfillmentType: FulfillmentType;
  subtotal: string; // Decimal as string for precision
  deliveryFee: string | null;
  commission: string;
  total: string;
  status: OrderStatus;
  deliveryAddress: AddressInput | null;
  pickupAddress: AddressInput | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    name: string | null;
    phone: string;
  };
  vendor?: {
    id: string;
    storeName: string;
    logoUrl: string | null;
  };
  driver?: {
    id: string;
    name: string | null;
    phone: string;
  } | null;
  items?: OrderItemResponse[];
}

// Paginated response
export interface PaginatedOrderResponse {
  data: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Order status transition map (valid transitions)
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [], // Terminal state
  [OrderStatus.CANCELLED]: [], // Terminal state
};
