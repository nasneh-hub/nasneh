/**
 * Version Controller - Nasneh API
 * Endpoint for deployment verification
 */

import type { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Get deployment version information
 */
export async function getVersion(req: Request, res: Response) {
  try {
    // Read package.json for version
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );

    // Get git commit SHA if available (from CI/CD)
    const commitSha = process.env.COMMIT_SHA || process.env.GITHUB_SHA || 'unknown';
    const buildTime = process.env.BUILD_TIME || new Date().toISOString();

    res.json({
      version: packageJson.version,
      name: packageJson.name,
      commit: commitSha.substring(0, 7),
      commitFull: commitSha,
      buildTime,
      environment: process.env.APP_ENVIRONMENT || process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
    });
  } catch (error: any) {
    console.error('Error in getVersion:', error);
    res.status(500).json({
      error: error.message,
    });
  }
}
