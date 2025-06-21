// Simple in-memory cache for cast data
// In production, consider using Redis or similar

import type { Cast } from "@neynar/nodejs-sdk/build/api";

interface CacheEntry {
  data: Cast;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedCast(key: string): Cast | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  // Check if cache is expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCachedCast(key: string, data: Cast): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Prevent memory leak - limit cache size
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}