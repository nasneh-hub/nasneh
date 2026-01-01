/**
 * Redis Client - Nasneh API
 * Used for OTP storage, rate limiting, and session management
 *
 * In development mode, uses in-memory fallback if Redis is not available.
 */

import { config } from '../config/env';

// ===========================================
// Types
// ===========================================

interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

// ===========================================
// In-Memory Fallback (Development)
// ===========================================

interface MemoryEntry {
  value: string;
  expiresAt: number | null;
}

class InMemoryStore implements RedisLikeClient {
  private store: Map<string, MemoryEntry> = new Map();

  private isExpired(entry: MemoryEntry): boolean {
    if (entry.expiresAt === null) return false;
    return Date.now() > entry.expiresAt;
  }

  private cleanup(): void {
    for (const [key, entry] of this.store.entries()) {
      if (this.isExpired(entry)) {
        this.store.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    this.cleanup();
    const entry = this.store.get(key);
    if (!entry || this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const expiresAt = options?.EX
      ? Date.now() + options.EX * 1000
      : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async incr(key: string): Promise<number> {
    const entry = this.store.get(key);
    let newValue: number;

    if (!entry || this.isExpired(entry)) {
      newValue = 1;
      this.store.set(key, {
        value: '1',
        expiresAt: entry?.expiresAt ?? null,
      });
    } else {
      newValue = parseInt(entry.value, 10) + 1;
      entry.value = newValue.toString();
    }

    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + seconds * 1000;
    }
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt === null) {
      return -1;
    }
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }
}

// ===========================================
// Redis Client Factory
// ===========================================

let redisClient: RedisLikeClient | null = null;

export async function getRedisClient(): Promise<RedisLikeClient> {
  if (redisClient) {
    return redisClient;
  }

  // In development, use in-memory store if Redis URL is not configured
  if (config.isDevelopment && !config.redis.url) {
    console.log('[Redis] Using in-memory store (development mode)');
    redisClient = new InMemoryStore();
    return redisClient;
  }

  // Try to connect to Redis
  try {
    // Dynamic import to avoid issues if redis package is not installed
    const { createClient } = await import('redis');

    const client = createClient({
      url: config.redis.url,
    });

    client.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err);
    });

    client.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    await client.connect();

    // Wrap the client to match our interface
    redisClient = {
      get: async (key: string) => client.get(key),
      set: async (key: string, value: string, options?: { EX?: number }) => {
        if (options?.EX) {
          await client.set(key, value, { EX: options.EX });
        } else {
          await client.set(key, value);
        }
      },
      del: async (key: string) => {
        await client.del(key);
      },
      incr: async (key: string) => client.incr(key),
      expire: async (key: string, seconds: number) => {
        await client.expire(key, seconds);
      },
      ttl: async (key: string) => client.ttl(key),
    };

    return redisClient;
  } catch (error) {
    // Fallback to in-memory store
    console.warn('[Redis] Failed to connect, using in-memory store:', error);
    redisClient = new InMemoryStore();
    return redisClient;
  }
}

// ===========================================
// OTP Storage Keys
// ===========================================

export const OTP_KEY_PREFIX = 'otp:';
export const RATE_LIMIT_KEY_PREFIX = 'rate:otp:';

export function getOtpKey(phone: string): string {
  return `${OTP_KEY_PREFIX}${phone}`;
}

export function getRateLimitKey(phone: string): string {
  return `${RATE_LIMIT_KEY_PREFIX}${phone}`;
}
