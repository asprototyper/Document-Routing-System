import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_ROOT = resolve(__dirname, 'src')

/**
 * Tiny Vite plugin that resolves `<!-- @include('relative/path.html') -->`
 * directives inside index.html. Paths are relative to `src/`.
 *
 * Optional second arg passes template variables that replace `{{name}}`
 * placeholders in the included file:
 *
 *   <!-- @include('partials/header.html', { active: 'tracker' }) -->
 *
 * Includes are resolved recursively so a partial may include other partials.
 */
function htmlPartials() {
  const seen = new Set()
  const INCLUDE_RE =
    /<!--\s*@include\(\s*['"]([^'"]+)['"]\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)\s*-->/g

  function applyVars(html, vars) {
    if (!vars) return html
    return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) =>
      Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m
    )
  }

  function expand(html, fromFile) {
    return html.replace(INCLUDE_RE, (_, rel, varsJson) => {
      const abs = resolve(SRC_ROOT, rel)
      if (seen.has(abs)) {
        throw new Error(
          `Circular @include detected: ${rel} (from ${fromFile})`
        )
      }
      let vars = null
      if (varsJson) {
        // Allow JS-object syntax: convert single quotes -> double, quote keys.
        const jsonish = varsJson
          .replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":')
          .replace(/'([^']*)'/g, '"$1"')
        try {
          vars = JSON.parse(jsonish)
        } catch (e) {
          throw new Error(
            `Invalid @include vars for ${rel}: ${varsJson}\n${e.message}`
          )
        }
      }
      seen.add(abs)
      try {
        const body = applyVars(readFileSync(abs, 'utf8'), vars)
        return expand(body, abs)
      } finally {
        seen.delete(abs)
      }
    })
  }

  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        return expand(html, ctx.filename)
      },
    },
  }
}

/**
 * Dev-only bypass for `/api/login`.
 *
 * In production this file is not executed at runtime — Vercel serves
 * `api/login.js` directly. `apply: 'serve'` also pins this plugin to the
 * Vite dev server, so the bypass cannot leak into a production build.
 *
 * Behavior:
 *   - Skips the PIN bcrypt check entirely (any body is accepted).
 *   - Signs in to Supabase with the shared account from `.env.local`
 *     and returns the same `{ access_token, refresh_token, expires_in }`
 *     shape the real endpoint returns.
 *
 * To disable locally, set `DEV_LOGIN_BYPASS=0` in `.env.local`.
 */
function devLoginBypass(env) {
  const enabled = env.DEV_LOGIN_BYPASS !== '0'
  return {
    name: 'dev-login-bypass',
    apply: 'serve',
    configureServer(server) {
      if (!enabled) return
      server.middlewares.use('/api/login', async (req, res, next) => {
        if (req.method !== 'POST') return next()

        const {
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          SUPABASE_SHARED_EMAIL,
          SUPABASE_SHARED_PASSWORD,
        } = env

        const sendJson = (status, body) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (
          !SUPABASE_URL ||
          !SUPABASE_ANON_KEY ||
          !SUPABASE_SHARED_EMAIL ||
          !SUPABASE_SHARED_PASSWORD
        ) {
          return sendJson(500, {
            error:
              'Dev login bypass: missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SHARED_EMAIL / SUPABASE_SHARED_PASSWORD in .env.local.',
          })
        }

        try {
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          })
          const { data, error } = await supabase.auth.signInWithPassword({
            email: SUPABASE_SHARED_EMAIL,
            password: SUPABASE_SHARED_PASSWORD,
          })
          if (error || !data?.session) {
            console.error('[dev-login-bypass] supabase sign-in failed', error)
            return sendJson(500, {
              error: 'Dev login bypass: could not establish Supabase session.',
            })
          }
          console.log('[dev-login-bypass] issued session (PIN check skipped)')
          return sendJson(200, {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
          })
        } catch (e) {
          console.error('[dev-login-bypass] error', e)
          return sendJson(500, { error: 'Dev login bypass: unexpected error.' })
        }
      })
    },
  }
}

export default defineConfig(({ command, mode }) => {
  // `.env*` files live at the repo root, but Vite's `root` is `src/`, so
  // without overriding `envDir` none of the `VITE_*` vars would reach the
  // client and none of the server-only vars would reach the dev bypass.
  const env = loadEnv(mode, __dirname, '')

  return {
    root: 'src',
    publicDir: '../public',
    envDir: __dirname,
    plugins: [
      htmlPartials(),
      ...(command === 'serve' ? [devLoginBypass(env)] : []),
    ],
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
  }
})
