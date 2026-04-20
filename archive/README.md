# Archive

This folder contains stale/legacy files that are **not** used by the live build.
They were preserved here (instead of being deleted) for reference only.

| File | Origin | Replaced by |
|---|---|---|
| `index.html` | Old root-level entry point | `src/index.html` (Vite uses `root: 'src'`) |
| `scripts.js` | Old root-level script | `src/scripts.js` (now split into `src/js/` modules) |

It is safe to delete this folder when no longer needed.
