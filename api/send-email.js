import nodemailer from 'nodemailer'

// Simple in-memory rate limiter (resets on cold start)
// For production, replace with @upstash/ratelimit or similar
const rateLimitMap = new Map()
const RATE_LIMIT = 10        // max requests
const RATE_WINDOW = 60000    // per 60 seconds (ms)

function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }

  if (entry.count >= RATE_LIMIT) return true

  entry.count++
  return false
}

// Basic email format validation
function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default async function handler(req, res) {
  // Method check
  if (req.method !== 'POST') return res.status(405).end()

  // Authentication — caller must send the API secret
  const authHeader = req.headers['authorization']
  if (!process.env.API_SECRET || authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Rate limiting by IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  // Input validation
  const { to, subject, body } = req.body ?? {}

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' })
  }

  if (!isValidEmail(to)) {
    return res.status(400).json({ error: 'Invalid recipient email address' })
  }

  if (typeof subject !== 'string' || subject.length > 200) {
    return res.status(400).json({ error: 'Subject must be a string under 200 characters' })
  }

  if (typeof body !== 'string' || body.length > 50000) {
    return res.status(400).json({ error: 'Body must be a string under 50,000 characters' })
  }

  // Strip newlines from subject to prevent header injection
  const safeSubject = subject.replace(/[\r\n]/g, ' ')

  // Build transporter
  const port = Number(process.env.SMTP_PORT)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,   // true for port 465, false for 587
    requireTLS: true,       // enforce TLS — don't send over plain connection
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: safeSubject,
      html: body
    })

    res.status(200).json({ ok: true })
  } catch (e) {
    // Log full error internally, never expose it to caller
    console.error('[send-email] SMTP error:', e)
    res.status(500).json({ error: 'Failed to send email. Please try again later.' })
  }
}