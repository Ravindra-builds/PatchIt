/**
 * Fixed-window, in-memory rate limiter keyed by client identifier.
 *
 * State lives in this server instance's memory, so limits are per instance and reset on restart.
 * For multi-instance or serverless deployments, swap this for a shared store (e.g. Redis).
 */

interface WindowState {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_TRACKED_CLIENTS = 10_000;

const windows = new Map<string, WindowState>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, limitPerWindow: number, now = Date.now()): RateLimitResult {
  let state = windows.get(key);

  if (!state || state.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_CLIENTS) pruneExpired(now);
    state = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(key, state);
  }

  state.count += 1;
  return {
    allowed: state.count <= limitPerWindow,
    retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
  };
}

function pruneExpired(now: number) {
  for (const [key, state] of windows) {
    if (state.resetAt <= now) windows.delete(key);
  }
  // Still full of active clients: drop the oldest entries rather than grow without bound.
  if (windows.size >= MAX_TRACKED_CLIENTS) {
    const excess = windows.size - MAX_TRACKED_CLIENTS + 1;
    for (const key of Array.from(windows.keys()).slice(0, excess)) windows.delete(key);
  }
}

/** Best-effort client identifier from proxy headers. Only trustworthy behind a proxy that sets them. */
export function getClientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Test helper. */
export function resetRateLimits() {
  windows.clear();
}
