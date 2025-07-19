class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  set(key, data, ttl = 5 * 60 * 1000) {
    // default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Clear existing timeout if any
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timeouts.set(key, timeout);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key) {
    this.cache.delete(key);

    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }

  clear() {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.cache.clear();
    this.timeouts.clear();
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }
}

export const cacheManager = new CacheManager();
