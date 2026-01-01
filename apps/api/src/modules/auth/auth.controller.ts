/**
 * Auth Controller - Nasneh API
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  requestOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from '../../types/auth.types';

/**
 * Extended request type with cooldown setter
 */
interface RequestWithCooldown extends Request {
  setCooldown?: () => Promise<void>;
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
    // Validate input
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

    // Request OTP
    const result = await authService.requestOtp(phone);

    // Set cooldown after successful OTP request
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
 */
export async function verifyOtp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
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

    // Verify OTP
    const result = await authService.verifyOtp(phone, otp);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh Token
 * POST /auth/refresh
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
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

    // Refresh token
    const result = await authService.refreshToken(refreshToken);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Logout
 * POST /auth/logout
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logout(refreshToken);
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
 * Get current user (protected route)
 * GET /auth/me
 */
export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // User is attached by auth middleware
    const user = (req as any).user;

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
