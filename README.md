# NTC Document Tracker

Vite + Supabase + Vercel.

---

## Project structure

```
ntc-tracker/
├── public/
│   └── img/               ← your logo files (copy from original)
├── src/
│   ├── lib/
│   │   ├── supabase.js    ← Supabase client (reads env vars)
│   │   └── db.js          ← all DB operations
│   ├── index.html         ← full app HTML (paste your original body)
│   ├── styles.css         ← copy your original styles.css here
│   └── scripts.js         ← refactored app logic
├── supabase/
│   └── schema.sql         ← run once in Supabase SQL editor
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 1 — Supabase setup

1. Create a free project at https://app.supabase.com
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Go to **Project → Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public** key

---

## 2 — Local development

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local

# 3. Fill in your Supabase values in .env.local
#    VITE_SUPABASE_URL=https://xxxx.supabase.co
#    VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Copy your original files into place:
#    - Paste your full <body> content into src/index.html
#    - Copy your styles.css  → src/styles.css
#    - Copy your img/ folder → public/img/
#    - Paste the original renderDetail(), renderSimple(), renderMetrics(),
#      openSummary(), renderDocsPage() and helpers into src/scripts.js
#      (marked with PLACEHOLDER comments)

# 5. Start dev server
npm run dev
```

The app will be at http://localhost:5173

---

## 3 — Completing scripts.js

`src/scripts.js` has two PLACEHOLDER comments. Paste from your original `scripts.js`:

**Placeholder 1** — inside `renderDetail()`:
Paste everything from `let html = \`...\`` through to the
`$('docDetail').querySelectorAll(...)` event listener blocks.
No changes needed — the HTML generation is identical.

**Placeholder 2** — after the modal utils section:
Paste these functions verbatim from the original:
- `renderSimple()`
- `openStampFromSimple()`
- `confirmSimpleP3Merge()`
- `confirmSimpleP3B()`
- `renderMetrics()`
- `openSummary()`
- `renderDocsPage()`
- `docsOpenTracker()`
- `docsPct()`
- `docsStatusInfo()`
- `docsCurrentPhase()`

None of them touch the data layer — they only read `docs[]` and call
action functions, so zero changes required.

---

## 4 — Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts, set framework to "Vite"
```

### Option B — GitHub + Vercel dashboard
1. Push this repo to GitHub
2. Go to https://vercel.com/new → Import your repo
3. Vercel auto-detects Vite — accept defaults
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`  = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

Every `git push` to main auto-deploys.

---

## 5 — Optional: enable Realtime

If you want live updates when multiple people have the app open:

1. In Supabase → **Database → Replication**, enable replication for
   the `documents` and `stages` tables.
2. In `supabase/schema.sql`, uncomment the two lines at the bottom:
   ```sql
   alter publication supabase_realtime add table documents;
   alter publication supabase_realtime add table stages;
   ```
3. In `src/scripts.js`, add to the boot section:
   ```js
   import { subscribeToChanges } from './lib/db.js'
   // After initData():
   subscribeToChanges(async () => {
     docs = await loadAllDocs()
     renderSidebar()
     if (selId) renderDetail()
   })
   ```

---

## Auth model

The app is gated by a 4–8 digit PIN, but the PIN check happens
**on the server**, not in the browser. Flow:

1. User types PIN in the browser.
2. Browser `POST /api/login { pin }`.
3. Server (`api/login.js`) rate-limits by IP, bcrypt-compares against
   `PIN_HASH`, and on success signs in as a **shared Supabase user**
   using credentials stored in server env.
4. Server returns `{ access_token, refresh_token }`.
5. Browser calls `supabase.auth.setSession(...)` → all subsequent
   DB calls are authenticated.
6. RLS policies in `supabase/schema.sql` require an authenticated
   session, so the anon key alone is inert.

### One-time setup

1. **Create the shared app user** in Supabase → Authentication → Users
   → "Add user". Use a throwaway email (e.g. `tracker@ntc.local`) and
   a long random password. This account is what the server signs in
   as; no one logs in with it directly.
2. **Generate a PIN hash** locally:
   ```bash
   npm run hash-pin 1234
   ```
   Copy the printed `PIN_HASH=...` line.
3. **Set Vercel env vars** (Project → Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL` (same value, no VITE_ prefix)
   - `SUPABASE_ANON_KEY` (same value, no VITE_ prefix)
   - `SUPABASE_SHARED_EMAIL`
   - `SUPABASE_SHARED_PASSWORD`
   - `PIN_HASH`
   - (existing SMTP_* vars for `/api/send-email`)
4. **Re-run `supabase/schema.sql`** in the SQL editor to apply the
   new `authenticated`-only RLS policies.

### Rotating the PIN

1. `npm run hash-pin <new-pin>`
2. Paste the new `PIN_HASH` into Vercel env → save → redeploy.

### Notes

- If you want per-user audit (who stamped what), replace the shared
  account with real Supabase Auth users and update policies to use
  `auth.uid()`.

- **No seed data** is loaded in production. The original `makeSeed()`
  function is removed. If you need test data, run the INSERT statements
  manually in the Supabase SQL editor.

- **Redacted stages** are permanently deleted from the `stages` table.
  A record is preserved in `audit_log` with the previous value as JSONB.
