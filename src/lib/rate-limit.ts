const requests = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per window

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = requests.get(ip) || [];

  // Remove expired timestamps
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    return false;
  }

  valid.push(now);
  requests.set(ip, valid);
  return true;
}
