import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from './_lib/ratelimit.js'
import { EMAIL_TYPES, buildEmail } from './_lib/email-templates.js'

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return {}
}

function getBearerToken(req) {
  const h = req.headers.authorization || req.headers.Authorization
  if (typeof h !== 'string') return null
  const [scheme, token] = h.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token.trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (
    !SUPABASE_URL || !SUPABASE_ANON_KEY ||
    !SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM
  ) {
    console.error('send-email: missing server env vars')
    return res.status(500).json({ error: 'Server is misconfigured.' })
  }

  // ── Auth: require a valid Supabase session JWT ───────────────
  const token = getBearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token.' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session.' })
  }

  // ── Rate limit per IP (separate bucket from login) ───────────
  const limit = rateLimit(req, { key: 'send-email', limit: 20, windowMs: 60 * 60 * 1000 })
  if (!limit.ok) {
    res.setHeader('Retry-After', String(limit.retryAfter))
    return res.status(429).json({
      error: 'Too many emails sent. Try again later.',
      retryAfter: limit.retryAfter,
    })
  }

  // ── Validate payload ─────────────────────────────────────────
  const body = readBody(req)
  const { type, docId } = body

  if (typeof type !== 'string' || !EMAIL_TYPES.has(type)) {
    return res.status(400).json({ error: 'Invalid email type.' })
  }

  let to = ''
  let vars = {}

  if (type === 'verify') {
    // Verification emails are sent before a doc exists (from the Create modal)
    // OR for an existing doc. Accept entity/contact/email from the client,
    // but validate strictly.
    const { entity, contact, email } = body
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid recipient email.' })
    }
    to = email.trim()
    vars = {
      entity: typeof entity === 'string' ? entity.slice(0, 200) : '',
      contact: typeof contact === 'string' ? contact.slice(0, 200) : '',
    }
  } else {
    // Notification emails: must reference an existing, email-verified doc.
    // The JWT in the supabase client makes this query subject to RLS.
    if (typeof docId !== 'string' || !docId) {
      return res.status(400).json({ error: 'Missing docId.' })
    }

    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('id, entity, contact, email, email_verified')
      .eq('id', docId)
      .single()

    if (docErr || !doc) {
      return res.status(404).json({ error: 'Document not found.' })
    }
    if (!doc.email_verified) {
      return res.status(400).json({ error: 'Recipient email is not verified.' })
    }
    if (!doc.email || !EMAIL_RE.test(doc.email)) {
      return res.status(400).json({ error: 'Document has an invalid email address.' })
    }

    to = doc.email
    vars = { entity: doc.entity, contact: doc.contact }
  }

  // ── Build template server-side; client cannot inject HTML ────
  let subject, html
  try {
    ({ subject, html } = buildEmail(type, vars))
  } catch (e) {
    console.error('send-email: template build failed', e)
    return res.status(400).json({ error: 'Could not build email.' })
  }

  // ── Send ─────────────────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  try {
    await transporter.sendMail({ from: SMTP_FROM, to, subject, html })
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('send-email: transport failed', e)
    return res.status(502).json({ error: 'Failed to send email.' })
  }
}
