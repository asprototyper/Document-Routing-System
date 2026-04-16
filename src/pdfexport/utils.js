const LOCALE = "en-PH";

const DATE_TIME_FMT = new Intl.DateTimeFormat(LOCALE, {
  month: "short", day: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", hour12: true,
});

const DATE_FMT = new Intl.DateTimeFormat(LOCALE, {
  month: "short", day: "2-digit", year: "numeric",
});

const LONG_DATE_TIME_FMT = new Intl.DateTimeFormat(LOCALE, {
  year: "numeric", month: "long", day: "numeric",
  hour: "2-digit", minute: "2-digit", hour12: true,
});

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function fmtTs(iso) {
  const date = parseDate(iso);
  return date ? DATE_TIME_FMT.format(date) : "—";
}

export function fmtDate(iso) {
  const date = parseDate(iso);
  return date ? DATE_FMT.format(date) : "—";
}

export function nowLongTs() {
  return LONG_DATE_TIME_FMT.format(new Date());
}

export function durStr(ms) {
  if (!ms || ms <= 0) return "—";
  const m = Math.round(ms / 60000);
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}m`;
}

export function workMs(a, b) {
  const s = parseDate(a);
  const e = parseDate(b);
  let ms = 0;
  if (!s || !e || e <= s) return 0;

  let c = new Date(s);
  while (c < e) {
    const d = c.getDay();
    if (d >= 1 && d <= 5) {
      const ws = new Date(c);
      ws.setHours(8, 0, 0, 0);
      const we = new Date(c);
      we.setHours(17, 0, 0, 0);
      const ss = c < ws ? ws : c;
      const se = e < we ? e : we;
      if (se > ss) ms += se - ss;
    }
    c = new Date(c);
    c.setHours(0, 0, 0, 0);
    c.setDate(c.getDate() + 1);
  }
  return ms;
}

export function cap(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function clean(str) {
  return String(str || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function safeFilePart(value, fallback = "document") {
  const cleaned = String(value ?? "").trim().replace(/[^a-z0-9]/gi, "_");
  return cleaned || fallback;
}
