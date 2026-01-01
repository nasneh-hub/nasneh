/**
 * Auth Middleware - Nasneh API
 * Following TECHNICAL_SPEC.md §5. Protected Routes
 *
 * Validates:
 * 1. Token signature
 * 2. Token expiry
 * 3. User exists & active
 * 4. Role permissions
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service';
import { UserRole, JwtPayload } from '../types/auth.types';

/**
 * Extended Request type with user info
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Auth middleware - validates JWT token
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authorization header missing or invalid',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token not provided',
      });
      return;
    }

    // Verify token
    const payload = authService.verifyAccessToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

/**
 * Role-based access control middleware
 * @param allowedRoles - Array of roles that can access the route
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

/**
 * Optional auth middleware - attaches user if token present, but doesn't require it
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const payload = authService.verifyAccessToken(token);
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    // Token invalid, but that's okay for optional auth
    next();
  }
}
