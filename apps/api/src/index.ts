/**
 * Nasneh API - Main Entry Point
 * Following TECHNICAL_SPEC.md
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { authRoutes } from './modules/auth';
import { vendorOrderRoutes, customerOrderRoutes } from './modules/orders';
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

// Order routes
app.use(`${apiPrefix}/vendor/orders`, vendorOrderRoutes);
app.use(`${apiPrefix}/orders`, customerOrderRoutes);

// TODO: Add more routes as modules are created
// app.use(`${apiPrefix}/users`, userRoutes);
// app.use(`${apiPrefix}/products`, productRoutes);
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
