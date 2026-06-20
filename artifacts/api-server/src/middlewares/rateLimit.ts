import type { Request, Response, NextFunction, RequestHandler } from "express";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

/**
 * Simple in-memory, per-IP rate limiter. Tracks request timestamps per client
 * within a sliding window and rejects requests once the limit is exceeded.
 *
 * Note: state lives in-process, so it resets on restart and is not shared
 * across multiple instances. That is acceptable for basic abuse protection.
 */
export function rateLimit({
  windowMs,
  max,
  message = "Too many requests. Please slow down and try again later.",
}: RateLimitOptions): RequestHandler {
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = req.ip ?? "unknown";

    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      const retryMs = windowMs - (now - recent[0]);
      res.setHeader("Retry-After", Math.ceil(retryMs / 1000));
      res.status(429).json({ error: message });
      hits.set(key, recent);
      return;
    }

    recent.push(now);
    hits.set(key, recent);

    // Opportunistic cleanup so the map does not grow unbounded.
    if (hits.size > 5000) {
      for (const [k, timestamps] of hits) {
        const live = timestamps.filter((t) => now - t < windowMs);
        if (live.length === 0) hits.delete(k);
        else hits.set(k, live);
      }
    }

    next();
  };
}
