import { DualSyncResponse } from '@/types/domain';

interface LockRecord {
  timestamp: number;
  status: 'pending' | 'completed';
  result?: DualSyncResponse;
}

const lockCache = new Map<string, LockRecord>();
const DEFAULT_TTL_MS = 10_000; // 10 seconds

/**
 * Periodically purge stale locks older than TTL
 */
function cleanStaleLocks(): void {
  const now = Date.now();
  for (const [key, record] of lockCache.entries()) {
    if (now - record.timestamp > DEFAULT_TTL_MS) {
      lockCache.delete(key);
    }
  }
}

/**
 * Checks if a transaction with the given key is currently in-flight or recently completed
 */
export function checkTransactionLock(key: string): {
  isLocked: boolean;
  status?: 'pending' | 'completed';
  cachedResult?: DualSyncResponse;
} {
  cleanStaleLocks();
  const existing = lockCache.get(key);
  if (!existing) {
    return { isLocked: false };
  }

  return {
    isLocked: true,
    status: existing.status,
    cachedResult: existing.result,
  };
}

/**
 * Acquires an in-flight lock for the given key.
 * Returns true if lock was acquired, false if already locked.
 */
export function acquireTransactionLock(key: string): boolean {
  cleanStaleLocks();
  const existing = lockCache.get(key);
  if (existing) {
    return false;
  }

  lockCache.set(key, {
    timestamp: Date.now(),
    status: 'pending',
  });
  return true;
}

/**
 * Marks transaction completed and caches the result for idempotency deduplication
 */
export function completeTransactionLock(key: string, result: DualSyncResponse): void {
  lockCache.set(key, {
    timestamp: Date.now(),
    status: 'completed',
    result,
  });
}

/**
 * Releases the lock (in case of failure or cancellation)
 */
export function releaseTransactionLock(key: string): void {
  lockCache.delete(key);
}

/**
 * Resets all in-memory locks (primarily for unit and regression testing)
 */
export function clearAllLocks(): void {
  lockCache.clear();
}
