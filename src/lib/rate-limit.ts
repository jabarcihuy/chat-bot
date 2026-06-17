interface RateLimitBucket {
    count: number;
    resetAt: number;
}

interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
    retryAfterSeconds: number;
}

const globalForRateLimit = globalThis as typeof globalThis & {
    aiRateLimitBuckets?: Map<string, RateLimitBucket>;
    aiRateLimitLastCleanup?: number;
};

const buckets =
    globalForRateLimit.aiRateLimitBuckets ??
    new Map<string, RateLimitBucket>();

globalForRateLimit.aiRateLimitBuckets = buckets;

function cleanupExpiredBuckets(now: number) {
    const lastCleanup = globalForRateLimit.aiRateLimitLastCleanup ?? 0;
    if (now - lastCleanup < 60_000) return;

    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) {
            buckets.delete(key);
        }
    }

    globalForRateLimit.aiRateLimitLastCleanup = now;
}

export function checkRateLimit(
    key: string,
    { limit, windowMs }: RateLimitOptions
): RateLimitResult {
    const now = Date.now();
    cleanupExpiredBuckets(now);

    const current = buckets.get(key);
    const bucket =
        !current || current.resetAt <= now
            ? { count: 0, resetAt: now + windowMs }
            : current;

    if (bucket.count >= limit) {
        return {
            allowed: false,
            limit,
            remaining: 0,
            resetAt: bucket.resetAt,
            retryAfterSeconds: Math.max(
                1,
                Math.ceil((bucket.resetAt - now) / 1000)
            ),
        };
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - bucket.count),
        resetAt: bucket.resetAt,
        retryAfterSeconds: 0,
    };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
    return {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
        ...(result.allowed
            ? {}
            : { "Retry-After": result.retryAfterSeconds.toString() }),
    };
}
