import type { Plugin } from "./plugins";

// Cache configuration
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
}

export const cache = new MemoryCache();

// Rate limiting for GitHub API calls
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 50; // GitHub allows 60/hour for authenticated requests
  private readonly windowMs = 60 * 60 * 1000; // 1 hour

  async canMakeRequest(): Promise<boolean> {
    const now = Date.now();
    
    // Remove requests older than the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }

  async waitForSlot(): Promise<void> {
    while (!(await this.canMakeRequest())) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export const rateLimiter = new RateLimiter();

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
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
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Enhanced GitHub API fetcher with caching and rate limiting
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = CACHE_DURATION
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

// Batch loading for multiple GitHub files
export async function batchFetchFiles(
  requests: Array<{
    owner: string;
    repo: string;
    path: string;
    branch: string;
    cacheKey: string;
  }>
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  // Process requests in parallel but respect rate limits
  const promises = requests.map(async (request) => {
    const content = await fetchWithCache(
      request.cacheKey,
      async () => {
        // This would be your actual GitHub API call
        // Implementation depends on your fetchFileFromRepo function
        return null; // Placeholder
      }
    );
    results.set(request.cacheKey, content);
  });

  await Promise.allSettled(promises);
  return results;
}

// Pre-warming cache for popular plugins
export async function preWarmCache(popularPlugins: Plugin[]): Promise<void> {
  if (typeof window !== 'undefined') {
    // Don't run on client side
    return;
  }

  console.log('Pre-warming cache for popular plugins...');

  const requests = popularPlugins.flatMap(plugin => 
    plugin.versions.map(version => ({
      plugin,
      version,
      files: ['README.md', 'DOCUMENTATION.md', 'CHANGELOG.md']
    }))
  );

  // Batch process the requests
  for (const request of requests) {
    for (const file of request.files) {
      const cacheKey = `${request.plugin.slug}:${request.version.version}:${file}`;
      
      // Check if already cached
      if (cache.get(cacheKey)) {
        continue;
      }

      // Add to cache with extended TTL for popular content
      try {
        // You would implement the actual fetching logic here
        console.log(`Pre-warming: ${cacheKey}`);
      } catch (error) {
        console.warn(`Failed to pre-warm ${cacheKey}:`, error);
      }
    }
  }

  console.log('Cache pre-warming completed');
}

// Background cache refresh
export function startBackgroundRefresh(): void {
  if (typeof window !== 'undefined') {
    // Don't run on client side
    return;
  }

  setInterval(() => {
    console.log(`Cache size: ${cache.size()} entries`);
    
    // You could implement cache refresh logic here
    // For example, refresh entries that are about to expire
  }, 30 * 60 * 1000); // Every 30 minutes
}

// Memory usage monitoring
export function getCacheStats() {
  return {
    size: cache.size(),
    // Add more stats as needed
  };
}
