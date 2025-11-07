interface CacheEntry<T> {
  data: T;
  expiry: number;
  timestamp: number;
}

export class CacheService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
  private static readonly MAX_CACHE_SIZE = 100;

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Nettoyage si cache trop grand
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    });
  }

  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  static invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private static cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Supprimer les entrées expirées
    entries.forEach(([key, entry]) => {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    });

    // Si encore trop d'entrées, supprimer les plus anciennes
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = sortedEntries.slice(0, this.MAX_CACHE_SIZE / 2);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }
}