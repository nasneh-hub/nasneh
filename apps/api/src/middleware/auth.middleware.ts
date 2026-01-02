/**
 * Auth Middleware - Nasneh API
 * Following TECHNICAL_SPEC.md §5. Protected Routes
 *
 * Validates:
 * 1. Token signature
 * 2. Token expiry
 * 3. Token not blacklisted
 * 4. Role permissions
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service.js';
import { UserRole, JwtPayload } from '../types/auth.types.js';

/**
 * Extended Request type with user info
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Auth middleware - validates JWT token
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    // Verify token (async - checks blacklist)
    const payload = await authService.verifyAccessToken(token);

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
 * Alias for authMiddleware - requires authentication
 */
export const requireAuth = authMiddleware;

/**
 * Optional auth middleware - attaches user if token present, but doesn't require it
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const payload = await authService.verifyAccessToken(token);
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    // Token invalid, but that's okay for optional auth
    next();
  }
}
