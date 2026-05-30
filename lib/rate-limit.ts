const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 300_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

export function rateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000) {
  cleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

export function rateLimitIP(request: Request, maxRequests = 10, windowMs = 60000) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
  return rateLimit(`ip:${ip}`, maxRequests, windowMs)
}

export function rateLimitAction(ip: string, action: string, maxRequests = 5, windowMs = 60000) {
  return rateLimit(`action:${ip}:${action}`, maxRequests, windowMs)
}
