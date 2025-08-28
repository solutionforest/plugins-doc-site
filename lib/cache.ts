// Cache configuration for GitHub API
const CACHE_DURATION = 7200; // 2 hours in seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number = CACHE_DURATION): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Add method to get cache stats
  getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }

    return {
      total: this.cache.size,
      active: activeEntries,
      expired: expiredEntries,
    };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();

// Auto cleanup expired entries every 10 minutes
if (typeof window === "undefined") {
  setInterval(
    () => {
      cache.cleanup();
    },
    10 * 60 * 1000,
  );
}

// Rate limiting for GitHub API calls
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 50; // GitHub allows 60/hour for authenticated requests
  private readonly windowMs = 60 * 60 * 1000; // 1 hour

  async canMakeRequest(): Promise<boolean> {
    const now = Date.now();

    // Remove requests older than the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  async waitForSlot(): Promise<void> {
    while (!(await this.canMakeRequest())) {
      // Wait longer for rate limiting to prevent excessive polling
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Get rate limit stats
  getStats() {
    const now = Date.now();
    const recentRequests = this.requests.filter(
      (time) => now - time < this.windowMs,
    );

    return {
      requestsInWindow: recentRequests.length,
      maxRequests: this.maxRequests,
      remaining: this.maxRequests - recentRequests.length,
      windowMs: this.windowMs,
      resetTime:
        recentRequests.length > 0
          ? new Date(recentRequests[0] + this.windowMs)
          : new Date(),
    };
  }
}

export const rateLimiter = new RateLimiter();

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = RETRY_DELAY * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Enhanced GitHub API fetcher with caching and rate limiting
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = CACHE_DURATION,
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cached;
  }

  console.log(`Cache miss for: ${cacheKey}`);

  // Wait for rate limit slot
  await rateLimiter.waitForSlot();

  // Fetch with retry logic
  const data = await withRetry(fetchFn);

  // Cache the result
  cache.set(cacheKey, data, ttlSeconds);

  return data;
}

// Static export compatible GitHub API functions with fetch caching
export async function getCachedGitHubContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
) {
  const cacheKey = `github-content:${owner}:${repo}:${path}:${ref}`;

  return fetchWithCache(cacheKey, async () => {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        // Use force-cache for static exports
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  });
}

export async function getCachedGitHubTree(
  owner: string,
  repo: string,
  treeSha: string,
  recursive = false,
) {
  const cacheKey = `github-tree:${owner}:${repo}:${treeSha}:${recursive}`;

  return fetchWithCache(cacheKey, async () => {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}${recursive ? "?recursive=1" : ""}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  });
}

// Cache invalidation utilities (simplified for static export)
export const clearInMemoryCache = () => {
  cache.clear();
  console.log("In-memory cache cleared");
};

// Cache monitoring utilities
export const getCacheStats = () => {
  return {
    memory: cache.getStats(),
    rateLimit: rateLimiter.getStats(),
  };
};
