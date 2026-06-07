type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    });
  }, 60000); // Clean every minute
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
  register: { limit: 3, windowMs: 60 * 1000 }, // 3 per minute
  twoFactor: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
  withdraw: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  cardPurchase: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  api: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
};

export function getRateLimitKey(identifier: string, action: string): string {
  return `${action}:${identifier}`;
}
