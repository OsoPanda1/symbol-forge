const memoryStore = new Map<string, { count: number; ts: number }>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry) {
    memoryStore.set(key, { count: 1, ts: now });
    return true;
  }

  if (now - entry.ts > windowMs) {
    memoryStore.set(key, { count: 1, ts: now });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count += 1;
  return true;
}
