/**
 * Nasneh API - Main Entry Point
 * Following TECHNICAL_SPEC.md
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { authRoutes } from './modules/auth';
import { vendorRouter as vendorProductsRouter, publicRouter as publicProductsRouter } from './modules/products';
import { uploadRoutes } from './modules/upload';
import { vendorOrderRoutes, customerOrderRoutes } from './modules/orders';
import { providerServicesRouter, publicServicesRouter } from './modules/services';
import { providerCalendarRouter } from './modules/availability';
import { notFoundHandler, errorHandler } from './middleware';

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

// TODO: Add more routes as modules are created
// app.use(`${apiPrefix}/users`, userRoutes);
// app.use(`${apiPrefix}/payments`, paymentRoutes);

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
