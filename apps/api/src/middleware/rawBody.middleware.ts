/**
 * Raw Body Middleware - Nasneh API
 * Captures raw request body before JSON parsing for webhook signature verification
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Extended Request type with raw body
 */
export interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

/**
 * Middleware to capture raw body for specific routes
 * Must be applied BEFORE express.json() for the routes that need it
 */
export function captureRawBody(
  req: RawBodyRequest,
  res: Response,
  next: NextFunction
): void {
  const chunks: Buffer[] = [];

  req.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks);
    next();
  });

  req.on('error', (err) => {
    next(err);
  });
}

/**
 * Express.json() wrapper that also stores raw body
 * Use this instead of express.json() for routes that need raw body access
 */
export function jsonWithRawBody(
  req: RawBodyRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.rawBody) {
    try {
      req.body = JSON.parse(req.rawBody.toString('utf-8'));
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid JSON body',
      });
    }
  } else {
    next();
  }
}
