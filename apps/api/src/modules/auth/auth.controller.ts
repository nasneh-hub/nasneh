/**
 * Auth Controller - Nasneh API
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import {
  requestOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  JwtPayload,
} from '../../types/auth.types.js';

/**
 * Extended request type with cooldown setter and user
 */
interface RequestWithCooldown extends Request {
  setCooldown?: () => Promise<void>;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Extract metadata from request for token storage
 */
function getRequestMetadata(req: Request): { userAgent?: string; ipAddress?: string } {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip || req.socket.remoteAddress,
  };
}

/**
 * Request OTP
 * POST /auth/request-otp
 *
 * Rate limited: 5 requests per hour per phone
 * Cooldown: 60 seconds between requests
 */
export async function requestOtp(
  req: RequestWithCooldown,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = requestOtpSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { phone } = validation.data;
    console.log('[AUTH DEBUG] requestOtp - Incoming phone:', phone);
    const result = await authService.requestOtp(phone);
    console.log('[AUTH DEBUG] requestOtp - Result:', result.success ? 'SUCCESS' : 'FAILED', result);

    if (req.setCooldown) {
      await req.setCooldown();
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Verify OTP
 * POST /auth/verify-otp
 *
 * Rate limited: 10 attempts per hour per phone
 * Returns access token and refresh token
 */
export async function verifyOtp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = verifyOtpSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { phone, otp } = validation.data;
    const metadata = getRequestMetadata(req);

    const result = await authService.verifyOtp(phone, otp, metadata);

    res.status(200).json(result);
  } catch (error: any) {
    // Handle client errors (invalid OTP, expired, etc.)
    if (error.statusCode === 400) {
      res.status(400).json({
        success: false,
        error: error.message,
        ...(error.attemptsRemaining !== undefined && { attemptsRemaining: error.attemptsRemaining }),
      });
      return;
    }
    // Let global error handler deal with 500s
    next(error);
  }
}

/**
 * Refresh Token
 * POST /auth/refresh
 *
 * Exchanges refresh token for new access token
 * Implements token rotation: old refresh token is invalidated
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { refreshToken } = validation.data;
    const metadata = getRequestMetadata(req);

    const result = await authService.refreshToken(refreshToken, metadata);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Logout
 * POST /auth/logout
 *
 * Invalidates refresh token and optionally blacklists access token
 */
export async function logout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    // Get JTI from current access token if available
    const accessTokenJti = req.user?.jti;

    if (refreshToken) {
      await authService.logout(refreshToken, accessTokenJti);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout from all devices
 * POST /auth/logout-all
 *
 * Revokes all refresh tokens for the authenticated user
 * Requires authentication
 */
export async function logoutAll(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const result = await authService.logoutAll(user.userId);

    res.status(200).json({
      success: true,
      message: `Logged out from ${result.revokedCount} device(s)`,
      revokedCount: result.revokedCount,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get active sessions
 * GET /auth/sessions
 *
 * Returns all active sessions for the authenticated user
 * Requires authentication
 */
export async function getSessions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const sessions = await authService.getUserSessions(user.userId);

    // Map to safe response (don't expose token hashes)
    const safeSessions = sessions.map((session) => ({
      createdAt: new Date(session.createdAt).toISOString(),
      expiresAt: new Date(session.expiresAt).toISOString(),
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
    }));

    res.status(200).json({
      success: true,
      sessions: safeSessions,
      count: safeSessions.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user (protected route)
 * GET /auth/me
 */
export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}
