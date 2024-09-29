class LRUCache {
    private capacity: number;
    private cache: Map<string, any>;
  
    constructor(capacity: number) {
      this.capacity = capacity;
      this.cache = new Map();
    }
  
    // Get value from the cache
    get(key: string): any | undefined {
      if (!this.cache.has(key)) {
        return undefined;
      }
      
      // If key exists, move it to the front (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      
      return value;
    }
  
    // Set value in the cache
    set(key: string, value: any): void {
      // If the key already exists, delete it
      if (this.cache.has(key)) {
        this.cache.delete(key);
      }      
      this.cache.set(key, value);      
      // If the cache exceeds the capacity, remove the least recently used (LRU)
      if (this.cache.size > this.capacity) {
        const leastRecentlyUsedKey = this.cache.keys().next().value!;
        this.cache.delete(leastRecentlyUsedKey);
      }
    }
  }

  export default LRUCache;