const cache = new Map();

export function getCache(key: any) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key: any, data: any, ttl = 60_000) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}
