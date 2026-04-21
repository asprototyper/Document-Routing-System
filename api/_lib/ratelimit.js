//If you ever need strict global limits, swap this for Upstash
// Redis (@upstash/ratelimit).

const buckets = new Map()

function getIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim()
  return (
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

/**
 * @param {object} req             Vercel/Node request
 * @param {object} opts
 * @param {string} opts.key        Logical bucket name, e.g. 'login'
 * @param {number} opts.limit      Max attempts per window
 * @param {number} opts.windowMs   Window length in ms
 * @returns {{ ok: boolean, remaining: number, retryAfter: number }}
 */
export function rateLimit(req, { key, limit, windowMs }) {
  const ip = getIp(req)
  const id = `${key}:${ip}`
  const now = Date.now()
  const entry = buckets.get(id)

  if (!entry || now >= entry.resetAt) {
    buckets.set(id, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count += 1
  return { ok: true, remaining: limit - entry.count, retryAfter: 0 }
}
