class CommandCache {
  constructor(maxSize = 100, ttl = 3600000) { // 1 hour default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  // Generate cache key from command
  generateKey(command) {
    return command.toLowerCase().trim();
  }

  // Check if command is cacheable
  isCacheable(command) {
    const lowerCommand = command.toLowerCase();

    // Cache static responses (time, date, day, month)
    if (lowerCommand.includes('what time') ||
        lowerCommand.includes('current time') ||
        lowerCommand.includes('what date') ||
        lowerCommand.includes('today date') ||
        lowerCommand.includes('what day') ||
        lowerCommand.includes('today day') ||
        lowerCommand.includes('what month') ||
        lowerCommand.includes('current month')) {
      return false; // Don't cache time-sensitive data
    }

    // Cache general knowledge questions and simple commands
    return lowerCommand.length > 5; // Only cache meaningful commands
  }

  // Get cached response
  get(command) {
    const key = this.generateKey(command);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Set cached response
  set(command, data) {
    if (!this.isCacheable(command)) return;

    const key = this.generateKey(command);

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clear() {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Could be implemented with hit/miss counters
    };
  }

  // Clean expired entries
  clean() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const commandCache = new CommandCache();

// Clean cache periodically (every 5 minutes)
setInterval(() => {
  commandCache.clean();
}, 300000);

export default commandCache;