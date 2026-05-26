interface CachedUser {
  userId: string;
  role: string;
  firstName: string;
  timestamp: number;
}

const store = new Map<string, CachedUser>();
const TTL_MS = 30_000;

export function getUserFromCache(clerkUserId: string): CachedUser | undefined {
  const entry = store.get(clerkUserId);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > TTL_MS) {
    store.delete(clerkUserId);
    return undefined;
  }
  return entry;
}

export function setUserInCache(
  clerkUserId: string,
  data: Omit<CachedUser, "timestamp">
): void {
  store.set(clerkUserId, { ...data, timestamp: Date.now() });
}

export function invalidateUserCache(clerkUserId: string): void {
  store.delete(clerkUserId);
}

export function clearUserCache(): void {
  store.clear();
}
