import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from './_lib/ratelimit.js'

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SHARED_EMAIL,
  SUPABASE_SHARED_PASSWORD,
  PIN_HASH,
} = process.env

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    !SUPABASE_SHARED_EMAIL ||
    !SUPABASE_SHARED_PASSWORD ||
    !PIN_HASH
  ) {
    console.error('login: missing server env vars')
    return res.status(500).json({ error: 'Server is misconfigured.' })
  }

  const limit = rateLimit(req, { key: 'login', limit: 5, windowMs: 15 * 60 * 1000 })
  if (!limit.ok) {
    res.setHeader('Retry-After', String(limit.retryAfter))
    return res.status(429).json({
      error: 'Too many attempts. Try again later.',
      retryAfter: limit.retryAfter,
    })
  }

  const { pin } = readBody(req)
  if (typeof pin !== 'string' || !/^\d{4,8}$/.test(pin)) {
    return res.status(400).json({ error: 'Invalid PIN format.' })
  }

  let pinOk = false
  try {
    pinOk = await bcrypt.compare(pin, PIN_HASH)
  } catch (e) {
    console.error('login: bcrypt error', e)
    return res.status(500).json({ error: 'Auth check failed.' })
  }
  if (!pinOk) return res.status(401).json({ error: 'Incorrect PIN.' })

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.auth.signInWithPassword({
    email: SUPABASE_SHARED_EMAIL,
    password: SUPABASE_SHARED_PASSWORD,
  })

  if (error || !data?.session) {
    console.error('login: shared sign-in failed', error)
    return res.status(500).json({ error: 'Could not establish session.' })
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  })
}
