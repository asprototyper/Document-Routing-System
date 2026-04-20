/* ══════════════════════════════════════════════
   HELPERS — small DOM / formatting / time utils
   ══════════════════════════════════════════════ */

export const $ = (id) => document.getElementById(id);

export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const genId = () => crypto.randomUUID();

export const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-PH", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

export const nowLocal = () => {
  const n = new Date();
  n.setSeconds(0, 0);
  return new Date(n - n.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function setLoading(on, msg = "Saving…") {
  let el = document.getElementById("globalLoader");
  if (!el) {
    el = document.createElement("div");
    el.id = "globalLoader";
    el.style.cssText = `position:fixed;bottom:70px;right:22px;background:var(--s1);
      border:1px solid var(--b1);border-radius:6px;padding:10px 16px;
      font-size:13px;color:var(--muted);z-index:600;opacity:0;
      transition:opacity .2s;pointer-events:none;font-family:"DM Mono",monospace`;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = on ? "1" : "0";
}

export function toast(msg, err = false) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast" + (err ? " terr" : "");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

/**
 * Working-hours elapsed milliseconds between two ISO timestamps.
 * Counts only Mon–Fri 08:00–17:00 local time.
 */
export function workMs(a, b) {
  if (!a || !b) return 0;
  let s = new Date(a),
    e = new Date(b),
    ms = 0;
  if (e <= s) return 0;
  let c = new Date(s);
  while (c < e) {
    const d = c.getDay();
    if (d >= 1 && d <= 5) {
      const ws = new Date(c);
      ws.setHours(8, 0, 0, 0);
      const we = new Date(c);
      we.setHours(17, 0, 0, 0);
      const ss = c < ws ? ws : c,
        se = e < we ? e : we;
      if (se > ss) ms += se - ss;
    }
    c = new Date(c);
    c.setHours(0, 0, 0, 0);
    c.setDate(c.getDate() + 1);
  }
  return ms;
}
