/**
 * Query Cache Utility
 * Simple in-memory caching for API responses
 * Reduces database queries and improves performance
 */

class QueryCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live
  }

  /**
   * Set cache with TTL (seconds)
   */
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);

    // Set expiration
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.ttl.set(key, expiresAt);

    // Auto-delete after TTL
    setTimeout(() => {
      this.cache.delete(key);
      this.ttl.delete(key);
    }, ttlSeconds * 1000);

    return value;
  }

  /**
   * Get cache if exists and not expired
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiresAt = this.ttl.get(key);
    if (Date.now() > expiresAt) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Check if cache exists
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Invalidate cache by pattern (useful for updating related queries)
   */
  invalidatePattern(pattern) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }
}

// Singleton instance
export const queryCache = new QueryCache();

/**
 * Cache wrapper for API calls
 * Usage: cacheQuery('questions_all', () => Question.find())
 */
export const cacheQuery = async (key, queryFn, ttlSeconds = 300) => {
  // Check cache first
  const cached = queryCache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Execute query if not in cache
  const result = await queryFn();

  // Store in cache
  queryCache.set(key, result, ttlSeconds);

  return result;
};

export default { queryCache, cacheQuery };
