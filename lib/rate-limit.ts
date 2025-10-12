import { TRPCError } from '@trpc/server';

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  limit: number;
  windowMs: number;
  identifier?: string;
  message?: string;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private store = rateLimitStore;

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private getKey(identifier: string, action: string): string {
    return `${identifier}:${action}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }

  checkLimit(
    identifier: string,
    action: string,
    options: RateLimitOptions
  ): boolean {
    this.cleanup();

    const key = this.getKey(identifier, action);
    const now = Date.now();

    const current = this.store.get(key);

    if (!current || now > current.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return true;
    }

    if (current.count >= options.limit) {
      return false;
    }

    // Increment counter
    current.count++;
    this.store.set(key, current);
    return true;
  }

  getRemainingTime(identifier: string, action: string): number {
    const key = this.getKey(identifier, action);
    const current = this.store.get(key);

    if (!current) return 0;

    const now = Date.now();
    return Math.max(0, current.resetTime - now);
  }

  reset(identifier: string, action: string): void {
    const key = this.getKey(identifier, action);
    this.store.delete(key);
  }
}

// Rate limiting middleware for tRPC
export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  const rateLimiter = RateLimiter.getInstance();

  return async ({ ctx, next, path }: { ctx: any; next: any; path: string }) => {
    // Get identifier from context (user ID, IP, etc.)
    const identifier = options.identifier || ctx.userId || 'anonymous';

    // Check rate limit
    const allowed = rateLimiter.checkLimit(identifier, path, options);

    if (!allowed) {
      const remainingTime = rateLimiter.getRemainingTime(identifier, path);
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message:
          options.message ||
          `Rate limit exceeded. Try again in ${Math.ceil(remainingTime / 1000)} seconds.`,
      });
    }

    return next();
  };
};

// Predefined rate limits for different actions
export const rateLimits = {
  // General API calls
  general: {
    limit: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests. Please try again later.',
  },

  // Trip joining/leaving
  tripActions: {
    limit: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Too many trip actions. Please wait before trying again.',
  },

  // Alert triggering
  alerts: {
    limit: 1,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'You can only trigger one alert per hour.',
  },

  // Profile updates
  profileUpdates: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many profile updates. Please wait before trying again.',
  },

  // File uploads
  fileUploads: {
    limit: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Too many file uploads. Please wait before trying again.',
  },

  // Authentication attempts
  auth: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message:
      'Too many authentication attempts. Please wait before trying again.',
  },
} as const;

// Helper function to get client IP
export const getClientIP = (headers: Headers): string => {
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  const remoteAddr = headers.get('x-remote-addr');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (remoteAddr) {
    return remoteAddr;
  }

  return 'unknown';
};

// Rate limiting decorator for tRPC procedures
export const withRateLimit = (options: RateLimitOptions) => {
  return (procedure: any) => {
    return procedure.use(createRateLimitMiddleware(options));
  };
};
