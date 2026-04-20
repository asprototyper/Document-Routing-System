import { defineConfig } from 'vite'
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

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [htmlPartials()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
