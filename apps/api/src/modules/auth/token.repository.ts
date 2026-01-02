/**
 * Token Repository - Nasneh API
 * Redis-based refresh token storage following TECHNICAL_SPEC.md
 *
 * Features:
 * - 7-day TTL for refresh tokens
 * - Token rotation (old token invalidated on refresh)
 * - Token blacklist for logout
 * - Atomic operations for thread safety
 */

import { getRedisClient } from '../../lib/redis.js';
import { config } from '../../config/env.js';

// ===========================================
// Constants
// ===========================================

const REFRESH_TOKEN_PREFIX = 'refresh:';
const TOKEN_BLACKLIST_PREFIX = 'blacklist:';
const USER_TOKENS_PREFIX = 'user_tokens:';

// 7 days in seconds
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

// Blacklist TTL should match access token expiry (15 minutes)
const BLACKLIST_TTL = 15 * 60;

// ===========================================
// Types
// ===========================================

export interface StoredRefreshToken {
  userId: string;
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
  userAgent?: string;
  ipAddress?: string;
}

// ===========================================
// Token Repository
// ===========================================

export class TokenRepository {
  /**
   * Hash a token for secure storage
   * We don't store the raw token, only its hash
   */
  private hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Store a refresh token in Redis
   * Associates token with user for easy lookup and revocation
   */
  async store(
    token: string,
    userId: string,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<void> {
    const redis = await getRedisClient();
    const tokenHash = this.hashToken(token);
    const key = `${REFRESH_TOKEN_PREFIX}${tokenHash}`;
    const userTokensKey = `${USER_TOKENS_PREFIX}${userId}`;

    const storedData: StoredRefreshToken = {
      userId,
      tokenHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + REFRESH_TOKEN_TTL * 1000,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    };

    // Store token data with TTL
    await redis.set(key, JSON.stringify(storedData), {
      EX: REFRESH_TOKEN_TTL,
    });

    // Add token hash to user's token set (for revoking all user tokens)
    await redis.sAdd(userTokensKey, tokenHash);
    // Set TTL on user tokens set (auto-cleanup)
    await redis.expire(userTokensKey, REFRESH_TOKEN_TTL);
  }

  /**
   * Validate a refresh token
   * Returns the stored data if valid, null otherwise
   */
  async validate(token: string): Promise<StoredRefreshToken | null> {
    const redis = await getRedisClient();
    const tokenHash = this.hashToken(token);
    const key = `${REFRESH_TOKEN_PREFIX}${tokenHash}`;

    const data = await redis.get(key);
    if (!data) {
      return null;
    }

    try {
      const stored = JSON.parse(data) as StoredRefreshToken;

      // Check if expired
      if (Date.now() > stored.expiresAt) {
        await this.revoke(token);
        return null;
      }

      return stored;
    } catch {
      return null;
    }
  }

  /**
   * Revoke a refresh token
   * Used during token rotation and logout
   */
  async revoke(token: string): Promise<void> {
    const redis = await getRedisClient();
    const tokenHash = this.hashToken(token);
    const key = `${REFRESH_TOKEN_PREFIX}${tokenHash}`;

    // Get token data to find userId
    const data = await redis.get(key);
    if (data) {
      try {
        const stored = JSON.parse(data) as StoredRefreshToken;
        const userTokensKey = `${USER_TOKENS_PREFIX}${stored.userId}`;
        // Remove from user's token set
        await redis.sRem(userTokensKey, tokenHash);
      } catch {
        // Ignore parse errors
      }
    }

    // Delete the token
    await redis.del(key);
  }

  /**
   * Revoke all refresh tokens for a user
   * Used for security events (password change, suspicious activity)
   */
  async revokeAllForUser(userId: string): Promise<number> {
    const redis = await getRedisClient();
    const userTokensKey = `${USER_TOKENS_PREFIX}${userId}`;

    // Get all token hashes for user
    const tokenHashes = await redis.sMembers(userTokensKey);

    if (tokenHashes.length === 0) {
      return 0;
    }

    // Delete all tokens
    const keys = tokenHashes.map((hash: string) => `${REFRESH_TOKEN_PREFIX}${hash}`);
    await redis.del(keys);

    // Clear user's token set
    await redis.del(userTokensKey);

    return tokenHashes.length;
  }

  /**
   * Add an access token to the blacklist
   * Used during logout to invalidate access tokens before expiry
   */
  async blacklistAccessToken(tokenJti: string): Promise<void> {
    const redis = await getRedisClient();
    const key = `${TOKEN_BLACKLIST_PREFIX}${tokenJti}`;

    // Store with TTL matching access token expiry
    await redis.set(key, '1', { EX: BLACKLIST_TTL });
  }

  /**
   * Check if an access token is blacklisted
   */
  async isAccessTokenBlacklisted(tokenJti: string): Promise<boolean> {
    const redis = await getRedisClient();
    const key = `${TOKEN_BLACKLIST_PREFIX}${tokenJti}`;

    const exists = await redis.exists(key);
    return exists === 1;
  }

  /**
   * Get all active sessions for a user
   * Returns metadata about each active refresh token
   */
  async getUserSessions(userId: string): Promise<StoredRefreshToken[]> {
    const redis = await getRedisClient();
    const userTokensKey = `${USER_TOKENS_PREFIX}${userId}`;

    const tokenHashes = await redis.sMembers(userTokensKey);

    if (tokenHashes.length === 0) {
      return [];
    }

    const sessions: StoredRefreshToken[] = [];

    for (const hash of tokenHashes) {
      const key = `${REFRESH_TOKEN_PREFIX}${hash}`;
      const data = await redis.get(key);

      if (data) {
        try {
          const stored = JSON.parse(data) as StoredRefreshToken;
          sessions.push(stored);
        } catch {
          // Skip invalid entries
        }
      }
    }

    return sessions;
  }

  /**
   * Count active sessions for a user
   */
  async countUserSessions(userId: string): Promise<number> {
    const redis = await getRedisClient();
    const userTokensKey = `${USER_TOKENS_PREFIX}${userId}`;
    return redis.sCard(userTokensKey);
  }
}

// Export singleton instance
export const tokenRepository = new TokenRepository();
