class CommandCache {
  constructor(maxSize = 100, ttl = 3600000) { // 1 hour default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.pendingCommands = new Map(); // For background sync
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

  // Queue command for background sync when offline
  queueForSync(command, data) {
    const key = this.generateKey(command);
    this.pendingCommands.set(key, {
      command,
      data,
      timestamp: Date.now()
    });

    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('command-sync');
      });
    }
  }

  // Process queued commands (called by service worker)
  async processQueuedCommands() {
    const commands = Array.from(this.pendingCommands.entries());
    const results = [];

    for (const [key, { command, data, timestamp }] of commands) {
      try {
        // Attempt to send the command (implement actual API call here)
        // For now, just log and remove from queue
        console.log('Processing queued command:', command);
        this.pendingCommands.delete(key);
        results.push({ command, success: true });
      } catch (error) {
        console.error('Failed to process queued command:', error);
        results.push({ command, success: false, error });
      }
    }

    return results;
  }

  // Clear cache
  clear() {
    this.cache.clear();
    this.pendingCommands.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      pendingCommands: this.pendingCommands.size,
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

    // Clean old pending commands (older than 24 hours)
    for (const [key, value] of this.pendingCommands.entries()) {
      if (now - value.timestamp > 24 * 60 * 60 * 1000) {
        this.pendingCommands.delete(key);
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