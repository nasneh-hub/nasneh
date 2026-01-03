/**
 * Nasneh API - Main Entry Point
 * Following TECHNICAL_SPEC.md
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { authRoutes } from './modules/auth/index.js';
import { vendorRouter as vendorProductsRouter, publicRouter as publicProductsRouter } from './modules/products/index.js';
import { uploadRoutes } from './modules/upload/index.js';
import { vendorOrderRoutes, customerOrderRoutes } from './modules/orders/index.js';
import { providerServicesRouter, publicServicesRouter } from './modules/services/index.js';
import { providerCalendarRouter } from './modules/availability/index.js';
import { bookingsRoutes, customerBookingRoutes, providerBookingRoutes } from './modules/bookings/index.js';
import { usersRoutes } from './modules/users/index.js';
import { myAddressesRouter, userAddressesRouter } from './modules/addresses/index.js';
import { cartRouter } from './modules/cart/index.js';
import { reviewsRoutes, adminReviewsRoutes, userReviewsRoutes } from './modules/reviews/index.js';
import { paymentsRoutes } from './modules/payments/index.js';
import { notFoundHandler, errorHandler } from './middleware/index.js';

// ===========================================
// Create Express App
// ===========================================

const app: express.Application = express();

// ===========================================
// Middleware
// ===========================================

// CORS
app.use(cors({
  origin: [config.urls.frontend, config.urls.dashboard],
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================================
// Health Check
// ===========================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
  });
});

// ===========================================
// API Routes
// ===========================================

const apiPrefix = `/api/${config.apiVersion}`;

// Auth routes
app.use(`${apiPrefix}/auth`, authRoutes);

// Products routes (public)
app.use(`${apiPrefix}/products`, publicProductsRouter);

// Vendor routes (protected)
app.use(`${apiPrefix}/vendor`, vendorProductsRouter);

// Upload routes (protected)
app.use(`${apiPrefix}/upload`, uploadRoutes);

// Order routes
app.use(`${apiPrefix}/vendor/orders`, vendorOrderRoutes);
app.use(`${apiPrefix}/orders`, customerOrderRoutes);

// Services routes
app.use(`${apiPrefix}/provider/services`, providerServicesRouter);
app.use(`${apiPrefix}/services`, publicServicesRouter);

// Provider calendar routes (availability management)
app.use(`${apiPrefix}/provider/calendar`, providerCalendarRouter);

// Bookings routes
app.use(`${apiPrefix}/bookings`, bookingsRoutes);
app.use(`${apiPrefix}/customer`, customerBookingRoutes);
app.use(`${apiPrefix}/provider`, providerBookingRoutes);

// User profile routes
app.use(`${apiPrefix}/users`, usersRoutes);

// Address management routes
app.use(`${apiPrefix}/users/me/addresses`, myAddressesRouter);
app.use(`${apiPrefix}/users/:userId/addresses`, userAddressesRouter);

// Cart routes
app.use(`${apiPrefix}/cart`, cartRouter);

// Reviews routes
app.use(`${apiPrefix}/reviews`, reviewsRoutes);
app.use(`${apiPrefix}/admin/reviews`, adminReviewsRoutes);
app.use(`${apiPrefix}/users/me/reviews`, userReviewsRoutes);

// Payment routes
app.use(`${apiPrefix}/payments`, paymentsRoutes);

// ===========================================
// Error Handling
// ===========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ===========================================
// Start Server
// ===========================================

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`
╔════════════════════════════════════════════╗
║           Nasneh API Server                ║
╠════════════════════════════════════════════╣
║  Environment: ${config.isDevelopment ? 'development' : 'production'}                  ║
║  Port:        ${config.port}                            ║
║  API Version: ${config.apiVersion}                            ║
║  Health:      http://localhost:${config.port}/health    ║
╚════════════════════════════════════════════╝
    `);
  });
}

export default app;
