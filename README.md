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

## Notes

- **PIN** remains client-side (`'0723'`). Supabase RLS is set to allow
  all anon operations — the PIN gates the UI, not the database.
  If you ever need per-user access control, add Supabase Auth and
  update the RLS policies in `schema.sql`.

- **No seed data** is loaded in production. The original `makeSeed()`
  function is removed. If you need test data, run the INSERT statements
  manually in the Supabase SQL editor.

- **Redacted stages** are permanently deleted from the `stages` table.
  A record is preserved in `audit_log` with the previous value as JSONB.
