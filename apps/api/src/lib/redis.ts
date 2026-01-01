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

export interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  del(key: string | string[]): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  // Set operations for token management
  sAdd(key: string, member: string): Promise<void>;
  sRem(key: string, member: string): Promise<void>;
  sMembers(key: string): Promise<string[]>;
  sCard(key: string): Promise<number>;
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
  private sets: Map<string, Set<string>> = new Map();
  private setExpiry: Map<string, number | null> = new Map();

  private isExpired(entry: MemoryEntry): boolean {
    if (entry.expiresAt === null) return false;
    return Date.now() > entry.expiresAt;
  }

  private isSetExpired(key: string): boolean {
    const expiresAt = this.setExpiry.get(key);
    if (expiresAt === null || expiresAt === undefined) return false;
    return Date.now() > expiresAt;
  }

  private cleanup(): void {
    for (const [key, entry] of this.store.entries()) {
      if (this.isExpired(entry)) {
        this.store.delete(key);
      }
    }
    for (const [key] of this.sets.entries()) {
      if (this.isSetExpired(key)) {
        this.sets.delete(key);
        this.setExpiry.delete(key);
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

  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key : [key];
    for (const k of keys) {
      this.store.delete(k);
    }
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
    // Also handle set expiry
    if (this.sets.has(key)) {
      this.setExpiry.set(key, Date.now() + seconds * 1000);
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

  async exists(key: string): Promise<number> {
    this.cleanup();
    const entry = this.store.get(key);
    if (!entry || this.isExpired(entry)) {
      return 0;
    }
    return 1;
  }

  // Set operations
  async sAdd(key: string, member: string): Promise<void> {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    this.sets.get(key)!.add(member);
  }

  async sRem(key: string, member: string): Promise<void> {
    const set = this.sets.get(key);
    if (set) {
      set.delete(member);
    }
  }

  async sMembers(key: string): Promise<string[]> {
    this.cleanup();
    const set = this.sets.get(key);
    if (!set || this.isSetExpired(key)) {
      return [];
    }
    return Array.from(set);
  }

  async sCard(key: string): Promise<number> {
    this.cleanup();
    const set = this.sets.get(key);
    if (!set || this.isSetExpired(key)) {
      return 0;
    }
    return set.size;
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
      del: async (key: string | string[]) => {
        await client.del(key);
      },
      incr: async (key: string) => client.incr(key),
      expire: async (key: string, seconds: number) => {
        await client.expire(key, seconds);
      },
      ttl: async (key: string) => client.ttl(key),
      exists: async (key: string) => client.exists(key),
      sAdd: async (key: string, member: string) => {
        await client.sAdd(key, member);
      },
      sRem: async (key: string, member: string) => {
        await client.sRem(key, member);
      },
      sMembers: async (key: string) => client.sMembers(key),
      sCard: async (key: string) => client.sCard(key),
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
