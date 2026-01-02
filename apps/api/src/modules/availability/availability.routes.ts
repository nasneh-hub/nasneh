/**
 * Availability Routes
 * 
 * Provider calendar routes: /provider/calendar
 * Public slots route: /services/:id/slots (added to services routes)
 */

import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../middleware/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';
import {
  getProviderCalendar,
  updateProviderCalendar,
  createRule,
  updateRule,
  deleteRule,
  createOverride,
  updateOverride,
  deleteOverride,
  updateSettings,
  getServiceSlots,
} from './availability.controller.js';

// ===========================================
// Provider Calendar Routes (/provider/calendar)
// ===========================================

export const providerCalendarRouter: Router = Router();

// All provider routes require authentication and provider role
providerCalendarRouter.use(authMiddleware);
providerCalendarRouter.use(requireRoles(UserRole.PROVIDER));

// GET /provider/calendar - Get availability rules, overrides, and settings
providerCalendarRouter.get('/', getProviderCalendar);

// PATCH /provider/calendar - Update availability rules (bulk replace)
providerCalendarRouter.patch('/', updateProviderCalendar);

// POST /provider/calendar/rules - Create a single availability rule
providerCalendarRouter.post('/rules', createRule);

// PATCH /provider/calendar/rules/:id - Update a single rule
providerCalendarRouter.patch('/rules/:id', updateRule);

// DELETE /provider/calendar/rules/:id - Delete a single rule
providerCalendarRouter.delete('/rules/:id', deleteRule);

// POST /provider/calendar/overrides - Create an override
providerCalendarRouter.post('/overrides', createOverride);

// PATCH /provider/calendar/overrides/:id - Update an override
providerCalendarRouter.patch('/overrides/:id', updateOverride);

// DELETE /provider/calendar/overrides/:id - Delete an override
providerCalendarRouter.delete('/overrides/:id', deleteOverride);

// PATCH /provider/calendar/settings - Update availability settings
providerCalendarRouter.patch('/settings', updateSettings);

// ===========================================
// Public Slots Route (to be added to services routes)
// ===========================================

// Export the controller function for use in services routes
export { getServiceSlots };
