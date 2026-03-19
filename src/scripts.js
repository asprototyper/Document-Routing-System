import {
  loadAllDocs,
  createDoc,
  updateDoc,
  stampStage,
  redactStage,
  redactTsField,
  deleteDoc,
} from "./lib/db.js";

/* ══════════════════════════════════════════════
   THEMES
══════════════════════════════════════════════ */
const THEMES = {
  dark: {
    "--bg": "#0f0e0c",
    "--s1": "#1a1916",
    "--s2": "#242220",
    "--s3": "#2e2b27",
    "--b1": "#2e2c29",
    "--b2": "#3a3835",
    "--red": "#c0392b",
    "--red-h": "#a93226",
    "--red-soft": "rgba(192,57,43,.09)",
    "--blue": "#2563a8",
    "--blue-h": "#1d4f8a",
    "--blue-soft": "rgba(37,99,168,.09)",
    "--green": "#1a7a4a",
    "--green-soft": "rgba(26,122,74,.09)",
    "--warn": "#b45309",
    "--text": "#e8e4dc",
    "--muted": "#7a766e",
    "--dim": "#4a4742",
  },
  light: {
    "--bg": "#f5f3f0",
    "--s1": "#ffffff",
    "--s2": "#f0ece8",
    "--s3": "#e8e3dd",
    "--b1": "#ddd8d2",
    "--b2": "#c8c2bb",
    "--red": "#b32208",
    "--red-h": "#8f1a06",
    "--red-soft": "rgba(179,34,8,.08)",
    "--blue": "#1a4f9c",
    "--blue-h": "#143d7a",
    "--blue-soft": "rgba(26,79,156,.08)",
    "--green": "#145c35",
    "--green-soft": "rgba(20,92,53,.08)",
    "--warn": "#92560a",
    "--text": "#1c1208",
    "--muted": "#5a4e42",
    "--dim": "#9a8f84",
  },
  slate: {
    "--bg": "#0d1117",
    "--s1": "#161b22",
    "--s2": "#1c2128",
    "--s3": "#222830",
    "--b1": "#21262d",
    "--b2": "#30363d",
    "--red": "#f85149",
    "--red-h": "#da3633",
    "--red-soft": "rgba(248,81,73,.09)",
    "--blue": "#388bfd",
    "--blue-h": "#1f6feb",
    "--blue-soft": "rgba(56,139,253,.09)",
    "--green": "#3fb950",
    "--green-soft": "rgba(63,185,80,.09)",
    "--warn": "#d29922",
    "--text": "#e6edf3",
    "--muted": "#8b949e",
    "--dim": "#484f58",
  },
  warm: {
    "--bg": "#1a1410",
    "--s1": "#231d18",
    "--s2": "#2d2520",
    "--s3": "#372e27",
    "--b1": "#3d342c",
    "--b2": "#4d4238",
    "--red": "#e05c2a",
    "--red-h": "#c44d21",
    "--red-soft": "rgba(224,92,42,.09)",
    "--blue": "#5b8dd9",
    "--blue-h": "#4a7bc8",
    "--blue-soft": "rgba(91,141,217,.09)",
    "--green": "#5a9e6f",
    "--green-soft": "rgba(90,158,111,.09)",
    "--warn": "#d4a017",
    "--text": "#f0e6d8",
    "--muted": "#8a7a6a",
    "--dim": "#5a4a3a",
  },
};

const LOGOS = {
  dark: "img/ntc-logo-dark.png",
  light: "img/ntc-logo-light.png",
  slate: "img/ntc-logo-slate.png",
  warm: "img/ntc-logo-warm.png",
};
const LOGOS2 = {
  dark: "img/ntc-logo2-dark.png",
  light: "img/ntc-logo2-light.png",
  slate: "img/ntc-logo2-slate.png",
  warm: "img/ntc-logo2-warm.png",
};

function applyTheme(name) {
  const t = THEMES[name] || THEMES.light;
  const root = document.documentElement.style;
  Object.entries(t).forEach(([k, v]) => root.setProperty(k, v));
  document
    .querySelectorAll(".theme-btn")
    .forEach((b) => b.classList.toggle("on", b.dataset.theme === name));
  const pinlogo = document.getElementById("pinlogo");
  if (pinlogo && LOGOS2[name]) pinlogo.src = LOGOS2[name];

  const logo = document.getElementById("logo");
  if (logo && LOGOS[name]) logo.src = LOGOS[name];

  const logo2 = document.getElementById("logo2");
  if (logo2 && LOGOS2[name]) logo2.src = LOGOS2[name];

  const logo3 = document.getElementById("logo3");
  if (logo3 && LOGOS2[name]) logo3.src = LOGOS2[name];

  const logo4 = document.getElementById("logo4");
  if (logo4 && LOGOS2[name]) logo4.src = LOGOS2[name];
  document.cookie = `theme=${name};max-age=31536000;path=/`;
}
function loadThemeCookie() {
  const m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
  return m ? m[1] : "light";
}
const _themeOrder = ["light", "dark", "slate", "warm"];
function cycleTheme() {
  const cur = document.querySelector(".theme-btn.on")?.dataset.theme || "light";
  const next = _themeOrder[(_themeOrder.indexOf(cur) + 1) % _themeOrder.length];
  applyTheme(next);
}

/* ══════════════════════════════════════════════
   FONTS
══════════════════════════════════════════════ */
const FONTS = {
  modern:    { body: "Helvetica, Arial, sans-serif",     heading: "Helvetica, Arial, sans-serif" },
  classic:   { body: "'EB Garamond', Georgia, serif",    heading: "'EB Garamond', Georgia, serif" },
  technical: { body: "'DM Mono', monospace",             heading: "'Fraunces', serif" },
};

function applyFont(name) {
  const f = FONTS[name] || FONTS.technical;
  document.documentElement.style.setProperty("--font-body", f.body);
  document.documentElement.style.setProperty("--font-heading", f.heading);
  document.body.style.fontFamily = f.body;
  document.querySelectorAll(".font-opt").forEach((el) =>
    el.classList.toggle("on", el.id === "font-" + name)
  );
  document.cookie = `font=${name};max-age=31536000;path=/`;
}

function loadFontCookie() {
  const m = document.cookie.match(/(?:^|; )font=([^;]*)/);
  return m ? m[1] : "technical";
}

function openSettings() {
  openOv("ov-settings");
}

/* ══════════════════════════════════════════════
   STAGE DEFINITIONS
══════════════════════════════════════════════ */
const PHASE1A = [
  {
    key: "p1a_eng_accept",
    label: "Accept Application and Provide copy to the Client",
    hint: "Engineer",
  },
];
const PHASE2 = [
  {
    key: "p2_cdo_scan",
    label: "Record Acceptance and Scan Documents",
    hint: "CDO II",
  },
  {
    key: "p2_cdo_route",
    label: "Route Application",
    hint: "CDO II — unlocks Phase 3",
  },
];
const PHASE1B = [
  {
    key: "p1b_return",
    label: "Return Application — Record Date & Stamp; Time Returned",
    hint: "Stamp the exact date and time the application was returned to the applicant.",
  },
];
const PHASE3_LEGAL = [
  {
    key: "p3_legal_recv",
    label: "Received by Legal Branch",
    hint: "For legal evaluation and findings",
  },
  { key: "p3_legal_back", label: "Received from Legal Branch", hint: "" },
];
const PHASE3_TECH = [
  {
    key: "p3_tech_recv",
    label: "Received by SID — Technical",
    hint: "For technical evaluation and findings",
  },
  { key: "p3_tech_back", label: "Received from SID", hint: "Technical track" },
];
const PHASE3_FIN = [
  {
    key: "p3_fin_recv",
    label: "Received by SID — Financial",
    hint: "For financial evaluation and findings",
  },
  { key: "p3_fin_back", label: "Received from SID", hint: "Financial track" },
];
const PHASE3A = [
  {
    key: "p3a_endorse",
    label: "Application Endorsed to SID",
    hint: "All compliant — no NOD",
  },
];
const PHASE3B = [
  { key: "p3b_nod", label: "Notice of Deficiency Issued", hint: "" },
  { key: "p3b_endorse", label: "Application and Nod endorsed to SID", hint: "" },
];
const PHASE4A = [
  {
    key: "p4a_cdo_accept",
    label: "Record Receipt of Documents",
    hint: "CDO II",
  },

  
  {
    key: "p4a_eng_briefer",
    label: "Received by Engineer — Briefer prep & Stamp; Certificate drafting",
    hint: "Engineer",
  },
  {
    key: "p4a_chief_review",
    label: "Received by Chief-SID for Review",
    hint: "Chief-SID",
  },
  {
    key: "p4a_dir_rec",
    label: "Received by Director-RB — Recommendation",
    hint: "Director-RB",
  },
  { key: "p4a_odc", label: "Received by ODC", hint: "", isApproval: true },
];

const PHASE4B = [
  { key: "p4b_cdo_accept", label: "Record Receipt of Documents", hint: "CDO II" },
];
const PHASE5 = [
  {
    key: "p5_receipt",
    label: "Record Receipt of Approval/Disapproval",
    hint: "CDO II",
    isCertDecision: true,
  },
];
const PHASE5A = [
  {
    key: "p5a_eng_soa",
    label: "Received by Engineer — Prepare SOA",
    hint: "Engineer",
  },
  {
    key: "p5a_chief_soa",
    label: "Received by Chief-SID — Review SOA",
    hint: "Chief-SID",
  },
  {
    key: "p5a_dir_soa",
    label: "Received by Director-RB — Approval of SOA",
    hint: "Director-RB",
  },
];
const PHASE5B = [
  {
    key: "p5b_chief_nod",
    label: "Received by Chief-SID — Draft Notice of Disapproval",
    hint: "Chief-SID",
  },
  {
    key: "p5b_dir_review",
    label: "Received by Director-RB — Review Notice",
    hint: "Director-RB",
  },
  {
    key: "p5b_odc_issue",
    label: "Received by ODC — Issue Notice of Disapproval",
    hint: "ODC",
  },
];
const PHASE6A = [
  {
    key: "p6a_recv_dir",
    label: "Received Application from Director-RB",
    hint: "CDO II",
  },
];
const PHASE6B = [
  {
    key: "p6b_recv_odc",
    label: "Received Application from ODC",
    hint: "CDO II",
  },
];
const PHASE7 = [{ key: "p7_payment", label: "Payment Stage", hint: "Client" }];
const PHASE8 = [
  {
    key: "p8_recv_client",
    label: "Received Application from Client",
    hint: "CDO II",
  },
  {
    key: "p8_release",
    label: "Release Certificate to Applicant",
    hint: "CDO II",
  },
  {
    key: "p8_scan",
    label: "Record Release and Scan Documents",
    hint: "CDO II",
  },
];

const ALL_STAGES = [
  ...PHASE1A,
  ...PHASE1B,
  ...PHASE2,
  ...PHASE3_LEGAL,
  ...PHASE3_TECH,
  ...PHASE3_FIN,
  ...PHASE3A,
  ...PHASE3B,
  ...PHASE4A,
  ...PHASE4B,
  ...PHASE5,
  ...PHASE5A,
  ...PHASE5B,
  ...PHASE6A,
  ...PHASE6B,
  ...PHASE7,
  ...PHASE8,
];

const TRACK_MAP = {
  p1a: PHASE1A,
  p1b: PHASE1B,
  p2: PHASE2,
  p3_legal: PHASE3_LEGAL,
  p3_tech: PHASE3_TECH,
  p3_fin: PHASE3_FIN,
  p3a: PHASE3A,
  p3b: PHASE3B,
  p4a: PHASE4A,
  p4b: PHASE4B,
  p5: PHASE5,
  p5a: PHASE5A,
  p5b: PHASE5B,
  p6a: PHASE6A,
  p6b: PHASE6B,
  p7: PHASE7,
  p8: PHASE8,
};

/* ══════════════════════════════════════════════
   APP STATE
══════════════════════════════════════════════ */
let docs = [];
let selId = null;
let stampCtx = null,
  tsCtx = null;
let paPick = null,
  apprPick = null;
let paDocId = null,
  paInlineDt = null;
let apprDocId = null;
let redactCtx = null;
let docsDeleteTarget = null,
  docsPinEntry = "";
let docsSearch = "",
  docsSort = "created_desc",
  docsFilter = "all";

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s)
    .replace(/&/g, "& Stamp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const genId = () => crypto.randomUUID();
const fmt = (iso) =>
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
const nowLocal = () => {
  const n = new Date();
  n.setSeconds(0, 0);
  return new Date(n - n.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function setLoading(on, msg = "Saving…") {
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

function toast(msg, err = false) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast" + (err ? " terr" : "");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function workMs(a, b) {
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

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
async function initData() {
  setLoading(true, "Loading documents…");
  try {
    docs = await loadAllDocs();
  } catch (e) {
    console.error("Failed to load documents:", e);
    toast("Could not load documents. Check your connection.", true);
    docs = [];
  } finally {
    setLoading(false);
  }
  renderSidebar();
}

/* ══════════════════════════════════════════════
   PIN
══════════════════════════════════════════════ */
const PIN = import.meta.env.VITE_APP_PIN;
let pin = "";

document.querySelectorAll(".pin-key").forEach((k) => {
  k.addEventListener("click", () => {
    const v = k.dataset.v;
    if (v === "del") pin = pin.slice(0, -1);
    else if (pin.length < 4) pin += v;
    syncDots();
    if (pin.length === 4) checkPin();
  });
});
document.addEventListener("keydown", (e) => {
  if ($("pg-pin").classList.contains("active")) {
    if (e.key >= "0" && e.key <= "9" && pin.length < 4) {
      pin += e.key;
      syncDots();
      if (pin.length === 4) checkPin();
    } else if (e.key === "Backspace") {
      pin = pin.slice(0, -1);
      syncDots();
    }
  }
  if (e.key === "Escape")
    document.querySelectorAll(".overlay.open").forEach((el) => closeOv(el.id));
});

function syncDots() {
  document.querySelectorAll(".pin-dot").forEach((d, i) => {
    d.classList.toggle("filled", i < pin.length);
    d.classList.remove("shake");
  });
}
function checkPin() {
  if (pin === PIN) {
    $("pinErr").textContent = "";
    setTimeout(() => goTo("tracker"), 200);
  } else {
    document
      .querySelectorAll(".pin-dot")
      .forEach((d) => d.classList.add("shake"));
    $("pinErr").textContent = "Incorrect PIN — try again.";
    setTimeout(() => {
      pin = "";
      syncDots();
    }, 700);
  }
}
function doLock() {
  const sb = document.querySelector(".sidebar");
  if (sb) sb.classList.remove("open");
  const mp = document.querySelector(".main-panel");
  if (mp) mp.classList.remove("sb-open");
  const bd = $("sbBackdrop");
  if (bd) bd.classList.remove("open");
  const mn = $("mobileNav");
  if (mn) mn.style.display = "none";
  pin = "";
  syncDots();
  $("pinErr").textContent = "";
  goTo("pin");
}

/* ══════════════════════════════════════════════
   PAGE NAV
══════════════════════════════════════════════ */
function goTo(name) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  $("pg-" + name).classList.add("active");
  document
    .querySelectorAll(".nav-pill")
    .forEach((b) =>
      b.classList.toggle("on", b.textContent.trim().toLowerCase() === name),
    );
  ["tracker", "metrics", "simple", "documents"].forEach((p) => {
    const btn = $("mn-" + p);
    if (btn) btn.classList.toggle("on", p === name);
  });
  const sb = document.querySelector(".sidebar");
  if (sb)
    if (["pin", "documents", "metrics", "simple"].includes(name)) {
      sb.classList.remove("open");
      const mp = document.querySelector(".main-panel");
      if (mp) mp.classList.remove("sb-open");
    }
  const mn = $("mobileNav");
  if (mn) mn.style.display = name === "pin" ? "none" : "flex";
  if (name === "metrics") renderMetrics();
  if (name === "tracker") { renderSidebar(); openSidebar(); }
  if (name === "documents") renderDocsPage();
  if (name === "simple") renderSimple();
}

/* ══════════════════════════════════════════════
   DOC STATUS
══════════════════════════════════════════════ */
function isComplete(doc) {
  return !!doc.stages["p8_scan"];
}
function isClosed(doc) {
  const p1bClosed = doc.preassess === "incomplete" && !!doc.stages["p1b_return"];
  const p4bClosed = (doc.nod_legal || doc.nod_tech || doc.nod_fin) && !!doc.p3b_notif_ts && !!doc.p3b_return_ts;
  const p6bClosed = doc.certOutcome === "disapproved" && !!doc.p6b_notif_ts && !!doc.p6b_return_ts;
  return p1bClosed || p4bClosed || p6bClosed;
}
function docBadge(doc) {
  if (isComplete(doc))
    return `<span class="badge bdg-complete">Complete</span>`;
  if (isClosed(doc)) return `<span class="badge bdg-closed">Closed</span>`;
  if (!doc.preassess) return `<span class="badge bdg-prog">Pending</span>`;
  return `<span class="badge bdg-prog">In Progress</span>`;
}
function lastLabel(doc) {
  if (isComplete(doc)) return "✓ Certificate Released";
  if (isClosed(doc)) {
    if (doc.preassess === "incomplete" && doc.stages["p1b_return"])
      return "Closed — Application Returned (Phase 1B)";
    if (doc.p6b_return_ts) return "Closed — Disapproved & Returned";
    if (doc.p3b_return_ts) return "Closed — NOD Returned";
  }
  for (let i = ALL_STAGES.length - 1; i >= 0; i--)
    if (doc.stages[ALL_STAGES[i].key]) return ALL_STAGES[i].label;
  if (doc.preassess) return `Pre-Assessment: ${doc.preassess}`;
  return "Awaiting Pre-Assessment";
}

/* ══════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════ */
function renderSidebar() {
  const q = $("sbSearch").value.trim().toLowerCase();
  const list = q
    ? docs.filter((d) => d.entity.toLowerCase().includes(q))
    : docs;
  $("docCount").textContent = docs.length;
  const el = $("docList");
  if (!list.length) {
    el.innerHTML = `<div class="sb-empty"><div class="sb-empty-ic">⬡</div>${
      docs.length
        ? "No matches."
        : "No documents yet.<br>Create one to get started."
    }</div>`;
    return;
  }
  el.innerHTML = list
    .map(
      (d) => `
    <div class="doc-item${d.id === selId ? " sel" : ""}" data-id="${d.id}">
      <div class="di-top"><span class="di-name">${esc(d.entity)}</span>${docBadge(d)}</div>
      <div class="di-sub">Contact: ${esc(d.contact)} · ${fmt(d.createdAt).split(",")[0]}</div>
      <div class="di-mid">
        <span class="di-phase">${docsCurrentPhase(d)}</span>
        ${!isClosed(d) && !isComplete(d) ? `<span class="di-pct">${docsPct(d)}%</span>` : ""}
      </div>
      <div class="di-bot"><span class="di-stage">↳ ${lastLabel(d)}</span></div>
    </div>`,
    )
    .join("");
  el.querySelectorAll(".doc-item").forEach((el) =>
    el.addEventListener("click", () => selDoc(el.dataset.id)),
  );
}
$("sbSearch").addEventListener("input", renderSidebar);

/* ══════════════════════════════════════════════
   DETAIL
══════════════════════════════════════════════ */
function selDoc(id) {
  selId = id;
  renderSidebar();
  $("emptyView").style.display = "none";
  $("docDetail").classList.add("vis");
  renderDetail();
}

function buildRows(defs, doc, trackKey, locked) {
  const nextIdx = locked ? -1 : defs.findIndex((s) => !doc.stages[s.key]);
  return defs
    .map((s, i) => {
      const done = !!doc.stages[s.key];
      const isNxt = !locked && i === nextIdx;
      const sd = doc.stages[s.key];
      const ts = sd?.stampedAt || null;
      const sub = sd?.passedBy
        ? `<div class="sr-sub">By: ${esc(sd.passedBy)}</div>`
        : sd?.sentBy
          ? `<div class="sr-sub">CDO II: ${esc(sd.sentBy)}</div>`
          : "";
      const cls = done ? "done" : isNxt ? "nxt" : "";
      let right;
      if (done)
        right = _isLastStage(s.key)
          ? `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
            <span class="sr-ts">${fmt(ts)}</span>
            <button class="redact-btn" data-doc="${doc.id}" data-key="${s.key}"
              data-label="${s.label.replace(/"/g, "&quot;")}" data-ts="${fmt(ts)}">Redact</button>
           </div>`
          : `<span class="sr-ts">${fmt(ts)}</span>`;
      else if (isNxt && !isClosed(doc) && !isComplete(doc)) {
        if (s.isApproval)
          right = `<button class="stmp" data-doc="${doc.id}" data-track="${trackKey}" data-idx="${i}">Stamp</button>`;
        else if (s.isCertDecision)
          right = `<button class="stmp" data-doc="${doc.id}" data-track="cert_decision" data-idx="0">Record</button>`;
        else
          right = `<button class="stmp" data-doc="${doc.id}" data-track="${trackKey}" data-idx="${i}">Stamp</button>`;
      } else right = `<span class="sr-ts empty">—</span>`;
      return `<div class="sr ${cls}">
      <div class="sr-dot-col"><div class="sr-dot"></div><div class="sr-line"></div></div>
      <div><div class="sr-name">${s.label}</div>${s.hint ? `<div class="sr-hint">${s.hint}</div>` : ""}${sub}</div>
      <div class="sr-right">${right}</div>
    </div>`;
    })
    .join("");
}

function tsBtn(field, label, docId, locked) {
  const doc = docs.find((d) => d.id === docId);
  if (!doc) return "";
  const val = doc[field];
  if (val)
    return _isLastTs(field)
      ? `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
          <span class="ts-done">✓ ${fmt(val)}</span>
          <button class="ts-redact-btn" data-field="${field}" data-doc="${docId}"
            data-label="${label}" data-ts="${fmt(val)}">Redact</button>
         </div>`
      : `<span class="ts-done">✓ ${fmt(val)}</span>`;
  if (locked) return `<button class="stmp" disabled>Stamp</button>`;
  return `<button class="stmp" onclick="openTsModal('${field}','${label}','${docId}')">Record Timestamp</button>`;
}

let _isLastStage = () => false;
let _isLastTs = () => false;

function renderDetail() {
  const doc = docs.find((d) => d.id === selId);
  if (!doc) return;

function countPathStages(doc) {
  const pa = doc.preassess, path = [];
  path.push(...PHASE1A);
  if (pa === "incomplete") path.push(...PHASE1B);
  else if (pa === "complete") {
    path.push(...PHASE2, ...PHASE3_LEGAL, ...PHASE3_TECH, ...PHASE3_FIN);
    if (doc.nod_legal || doc.nod_tech || doc.nod_fin) {
      // Path B — NOD → dead end
      path.push(...PHASE3B, ...PHASE4B);
    } else if (doc.p3decision === "compliant") {
      // Path A — compliant → certificate
      path.push(...PHASE3A, ...PHASE4A, ...PHASE5);
      if (doc.certOutcome === "approved")
        path.push(...PHASE5A, ...PHASE6A, ...PHASE7, ...PHASE8);
      else if (doc.certOutcome === "disapproved")
        path.push(...PHASE5B, ...PHASE6B);
    }
  }
  return path;
}
  const pathStages = countPathStages(doc);
  const totalStampable = Math.max(pathStages.length, 1);
  const doneCount = pathStages.filter((s) => doc.stages[s.key]).length;
  const pct = Math.round((doneCount / totalStampable) * 100);

  const lastStampedKey = (() => {
    let last = null;
    for (const s of ALL_STAGES) if (doc.stages[s.key]) last = s.key;
    const tsFields = [
      "p3b_notif_ts",
      "p3b_return_ts",
      "p6a_notif_ts",
      "p6b_notif_ts",
      "p6b_return_ts",
    ];
    let lastTs = null,
      lastTsTime = null;
    tsFields.forEach((f) => {
      if (doc[f]) {
        const t = new Date(doc[f]);
        if (!lastTsTime || t > lastTsTime) {
          lastTsTime = t;
          lastTs = f;
        }
      }
    });
    const lastStageTime =
      last && doc.stages[last] ? new Date(doc.stages[last].stampedAt) : null;
    if (lastTs && (!lastStageTime || lastTsTime > lastStageTime))
      return { type: "ts", key: lastTs };
    if (last) return { type: "stage", key: last };
    return null;
  })();
  _isLastStage = (key) =>
    lastStampedKey?.type === "stage" && lastStampedKey.key === key;
  _isLastTs = (field) =>
    lastStampedKey?.type === "ts" && lastStampedKey.key === field;

  const pa = doc.preassess;
  const p1aDone = !!doc.stages["p1a_eng_accept"];
  const p2Done = PHASE2.every((s) => doc.stages[s.key]);
  const legalDone = PHASE3_LEGAL.every((s) => doc.stages[s.key]);
  const techDone = PHASE3_TECH.every((s) => doc.stages[s.key]);
  const finDone = PHASE3_FIN.every((s) => doc.stages[s.key]);
  const allP3Done = legalDone && techDone && finDone;
  const anyNOD = doc.nod_legal || doc.nod_tech || doc.nod_fin;
  const p3DecisionSet = doc.p3decision !== undefined && doc.p3decision !== null;
  const onP3A = allP3Done && p3DecisionSet && doc.p3decision === "compliant";
  const onP3B = allP3Done && anyNOD;
  const p3aDone = onP3A && PHASE3A.every((s) => doc.stages[s.key]);
  const p3bDone = onP3B && PHASE3B.every((s) => doc.stages[s.key]);
  const p4Unlocked = p3aDone || p3bDone;
  const p4aDone = p4Unlocked && PHASE4A.every((s) => doc.stages[s.key]);
  const certDecSet = !!doc.certOutcome;
  const onP5A = certDecSet && doc.certOutcome === "approved";
  const onP5B = certDecSet && doc.certOutcome === "disapproved";
  const p5aDone = onP5A && PHASE5A.every((s) => doc.stages[s.key]);
  const p5bDone = onP5B && PHASE5B.every((s) => doc.stages[s.key]);
  const p6aUnlocked = p5aDone;
  const p6bUnlocked = p5bDone;
  const p6aDone = p6aUnlocked && PHASE6A.every((s) => doc.stages[s.key]);
  const p7Unlocked = p6aDone && !!doc.p6a_notif_ts;

  const emailVal = doc.emailVerified
    ? `<span class="ic-val ok">✓ ${esc(doc.email)}</span>`
    : `<span class="ic-val pending">${esc(doc.email)}</span>`;

  let html = `
    <div class="det-head">
      <button class="det-back btn btn-ghost btn-xs" onclick="closeSidebar();selDoc(null)" style="margin-bottom:6px">← Back</button>
      <div class="det-head-row">
        <div>
          <div class="det-entity">${esc(doc.entity)}</div>
          <div class="det-meta"><span class="det-meta-i">Created ${fmt(doc.createdAt)}</span></div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="openSummary('${doc.id}')">⬡ Summary</button>
      </div>
      <div class="info-cards">
        <div class="ic"><div class="ic-lbl">Entity Name</div><div class="ic-val">${esc(doc.entity)}</div></div>
        <div class="ic"><div class="ic-lbl">Contact Person</div><div class="ic-val">${esc(doc.contact)}</div></div>
       <div class="ic"><div class="ic-lbl">Email</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
            ${emailVal}
            ${!doc.emailVerified ? `<button class="btn btn-ghost btn-xs" onclick="markEmailVerified('${doc.id}')">✉ Verify</button>` : ""}
          </div>
        </div>
        <div class="ic"><div class="ic-lbl">Remarks</div><div class="ic-val">${doc.remarks || '<span style="color:var(--dim);font-style:italic">None</span>'}</div></div>
        <div class="ic"><div class="ic-lbl">Progress</div><div class="ic-val">${isClosed(doc) ? '<span style="color:var(--muted)">inc</span>' : pct + "%"}</div></div>
      </div>
    </div>
    <div class="det-body">
      <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>`;

  /* ── PHASE 1 ── */
  html += `<div class="ph-hd">Phase 1 — Pre-Assessment & Stamp; Receive Application</div>`;
  if (!pa) {
    html += `<div class="dec-box">
      <div class="dec-title">Pre-Assessment — record timestamp and result</div>
      <div class="fg" style="margin-bottom:10px">
        <div class="fl">Date & Stamp; Time <span class="req">*</span></div>
        <input type="datetime-local" id="pa-inline-dt" class="fi" value="${nowLocal()}" style="max-width:260px">
      </div>
      <div class="preassess-grid" style="max-width:320px">
        <div class="pa-opt" id="det-pa-complete" onclick="openPA('${doc.id}')"><div class="pa-lbl a">Complete</div><div class="appr-desc">→ Phase 1A</div></div>
        <div class="pa-opt" id="det-pa-incomplete" onclick="openPA('${doc.id}')"><div class="pa-lbl b">Incomplete</div><div class="appr-desc">→ Phase 1B</div></div>
      </div>
    </div>`;
  } else {
    html += `<div class="dec-box" style="border-color:${pa === "complete" ? "rgba(126,184,154,.3)" : "rgba(201,107,90,.3)"};margin-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div>
          <div class="dec-title" style="margin-bottom:4px">Pre-Assessment — recorded</div>
          <div style="font-size:15px;font-weight:500;color:${pa === "complete" ? "var(--green)" : "var(--red)"}">${pa === "complete" ? "✓ Complete → Phase 1A" : "✗ Incomplete → Phase 1B"}</div>
        </div>
        <div style="text-align:right">
          <div class="dec-rec-lbl">Timestamp</div>
          <div style="font-size:15px;color:var(--text)">${fmt(doc.paTs)}</div>
        </div>
      </div>
    </div>`;
  }

  if (pa === "incomplete") {
    html += `<div class="stage-box">
      <div class="stage-box-hd"><span class="sb-title">Phase 1B — Incomplete Application</span><span class="sb-status-warn">Dead-end</span></div>
      <div class="sr done">
        <div class="sr-dot-col"><div class="sr-dot"></div><div class="sr-line"></div></div>
        <div><div class="sr-name">Pre-Assessment Marked Incomplete</div><div class="sr-hint">Recorded at pre-assessment stage</div></div>
        <div class="sr-right"><span class="sr-ts">${fmt(doc.paTs)}</span></div>
      </div>
      <div class="sr ${doc.stages["p1b_return"] ? "done" : "nxt"}">
        <div class="sr-dot-col"><div class="sr-dot"></div><div class="sr-line"></div></div>
        <div>
          <div class="sr-name">Return Application to Applicant</div>
          <div class="sr-hint">Record the date and time the application was physically returned.</div>
          ${doc.stages["p1b_return"] ? `<div class="sr-sub">Returned: ${fmt(doc.stages["p1b_return"].stampedAt)}</div>` : ""}
        </div>
        <div class="sr-right">
          ${
            doc.stages["p1b_return"]
              ? _isLastStage("p1b_return")
                ? `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px"><span class="sr-ts">${fmt(doc.stages["p1b_return"].stampedAt)}</span><button class="redact-btn" data-doc="${doc.id}" data-key="p1b_return" data-label="Return Application" data-ts="${fmt(doc.stages["p1b_return"].stampedAt)}">Redact</button></div>`
                : `<span class="sr-ts">${fmt(doc.stages["p1b_return"].stampedAt)}</span>`
              : `<button class="stmp" data-doc="${doc.id}" data-track="p1b" data-idx="0">Stamp Return</button>`
          }
        </div>
      </div>
    </div>`;
    if (doc.stages["p1b_return"]) {
      doc.p1b_closed = true;
      html += `<div class="closed-banner">⛔ Document closed — pre-assessment incomplete on ${fmt(doc.paTs)}, application returned on ${fmt(doc.stages["p1b_return"].stampedAt)}.</div>`;
    }
  } else if (pa === "complete") {
    html += `<div class="stage-box">
      <div class="stage-box-hd"><span class="sb-title">Phase 1A — Engineer</span><span class="${p1aDone ? "sb-status-on" : "sb-status-off"}">${p1aDone ? "✓ Done" : "Pending"}</span></div>
      ${buildRows(PHASE1A, doc, "p1a", false)}
    </div>`;
  }

  /* ── PHASE 2 ── */
  html += `<div class="ph-hd ${!p1aDone ? "locked" : ""}">Phase 2 — Record & Stamp; Route (CDO II)</div>`;
  html += `<div class="merge-banner ${p1aDone ? "open" : ""}"><span class="mb-ic">${p1aDone ? "🔓" : "🔒"}</span><span>${p1aDone ? "Engineer accepted — CDO II can now record and route." : "Waiting for Engineer to accept application."}</span></div>`;
  if (p1aDone) {
    html += `<div class="stage-box">
      <div class="stage-box-hd"><span class="sb-title">Phase 2 — CDO II</span><span class="${p2Done ? "sb-status-on" : "sb-status-off"}">${p2Done ? "✓ Done" : "In Progress"}</span></div>
      ${buildRows(PHASE2, doc, "p2", false)}
    </div>`;
  }

/* ── PHASE 3 ── */
const p3Locked = !p2Done
html += `<div class="ph-hd ${p3Locked ? 'locked' : ''}">Phase 3 — Parallel Evaluation</div>`
if (!p3Locked) {
  function nodToggle(field, recvStamp) {
    const val = doc[field]
    if (doc.p3decision === 'compliant' && !val) return ''
    const disabled = !recvStamp
    return `<div style="display:flex;align-items:center;gap:6px;padding:5px 12px;background:var(--s2);border-top:1px solid var(--b1)">
      <span style="font-size:10px;color:var(--dim);flex:1">Notice of Deficiency</span>
      ${val
        ? `<span style="font-size:10px;color:var(--red);font-weight:500">✓ NOD Issued</span>`
        : disabled
          ? `<span style="font-size:9px;color:var(--dim);font-style:italic">Available after Received from stamp</span>`
          : `<button class="stmp" style="border-color:var(--red);color:var(--red);background:rgba(192,57,43,.06)" onclick="setNOD('${field}','${doc.id}')">Issue NOD</button>`
      }
    </div>`
  }
  html += `<div class="track-grid-3">
    <div class="track">
      <div class="track-hd"><span class="track-title">Legal</span><span class="${legalDone ? 'sb-status-on' : 'sb-status-off'}">${legalDone ? '✓ Done' : 'In Progress'}</span></div>
      ${buildRows(PHASE3_LEGAL, doc, 'p3_legal', false)}
      ${nodToggle('nod_legal', doc.stages['p3_legal_back'])}
    </div>
    <div class="track">
      <div class="track-hd"><span class="track-title">Technical</span><span class="${techDone ? 'sb-status-on' : 'sb-status-off'}">${techDone ? '✓ Done' : 'In Progress'}</span></div>
      ${buildRows(PHASE3_TECH, doc, 'p3_tech', false)}
      ${nodToggle('nod_tech', doc.stages['p3_tech_back'])}
    </div>
    <div class="track">
      <div class="track-hd"><span class="track-title">Financial</span><span class="${finDone ? 'sb-status-on' : 'sb-status-off'}">${finDone ? '✓ Done' : 'In Progress'}</span></div>
      ${buildRows(PHASE3_FIN, doc, 'p3_fin', false)}
      ${nodToggle('nod_fin', doc.stages['p3_fin_back'])}
    </div>
  </div>`

  if (anyNOD) {
    const p3bAllRecvDone =
      !!doc.stages['p3_legal_back'] &&
      !!doc.stages['p3_tech_back'] &&
      !!doc.stages['p3_fin_back']
    html += `<div class="merge-banner warn"><span class="mb-ic">⚠</span><span>NOD issued on at least one track — Phase 3B is pending. Complete all Received from stamps to unlock.</span></div>`
    html += `<div class="stage-box" style="border-color:rgba(201,107,90,.3)">
      <div class="stage-box-hd"><span class="sb-title">Phase 3B — Deficiency Process</span><span class="${p3bAllRecvDone ? 'sb-status-warn' : 'sb-status-off'}">${p3bAllRecvDone ? 'Active' : 'Locked — awaiting all Received from'}</span></div>
      ${buildRows(PHASE3B, doc, 'p3b', !p3bAllRecvDone)}
    </div>`
  }

  if (allP3Done && !anyNOD && !p3DecisionSet) {
    html += `<div class="merge-banner open"><span class="mb-ic">🔓</span><span>All Phase 3 tracks complete — no NOD issued. Confirm findings below.</span></div>`
    html += `<div class="dec-box">
      <div class="dec-title">Findings Decision — all tracks compliant, confirm to proceed to Phase 3A</div>
      <div class="fg" style="margin-bottom:10px">
        <div class="fl">Date & Stamp; Time of Merge <span class="req">*</span></div>
        <input type="datetime-local" id="p3-merge-dt" class="fi" value="${nowLocal()}" style="max-width:260px">
      </div>
      <button class="btn btn-primary2 btn-sm" onclick="confirmP3Merge('${doc.id}')">Confirm — No Findings → Proceed to Phase 3A</button>
    </div>`
  } else if (allP3Done && p3DecisionSet) {
    html += `<div class="dec-box" style="border-color:rgba(126,184,154,.3);margin-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div>
          <div class="dec-title" style="margin-bottom:4px">Phase 3 — Decision recorded</div>
          <div style="font-size:15px;font-weight:500;color:var(--green)">✓ Compliant → Phase 3A</div>
        </div>
        <div style="text-align:right">
          <div class="dec-rec-lbl">Merge Timestamp</div>
          <div style="font-size:15px;color:var(--text)">${fmt(doc.p3mergeTs)}</div>
        </div>
      </div>
    </div>`
  } else if (!allP3Done) {
    html += `<div class="merge-banner"><span class="mb-ic">🔒</span><span>Complete all three Phase 3 tracks to unlock the findings decision.</span></div>`
  }

  if (onP3A) {
    html += `<div class="stage-box">
      <div class="stage-box-hd"><span class="sb-title">Phase 3A — Endorse to SID</span><span class="${p3aDone ? 'sb-status-on' : 'sb-status-off'}">${p3aDone ? '✓ Done' : 'In Progress'}</span></div>
      ${buildRows(PHASE3A, doc, 'p3a', false)}
    </div>`
  }
}
 /* ── PHASE 4 ── */
const p4bDone = p3bDone && PHASE4B.every((s) => doc.stages[s.key]);
const p4Locked2 = !p4Unlocked;
html += `<div class="ph-hd ${p4Locked2 ? "locked" : ""}">Phase 4 — ${p3bDone ? "Path B — Deficiency" : "Path A — Briefer & Stamp; Certificate"}</div>`;
if (!p4Locked2) {
  if (p3aDone) {
    html += `<div class="stage-box">
      <div class="stage-box-hd"><span class="sb-title">Phase 4A — Briefer & Stamp; Certificate</span><span class="${p4aDone ? "sb-status-on" : "sb-status-off"}">${p4aDone ? "✓ Done" : "In Progress"}</span></div>
      ${buildRows(PHASE4A, doc, "p4a", false)}
    </div>`;
  }
  if (p3bDone) {
    html += `<div class="stage-box" style="border-color:rgba(201,107,90,.25)">
      <div class="stage-box-hd"><span class="sb-title">Phase 4B — Deficiency Follow-up</span><span class="${p4bDone ? "sb-status-on" : "sb-status-off"}">${p4bDone ? "✓ Done" : "In Progress"}</span></div>
      ${buildRows(PHASE4B, doc, "p4b", false)}
      <div class="ts-fields">
        <div class="ts-row">
          <span class="ts-row-lbl">Applicant Notified (P4B)</span>
          <div class="ts-row-val">
            ${p4bDone
              ? doc.email_sent_p3b_notify
                ? `<button class="btn btn-ghost btn-xs" disabled>✉ Email Sent</button>`
                : !doc.emailVerified
                  ? `<button class="btn btn-ghost btn-xs" disabled title="Email not verified">✉ Unverified</button>`
                  : `<button class="btn btn-blue-out btn-xs" onclick="openEmailPrev('p3b_notify','${doc.id}')">✉ Preview</button>`
              : ""}
            ${tsBtn("p3b_notif_ts", "Applicant Notified (P4B)", doc.id, !p4bDone)}
          </div>
        </div>
        <div class="ts-row">
          <span class="ts-row-lbl">Application Returned (P4B)</span>
          <div class="ts-row-val">${tsBtn("p3b_return_ts", "Application Returned (P4B)", doc.id, !doc.p3b_notif_ts)}</div>
        </div>
      </div>
    </div>`;
    if (doc.p3b_notif_ts && doc.p3b_return_ts)
      html += `<div class="closed-banner">⛔ Document closed — applicant notified ${fmt(doc.p3b_notif_ts)}, application returned ${fmt(doc.p3b_return_ts)}.</div>`;
  }
} else if (p2Done) {
  html += `<div class="merge-banner"><span class="mb-ic">🔒</span><span>Phase 4 unlocks after Phase 3A or 3B completes.</span></div>`;
}
  /* ── PHASE 5 ── */
  const p5Locked = !p4aDone;
  html += `<div class="ph-hd ${p5Locked ? "locked" : ""}">Phase 5 — Certificate Decision (CDO II)</div>`;
  if (!p5Locked) {
    if (!certDecSet) {
      html += `<div class="stage-box">
        <div class="stage-box-hd"><span class="sb-title">Phase 5 — Record Receipt & Stamp; Decision</span><span class="sb-status-off">Pending Decision</span></div>
        ${buildRows(PHASE5, doc, "p5", false)}
      </div>`;
    } else {
      html += `<div class="dec-box" style="border-color:${onP5A ? "rgba(126,184,154,.3)" : "rgba(201,107,90,.3)"};margin-bottom:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <div>
            <div class="dec-title" style="margin-bottom:4px">Phase 5 — Certificate decision recorded</div>
            <div style="font-size:15px;font-weight:500;text-transform:uppercase;color:${onP5A ? "var(--green)" : "var(--red)"}">${doc.certOutcome}</div>
          </div>
          <div style="text-align:right">
            <div class="dec-rec-lbl">Timestamp</div>
            <div style="font-size:15px;color:var(--text)">${fmt(doc.certDecisionTs)}</div>
          </div>
        </div>
      </div>`;
      if (onP5A) {
        html += `<div class="stage-box">
          <div class="stage-box-hd"><span class="sb-title">Phase 5A — SOA Preparation</span><span class="${p5aDone ? "sb-status-on" : "sb-status-off"}">${p5aDone ? "✓ Done" : "In Progress"}</span></div>
          ${buildRows(PHASE5A, doc, "p5a", false)}
        </div>`;
      } else {
        html += `<div class="stage-box">
          <div class="stage-box-hd"><span class="sb-title">Phase 5B — Notice of Disapproval</span><span class="${p5bDone ? "sb-status-on" : "sb-status-off"}">${p5bDone ? "✓ Done" : "In Progress"}</span></div>
          ${buildRows(PHASE5B, doc, "p5b", false)}
        </div>`;
      }
    }
  } else if (p4aDone || !p5Locked) {
    html += `<div class="merge-banner"><span class="mb-ic">🔒</span><span>Phase 5 unlocks after Phase 4A completes.</span></div>`;
  }

  /* ── PHASE 6 ── */
const p6Locked = !p6aUnlocked && !p6bUnlocked
html += `<div class="ph-hd ${p6Locked ? 'locked' : ''}">Phase 6 — CDO II</div>`
if (p6aUnlocked) {
  html += `<div class="stage-box">
    <div class="stage-box-hd"><span class="sb-title">Phase 6A — Approved</span><span class="${p6aDone ? 'sb-status-on' : 'sb-status-off'}">${p6aDone ? '✓ Done' : 'In Progress'}</span></div>
    ${buildRows(PHASE6A, doc, 'p6a', false)}
    <div class="ts-fields">
      <div class="ts-row">
        <span class="ts-row-lbl">Notify Client — Approved & Stamp; SOA Fees</span>
        <div class="ts-row-val">
          ${p6aDone
            ? doc.email_sent_p6a_notify
              ? `<button class="btn btn-ghost btn-xs" disabled>✉ Email Sent</button>`
              : !doc.emailVerified
                ? `<button class="btn btn-ghost btn-xs" disabled title="Email not verified">✉ Unverified</button>`
                : `<button class="btn btn-blue-out btn-xs" onclick="openEmailPrev('p6a_notify','${doc.id}')">✉ Preview</button>`
            : ''}
          ${tsBtn('p6a_notif_ts', 'Client Notified — Approved & SOA', doc.id, !p6aDone)}
        </div>
      </div>
    </div>
  </div>`
} else if (p6bUnlocked) {
  html += `<div class="stage-box" style="border-color:rgba(201,107,90,.25)">
    <div class="stage-box-hd"><span class="sb-title">Phase 6B — Disapproved</span><span class="sb-status-warn">Dead-end</span></div>
    ${buildRows(PHASE6B, doc, 'p6b', false)}
    <div class="ts-fields">
      <div class="ts-row">
        <span class="ts-row-lbl">Notify Client — Disapproval</span>
        <div class="ts-row-val">
          ${doc.stages['p6b_recv_odc']
            ? doc.email_sent_p6b_notify
              ? `<button class="btn btn-ghost btn-xs" disabled>✉ Email Sent</button>`
              : !doc.emailVerified
                ? `<button class="btn btn-ghost btn-xs" disabled title="Email not verified">✉ Unverified</button>`
                : `<button class="btn btn-blue-out btn-xs" onclick="openEmailPrev('p6b_notify','${doc.id}')">✉ Preview</button>`
            : ''}
          ${tsBtn('p6b_notif_ts', 'Client Notified — Disapproval', doc.id, !doc.stages['p6b_recv_odc'])}
        </div>
      </div>
      <div class="ts-row">
        <span class="ts-row-lbl">Application Returned</span>
        <div class="ts-row-val">${tsBtn('p6b_return_ts', 'Application Returned (6B)', doc.id, !doc.p6b_notif_ts)}</div>
      </div>
    </div>
  </div>`
  if (doc.p6b_notif_ts && doc.p6b_return_ts)
    html += `<div class="closed-banner">⛔ Document closed — client notified ${fmt(doc.p6b_notif_ts)}, application returned ${fmt(doc.p6b_return_ts)}.</div>`
}

  /* ── PHASE 7 ── */
  const p7Locked2 = !p7Unlocked;
  html += `<div class="ph-hd ${p7Locked2 ? "locked" : ""}">Phase 7 — Payment</div>`;
  if (!p7Locked2) {
    html += `<div class="stage-box">
      <div class="stage-box-hd"><span class="sb-title">Phase 7 — Payment Stage (Client)</span><span class="${doc.stages["p7_payment"] ? "sb-status-on" : "sb-status-off"}">${doc.stages["p7_payment"] ? "✓ Paid" : "Awaiting Payment"}</span></div>
      ${buildRows(PHASE7, doc, "p7", false)}
    </div>`;
  }

  /* ── PHASE 8 ── */
  const p8Locked = !doc.stages["p7_payment"];
  html += `<div class="ph-hd ${p8Locked ? "locked" : ""}">Phase 8 — Release Certificate</div>`;
  if (!p8Locked) {
    html += `<div class="stage-box">
      <div class="stage-box-hd"><span class="sb-title">Phase 8 — Release & Stamp; Scan (CDO II)</span><span class="${isComplete(doc) ? "sb-status-on" : "sb-status-off"}">${isComplete(doc) ? "✓ Complete" : "In Progress"}</span></div>
      ${buildRows(PHASE8, doc, "p8", false)}
    </div>`;
    if (isComplete(doc))
      html += `<div class="complete-banner">✓ Document complete — certificate released on ${fmt(doc.stages["p8_release"].stampedAt)}.</div>`;
  }

  html += `</div>`; // close det-body

  const _detBody = document.querySelector("#docDetail .det-body");
  const _scrollTop = _detBody ? _detBody.scrollTop : 0;
  $("docDetail").innerHTML = html;
  const _newDetBody = document.querySelector("#docDetail .det-body");
  if (_newDetBody) _newDetBody.scrollTop = _scrollTop;

  $("docDetail")
    .querySelectorAll(".ts-redact-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        redactCtx = { docId: btn.dataset.doc, tsField: btn.dataset.field };
        $("redact-name").textContent = btn.dataset.label;
        $("redact-hint").textContent = "Stamped: " + btn.dataset.ts;
        openOv("ov-redact");
      });
    });
  $("docDetail")
    .querySelectorAll(".redact-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        openRedact(
          btn.dataset.doc,
          btn.dataset.key,
          btn.dataset.label.replace(/&quot;/g, '"'),
          btn.dataset.ts,
        );
      });
    });
  $("docDetail")
    .querySelectorAll(".stmp[data-doc]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const { doc: dId, track, idx } = btn.dataset;
        if (track === "cert_decision") openApprovalModal(dId);
        else openStamp(dId, track, parseInt(idx));
      });
    });
}

/* ══════════════════════════════════════════════
   CREATE DOC
══════════════════════════════════════════════ */
function openCreate() {
  $("f-entity").value = "";
  $("f-contact").value = "";
  $("f-email").value = "";
  $("f-remarks").value = "";
  $("f-emailVerif").checked = false;
  $("cb-lbl").className = "cb-lbl";
  $("cb-lbl").textContent = "Email Verified";
  $("f-created").textContent = fmt(new Date().toISOString());
  clearErrs("ov-create");
  openOv("ov-create");
  $("f-entity").focus();
}
function onCbChange() {
  const ok = $("f-emailVerif").checked;
  $("cb-lbl").className = "cb-lbl" + (ok ? " ok" : "");
  $("cb-lbl").textContent = ok ? "✓ Email Verified" : "Email Verified";
}
async function saveDoc() {
  clearErrs("ov-create");
  let ok = true;
  const entity = $("f-entity").value.trim();
  const contact = $("f-contact").value.trim();
  const email = $("f-email").value.trim();
  if (!entity) {
    markErr("f-entity", "fe-entity");
    ok = false;
  }
  if (!contact) {
    markErr("f-contact", "fe-contact");
    ok = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    markErr("f-email", "fe-email");
    ok = false;
  }
  if (!ok) return;

  const newDoc = {
    id: genId(),
    entity,
    contact,
    email,
    emailVerified: $("f-emailVerif").checked,
    remarks: $("f-remarks").value.trim(),
    createdAt: new Date().toISOString(),
    stages: {},
    preassess: null,
    paTs: null,
    nod_legal: false,
    nod_tech: false,
    nod_fin: false,
    p3decision: null,
    p3mergeTs: null,
    certOutcome: null,
    certDecisionTs: null,
    p3b_notif_ts: null,
    p3b_return_ts: null,
    p4b_notif_ts: null,
    p4b_return_ts: null,
    p6a_notif_ts: null,
    p6b_notif_ts: null,
    p6b_return_ts: null,
    p1b_closed: false,
    email_sent_p3b_notify: false,
    email_sent_p6a_notify: false,
    email_sent_p6b_notify: false,
  };
  setLoading(true, "Creating document…");
  try {
    const saved = await createDoc(newDoc);
    docs.unshift(saved);
    closeOv("ov-create");
    renderSidebar();
    selDoc(saved.id);
    toast(`Document for "${entity}" created.`);
  } catch (e) {
    console.error(e);
    toast("Failed to create document.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   PRE-ASSESSMENT
══════════════════════════════════════════════ */
function openPA(docId) {
  paDocId = docId;
  paPick = null;
  const inlineDt = $("pa-inline-dt");
  paInlineDt = inlineDt ? inlineDt.value : null;
  $("pa-complete").className = "pa-opt";
  $("pa-incomplete").className = "pa-opt";
  $("pa-dt").value = paInlineDt || nowLocal();
  $("pae-dt").classList.remove("on");
  $("pae-future").classList.remove("on");
  $("pae-result").classList.remove("on");
  openOv("ov-preassess");
}
function pickPA(v) {
  paPick = v;
  $("pa-complete").className =
    "pa-opt" + (v === "complete" ? " pick-complete" : "");
  $("pa-incomplete").className =
    "pa-opt" + (v === "incomplete" ? " pick-incomplete" : "");
  $("pae-result").classList.remove("on");
}
async function confirmPA() {
  if (!paPick) {
    $("pae-result").classList.add("on");
    return;
  }
  const dt = $("pa-dt").value;
  if (!dt) {
    $("pae-dt").classList.add("on");
    return;
  }
  if (new Date(dt) > new Date()) {
    $("pae-future").classList.add("on");
    return;
  }
  const doc = docs.find((d) => d.id === paDocId);
  const ts = new Date(dt).toISOString();
  setLoading(true, "Recording pre-assessment…");
  try {
    await updateDoc(paDocId, { preassess: paPick, paTs: ts });
    doc.preassess = paPick;
    doc.paTs = ts;
    closeOv("ov-preassess");
    renderSidebar();
    renderDetail();
    if ($("pg-simple").classList.contains("active")) renderSimple();
    toast(
      paPick === "complete"
        ? "Pre-assessment: Complete → Phase 1A."
        : "Pre-assessment: Incomplete → Phase 1B.",
    );
  } catch (e) {
    console.error(e);
    toast("Failed to save pre-assessment.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   NOD TOGGLE
══════════════════════════════════════════════ */
async function setNOD(field, docId) {
  const doc = docs.find((d) => d.id === docId);
  setLoading(true, "Issuing NOD…");
  try {
    await updateDoc(docId, { [field]: true });
    doc[field] = true;
    renderSidebar();
    renderDetail();
    toast("NOD issued — Phase 3B activated.");
  } catch (e) {
    console.error(e);
    toast("Failed to issue NOD.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   PHASE 3 MERGE
══════════════════════════════════════════════ */
async function confirmP3Merge(docId) {
  const dtEl = $("p3-merge-dt");
  if (!dtEl) return;
  const dt = dtEl.value;
  if (!dt) {
    toast("Please set a merge timestamp.", true);
    return;
  }
  if (new Date(dt) > new Date()) {
    toast("Timestamp cannot be in the future.", true);
    return;
  }
  const doc = docs.find((d) => d.id === docId);
  const ts = new Date(dt).toISOString();
  setLoading(true, "Confirming Phase 3…");
  try {
    await updateDoc(docId, { p3decision: "compliant", p3mergeTs: ts });
    doc.p3decision = "compliant";
    doc.p3mergeTs = ts;
    renderSidebar();
    renderDetail();
    toast("Phase 3 findings confirmed — proceeding to Phase 3A.");
  } catch (e) {
    console.error(e);
    toast("Failed to save decision.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   STAMP MODAL
══════════════════════════════════════════════ */
function openStamp(docId, track, idx) {
  const defs = TRACK_MAP[track];
  if (!defs) return;
  const sd = defs[idx];
  if (!sd) return;
  stampCtx = { docId, track, idx, sd };
  $("sm-name").textContent = sd.label.replace(/& Stamp;/g, "&");
  $("sm-hint").textContent = sd.hint || "Set the date and time.";
  $("sm-note").textContent = "";
  $("sm-passedby-grp").style.display = sd.passedBy ? "block" : "none";
  $("sm-sentby-grp").style.display = sd.sentBy ? "block" : "none";
  if (sd.passedBy) {
    $("sm-passedby").value = "";
    $("sm-passedby").classList.remove("err");
    $("sme-passedby").classList.remove("on");
  }
  if (sd.sentBy) {
    $("sm-sentby").value = "";
    $("sm-sentby").classList.remove("err");
    $("sme-sentby").classList.remove("on");
  }
  $("sm-dt").value = nowLocal();
  $("sm-dt").classList.remove("err");
  $("sme-dt").classList.remove("on");
  $("sme-future").classList.remove("on");
  openOv("ov-stamp");
}

async function doStamp() {
  if (tsCtx) {
    const dt = $("sm-dt").value;
    if (!dt) {
      markErr("sm-dt", "sme-dt");
      return;
    }
    if (new Date(dt) > new Date()) {
      markErr("sm-dt", "sme-future");
      return;
    }
    const doc = docs.find((d) => d.id === tsCtx.docId);
    const ts = new Date(dt).toISOString();
    setLoading(true, "Recording timestamp…");
    try {
      await updateDoc(tsCtx.docId, { [tsCtx.field]: ts });
      doc[tsCtx.field] = ts;
      closeOv("ov-stamp");
      tsCtx = null;
      renderSidebar();
      renderDetail();
      if ($("pg-simple").classList.contains("active")) renderSimple();
      toast("Timestamp recorded.");
    } catch (e) {
      console.error(e);
      toast("Failed to save timestamp.", true);
    } finally {
      setLoading(false);
    }
    return;
  }
  if (!stampCtx) return;
  let ok = true;
  if (stampCtx.sd.passedBy && !$("sm-passedby").value.trim()) {
    markErr("sm-passedby", "sme-passedby");
    ok = false;
  }
  if (stampCtx.sd.sentBy && !$("sm-sentby").value.trim()) {
    markErr("sm-sentby", "sme-sentby");
    ok = false;
  }
  const dt = $("sm-dt").value;
  if (!dt) {
    markErr("sm-dt", "sme-dt");
    ok = false;
  } else if (new Date(dt) > new Date()) {
    markErr("sm-dt", "sme-future");
    ok = false;
  }
  if (!ok) return;
  const doc = docs.find((d) => d.id === stampCtx.docId);
  const ts = new Date(dt).toISOString();
  const extras = {};
  if (stampCtx.sd.passedBy) extras.passedBy = $("sm-passedby").value.trim();
  if (stampCtx.sd.sentBy) extras.sentBy = $("sm-sentby").value.trim();
  setLoading(true, "Stamping stage…");
  try {
    await stampStage(stampCtx.docId, stampCtx.sd.key, ts, extras);
    doc.stages[stampCtx.sd.key] = { stampedAt: ts, ...extras };
    closeOv("ov-stamp");
    stampCtx = null;
    renderSidebar();
    renderDetail();
    if ($("pg-simple").classList.contains("active")) renderSimple();
    toast("Stage recorded.");
  } catch (e) {
    console.error(e);
    toast("Failed to save stage.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   TS-ONLY MODAL
══════════════════════════════════════════════ */
function openTsModal(field, label, docId) {
  tsCtx = { field, label, docId };
  $("sm-name").textContent = label;
  $("sm-hint").textContent = "Record the exact date and time.";
  $("sm-note").textContent = "";
  $("sm-passedby-grp").style.display = "none";
  $("sm-sentby-grp").style.display = "none";
  $("sm-dt").value = nowLocal();
  $("sm-dt").classList.remove("err");
  $("sme-dt").classList.remove("on");
  $("sme-future").classList.remove("on");
  openOv("ov-stamp");
}

/* ══════════════════════════════════════════════
   APPROVAL MODAL
══════════════════════════════════════════════ */
function openApprovalModal(docId) {
  apprDocId = docId;
  apprPick = null;
  $("appr-yes").className = "appr-opt";
  $("appr-no").className = "appr-opt";
  $("appr-dt").value = nowLocal();
  $("appre-dt").classList.remove("on");
  $("appre-future").classList.remove("on");
  $("appre-result").classList.remove("on");
  openOv("ov-approval");
}
function pickAppr(v) {
  apprPick = v;
  $("appr-yes").className = "appr-opt" + (v === "approved" ? " pick-appr" : "");
  $("appr-no").className =
    "appr-opt" + (v === "disapproved" ? " pick-disappr" : "");
  $("appre-result").classList.remove("on");
}
async function confirmAppr() {
  if (!apprPick) {
    $("appre-result").classList.add("on");
    return;
  }
  const dt = $("appr-dt").value;
  if (!dt) {
    $("appre-dt").classList.add("on");
    return;
  }
  if (new Date(dt) > new Date()) {
    $("appre-future").classList.add("on");
    return;
  }
  const doc = docs.find((d) => d.id === apprDocId);
  const ts = new Date(dt).toISOString();
  setLoading(true, "Recording certificate decision…");
  try {
    await stampStage(apprDocId, "p5_receipt", ts);
    await updateDoc(apprDocId, { certOutcome: apprPick, certDecisionTs: ts });
    doc.stages["p5_receipt"] = { stampedAt: ts };
    doc.certOutcome = apprPick;
    doc.certDecisionTs = ts;
    closeOv("ov-approval");
    renderSidebar();
    renderDetail();
    if ($("pg-simple").classList.contains("active")) renderSimple();
    toast(
      `Certificate ${apprPick} — proceeding to Phase ${apprPick === "approved" ? "5A → 6A" : "5B → 6B"}.`,
    );
  } catch (e) {
    console.error(e);
    toast("Failed to save decision.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   EMAIL PREVIEW
══════════════════════════════════════════════ */
async function sendEmail(to, subject, body) {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, body }),
  });
  if (!res.ok) throw new Error("Failed to send");
}

function openEmailPrev(type, docId) {
  const doc = docId ? docs.find((d) => d.id === docId) : null;

  if (type !== "verify" && doc && !doc.emailVerified) {
    toast("Cannot send email — email address is not verified.", true);
    return;
  }

  let email = "";
  if (type === "verify") {
    email = doc?.email || ($("f-email") ? $("f-email").value.trim() : "");
  } else {
    email = doc?.email || "—";
  }

  let title = "Email Preview", subj = "", body = "";

  if (type === "verify") {
    const entity = $("f-entity") ? $("f-entity").value.trim() || "the applicant" : "the applicant";
    title = "Verification Email"; subj = "Document Tracker — Email Verification";
    body = `Dear ${esc(contact)} of ${esc(entity)},<br><br>This is a verification email from our Document Tracker system. Please confirm your email address is associated with your application.<br><br>Thank you.`;
 } else if (type === "p6a_notify") {
  title = "Notification — Approved &amp; SOA";
  subj = "Document Tracker — Application Approved";
  body = `Dear ${esc(doc.contact)} of ${esc(doc.entity)},<br><br>We are pleased to inform you that your application has been approved.<br><br>Please find the attached Statement of Account with fees to be paid. Kindly settle the payment to proceed with certificate release.<br><br>Thank you.`;
} else if (type === "p6b_notify") {
  title = "Notification — Disapproval";
  subj = "Document Tracker — Notice of Disapproval";
  body = `Dear ${esc(doc.contact)} of ${esc(doc.entity)},<br><br>We regret to inform you that your application has been disapproved. Please refer to the attached Notice of Disapproval. Your application documents are being returned.<br><br>Thank you.`;
} else if (type === "p3b_notify") {
  title = "Notification — Notice of Deficiency";
  subj = "Document Tracker — Notice of Deficiency";
  body = `Dear ${esc(doc.contact)} of ${esc(doc.entity)},<br><br>We wish to inform you that upon evaluation of your application, a Notice of Deficiency has been issued.<br><br>Your application has been found to have deficiencies that need to be addressed before processing can continue. Please coordinate with our office regarding the necessary requirements.<br><br>Thank you.`;
}

  $("ep-title").textContent = title;
  $("ep-to").textContent = email;
  $("ep-subj").textContent = subj;
  $("ep-body").innerHTML = body;

  $("ep-send-btn").onclick = async () => {
    try {
      setLoading(true, "Sending email…");
      await sendEmail(email, subj, body);
      if (doc && type !== "verify") {
        const sentField = `email_sent_${type}`;
        await updateDoc(doc.id, { [sentField]: true });
        const localDoc = docs.find((d) => d.id === doc.id);
        if (localDoc) localDoc[sentField] = true;
      }
      closeOv("ov-emailprev");
      toast("Email sent.");
      if ($("pg-simple").classList.contains("active")) renderSimple();
      else if (selId) renderDetail();
    } catch (e) {
      console.error(e);
      toast("Failed to send email.", true);
    } finally {
      setLoading(false);
    }
  };

  openOv("ov-emailprev");
}

/* ══════════════════════════════════════════════
   SUMMARY
══════════════════════════════════════════════ */
function openSummary(docId) {
  const doc = docs.find((d) => d.id === docId);
  if (!doc) return;
  $("sum-title").textContent = doc.entity;

  function durStr(ms) {
    if (ms <= 0) return "—";
    const m = Math.round(ms / 60000),
      h = Math.floor(m / 60),
      min = m % 60;
    if (h === 0) return `${min}m`;
    if (min === 0) return `${h}h`;
    return `${h}h ${min}m`;
  }

  const events = [{ label: "Document Created", ts: doc.createdAt, phase: "" }];
  const groups = [
    { phase: "Phase 1A — Engineer", stages: PHASE1A },
    { phase: "Phase 2 — CDO II", stages: PHASE2 },
    { phase: "Phase 1B", stages: PHASE1B },
    { phase: "Phase 3 — Legal", stages: PHASE3_LEGAL },
    { phase: "Phase 3 — Technical", stages: PHASE3_TECH },
    { phase: "Phase 3 — Financial", stages: PHASE3_FIN },
    { phase: "Phase 3A", stages: PHASE3A },
    { phase: "Phase 3B", stages: PHASE3B },
    { phase: "Phase 4A", stages: PHASE4A },
    { phase: "Phase 4B", stages: PHASE4B },
    { phase: "Phase 5", stages: PHASE5 },
    { phase: "Phase 5A", stages: PHASE5A },
    { phase: "Phase 5B", stages: PHASE5B },
    { phase: "Phase 6A", stages: PHASE6A },
    { phase: "Phase 6B", stages: PHASE6B },
    { phase: "Phase 7", stages: PHASE7 },
    { phase: "Phase 8", stages: PHASE8 },
  ];
  groups.forEach((g) =>
    g.stages.forEach((s) => {
      const sd = doc.stages[s.key];
      if (sd?.stampedAt)
        events.push({
          label: s.label.replace(/& Stamp;/g, "&"),
          ts: sd.stampedAt,
          phase: g.phase,
          sd,
        });
    }),
  );
  const tsFields = [
    { field: "paTs", label: "Pre-Assessment Recorded", phase: "Phase 1" },
    {
      field: "p3mergeTs",
      label: "Phase 3 Merge — No Findings",
      phase: "Phase 3",
    },
    {
      field: "certDecisionTs",
      label: `Certificate ${doc.certOutcome || "Decision"}`,
      phase: "Phase 5",
    },
    {
      field: "p3b_notif_ts",
      label: "Applicant Notified (P3B)",
      phase: "Phase 3B",
    },
    {
      field: "p3b_return_ts",
      label: "Application Returned (P3B)",
      phase: "Phase 3B",
    },
    {
      field: "p6a_notif_ts",
      label: "Client Notified — Approved",
      phase: "Phase 6A",
    },
    {
      field: "p6b_notif_ts",
      label: "Client Notified — Disapproval",
      phase: "Phase 6B",
    },
    {
      field: "p6b_return_ts",
      label: "Application Returned (6B)",
      phase: "Phase 6B",
    },
  ];
  tsFields.forEach((f) => {
    if (doc[f.field])
      events.push({ label: f.label, ts: doc[f.field], phase: f.phase });
  });
  events.sort((a, b) => new Date(a.ts) - new Date(b.ts));

  const firstTs = events[0]?.ts,
    lastTs = events[events.length - 1]?.ts;
  const totalWall =
    lastTs && firstTs ? new Date(lastTs) - new Date(firstTs) : 0;
  const totalWork = lastTs && firstTs ? workMs(firstTs, lastTs) : 0;
  let maxW = 0,
    bnLabel = "";
  for (let i = 1; i < events.length; i++) {
    const w = workMs(events[i - 1].ts, events[i].ts);
    if (w > maxW) {
      maxW = w;
      bnLabel = events[i].label;
    }
  }
  const maxWall = Math.max(
    1,
    ...Array.from(
      { length: Math.max(events.length - 1, 0) },
      (_, i) => new Date(events[i + 1]?.ts) - new Date(events[i]?.ts),
    ),
  );

  let statusLabel = "In Progress",
    statusColor = "var(--red)";
  if (isComplete(doc)) {
    statusLabel = "Complete";
    statusColor = "var(--green)";
  } else if (isClosed(doc)) {
    statusLabel = "Closed";
    statusColor = "var(--red)";
  }

  const stageRows = events
    .map((ev, i) => {
      if (i === 0)
        return `<div class="sum-stage-row"><div style="color:var(--muted)">${ev.label}</div><div style="color:var(--text);font-size:10px">${fmt(ev.ts)}</div><div style="color:var(--dim);text-align:right">—</div><div></div></div>`;
      const wall = new Date(ev.ts) - new Date(events[i - 1].ts);
      const wk = workMs(events[i - 1].ts, ev.ts);
      const pct = Math.round((wall / maxWall) * 100);
      const clr =
        wall === maxWall
          ? "var(--red)"
          : pct > 50
            ? "var(--red)"
            : "var(--green)";
      const sub = ev.sd?.passedBy
        ? ` <span style="color:var(--green);font-size:9px">· ${esc(ev.sd.passedBy)}</span>`
        : ev.sd?.sentBy
          ? ` <span style="color:var(--green);font-size:9px">· CDO: ${esc(ev.sd.sentBy)}</span>`
          : "";
      return `<div class="sum-stage-row">
      <div><span style="color:var(--text)">${ev.label}</span>${sub}<div style="font-size:9px;color:var(--dim)">${ev.phase}</div></div>
      <div style="color:var(--muted);font-size:10px">${fmt(ev.ts)}</div>
      <div style="text-align:right"><div style="color:var(--text)">${durStr(wall)}</div><div style="font-size:9px;color:var(--dim)">${durStr(wk)} work</div></div>
      <div><div class="ssr-bar-bg"><div class="ssr-bar-fill" style="width:${pct}%;background:${clr}"></div></div></div>
    </div>`;
    })
    .join("");

  $("sum-body").innerHTML = `
    <div class="sum-section">
      <div class="sum-sec-title">Document Info</div>
      <div class="sum-meta-grid">
        <div class="sum-meta-card"><div class="smc-lbl">Entity</div><div class="smc-val">${esc(doc.entity)}</div></div>
        <div class="sum-meta-card"><div class="smc-lbl">Status</div><div class="smc-val" style="color:${statusColor}">${statusLabel}</div></div>
        <div class="sum-meta-card"><div class="smc-lbl">Created</div><div class="smc-val" style="font-size:11px">${fmt(doc.createdAt)}</div></div>
        <div class="sum-meta-card"><div class="smc-lbl">Stages Recorded</div><div class="smc-val">${events.length - 1} events</div></div>
        <div class="sum-meta-card"><div class="smc-lbl">Pre-Assessment</div><div class="smc-val" style="color:${doc.preassess === "complete" ? "var(--green)" : doc.preassess === "incomplete" ? "var(--red)" : "var(--dim)"}">${doc.preassess || "Pending"}</div></div>
        <div class="sum-meta-card"><div class="smc-lbl">Certificate</div><div class="smc-val" style="color:${doc.certOutcome === "approved" ? "var(--green)" : doc.certOutcome === "disapproved" ? "var(--red)" : "var(--dim)"}">${doc.certOutcome || "—"}</div></div>
      </div>
    </div>
    <div class="sum-section">
      <div class="sum-sec-title">Time Statistics</div>
      <div class="sum-meta-grid">
        <div class="sum-meta-card"><div class="smc-lbl">Total Elapsed</div><div class="smc-val" style="color:var(--red)">${totalWall > 0 ? durStr(totalWall) : "In progress"}</div></div>
        <div class="sum-meta-card"><div class="smc-lbl">Working Time</div><div class="smc-val" style="color:var(--red)">${totalWork > 0 ? durStr(totalWork) : "In progress"}</div></div>
        <div class="sum-meta-card"><div class="smc-lbl">Slowest Stage</div><div class="smc-val" style="color:var(--red);font-size:11px">${bnLabel || "—"}${maxW > 0 ? `<div style="font-size:10px;color:var(--muted)">${durStr(maxW)} working</div>` : ""}</div></div>
      </div>
    </div>
    <div class="sum-section">
      <div class="sum-sec-title">Stage-by-Stage Breakdown</div>
      <div style="background:var(--s1);border:1px solid var(--b1);border-radius:5px;overflow:hidden">
        <div class="sum-stage-row hd"><div>Stage</div><div>Timestamp</div><div style="text-align:right">Time Since Prev.</div><div style="text-align:right">Rel.</div></div>
        ${stageRows || `<div style="padding:14px;text-align:center;font-size:12px;color:var(--dim)">No stages recorded yet.</div>`}
      </div>
      ${totalWall > 0 ? `<div class="sum-total-row"><span style="color:var(--muted);font-size:12px">Total</span><span style="color:var(--red);font-size:12px;font-weight:500">${durStr(totalWall)} elapsed · ${durStr(totalWork)} working</span></div>` : ""}
    </div>`;
  openOv("ov-summary");
}

/* ══════════════════════════════════════════════
   SIMPLE VIEW
══════════════════════════════════════════════ */
function renderSimple() {
  const body = $("simpleBody");
  if (!selId) {
    body.innerHTML = `
      <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:14px">Select a Document</div>
      <div class="simple-pick-list">
        ${docs
          .map(
            (d) => `
         <div class="simple-pick-item" onclick="selectSimpleDoc('${d.id}')">
            <div class="simple-pick-name">${esc(d.entity)}</div>
            <div class="simple-pick-stage">${lastLabel(d)}</div>
          </div>`,
          )
          .join("")}
      </div>`;
    return;
  }
  const doc = docs.find((d) => d.id === selId);
  if (!doc) return;

  const p2Done = PHASE2.every((s) => doc.stages[s.key]);
  const legalDone = PHASE3_LEGAL.every((s) => doc.stages[s.key]);
  const techDone = PHASE3_TECH.every((s) => doc.stages[s.key]);
  const finDone = PHASE3_FIN.every((s) => doc.stages[s.key]);
  const allP3Done = legalDone && techDone && finDone;
  const anyNOD = doc.nod_legal || doc.nod_tech || doc.nod_fin;
  const p3DecisionSet = !!doc.p3decision;
  const inPhase3 = p2Done && (!allP3Done || (allP3Done && !p3DecisionSet && !anyNOD));

const pathStages = (() => {
    const pa = doc.preassess, path = [];
    path.push(...PHASE1A);
    if (pa === "incomplete") path.push(...PHASE1B);
    else if (pa === "complete") {
      path.push(...PHASE2, ...PHASE3_LEGAL, ...PHASE3_TECH, ...PHASE3_FIN);
      if (doc.nod_legal || doc.nod_tech || doc.nod_fin) {
        path.push(...PHASE3B, ...PHASE4B);
      } else if (doc.p3decision === "compliant") {
        path.push(...PHASE3A, ...PHASE4A, ...PHASE5);
        if (doc.certOutcome === "approved")
          path.push(...PHASE5A, ...PHASE6A, ...PHASE7, ...PHASE8);
        else if (doc.certOutcome === "disapproved")
          path.push(...PHASE5B, ...PHASE6B);
      }
    }
    return path;
  })();

  const nextStage = inPhase3
    ? null
    : pathStages.find((s) => !doc.stages[s.key]);
  const complete = isComplete(doc);
  const closed = isClosed(doc);
  const doneCount = pathStages.filter((s) => doc.stages[s.key]).length;
  const pct = complete
    ? 100
    : Math.round((doneCount / pathStages.length) * 100);

  const phaseOf = (key) => {
    if (PHASE1A.find((s) => s.key === key)) return "Phase 1A — Engineer";
    if (PHASE1B.find((s) => s.key === key)) return "Phase 1B — Incomplete";
    if (PHASE2.find((s) => s.key === key)) return "Phase 2 — CDO II";
    if (PHASE3_LEGAL.find((s) => s.key === key)) return "Phase 3 — Legal";
    if (PHASE3_TECH.find((s) => s.key === key)) return "Phase 3 — Technical";
    if (PHASE3_FIN.find((s) => s.key === key)) return "Phase 3 — Financial";
    if (PHASE3A.find((s) => s.key === key)) return "Phase 3A — Endorse";
    if (PHASE3B.find((s) => s.key === key)) return "Phase 3B — Deficiency";
   if (PHASE4A.find((s) => s.key === key)) return "Phase 4A — Briefer";
    if (PHASE4B.find((s) => s.key === key)) return "Phase 4B — Deficiency";
    if (PHASE5.find((s) => s.key === key)) return "Phase 5 — Decision";
    if (PHASE5A.find((s) => s.key === key)) return "Phase 5A — SOA";
    if (PHASE5B.find((s) => s.key === key)) return "Phase 5B — Disapproval";
    if (PHASE6A.find((s) => s.key === key)) return "Phase 6A — Release Prep";
    if (PHASE6B.find((s) => s.key === key)) return "Phase 6B — Return";
    if (PHASE7.find((s) => s.key === key)) return "Phase 7 — Payment";
    if (PHASE8.find((s) => s.key === key)) return "Phase 8 — Release";
    return "";
  };

  const phase = inPhase3
    ? "Phase 3 — Parallel Evaluation"
    : nextStage
      ? phaseOf(nextStage.key)
      : "";

  let stageHtml;

  if (complete) {
    stageHtml = `
      <div class="simple-stage-name">Certificate Released</div>
      <div class="simple-stage-hint">This document is complete.</div>
      <button class="simple-stamp-btn done" disabled>✓ Complete</button>`;
  } else if (closed) {
    stageHtml = `
      <div class="simple-stage-name">Document Closed</div>
      <div class="simple-stage-hint">${lastLabel(doc)}</div>
      <button class="simple-stamp-btn closed" disabled>Closed</button>`;
  } else if (!doc.preassess) {
    stageHtml = `
      <div class="simple-stage-name">Pre-Assessment</div>
      <div class="simple-stage-hint">Record result and timestamp</div>
      <button class="simple-stamp-btn" onclick="openPA('${doc.id}')">Record Pre-Assessment</button>`;
  } else if (inPhase3) {
    const trackNext = (defs, track, nodField) => {
      const next = defs.find((s) => !doc.stages[s.key]);
      const done = defs.every((s) => doc.stages[s.key]);
      const nodIssued = doc[nodField];
      const canNOD =
        !!doc.stages[defs[defs.length - 1].key] &&
        !nodIssued &&
        !doc.p3decision;
      const nodHtml = nodIssued
        ? `<div style="padding:6px 14px 10px;font-size:11px;color:var(--red)">⚠ NOD Issued</div>`
        : canNOD
          ? `<div style="padding:0 14px 10px"><button class="stmp" style="width:100%;border-color:var(--red);color:var(--red);background:rgba(192,57,43,.06)" onclick="setNOD('${nodField}','${doc.id}');renderSimple()">Issue NOD</button></div>`
          : "";
      if (done)
        return `<div style="padding:14px;text-align:center;color:var(--green);font-size:13px">✓ Done</div>${nodHtml}`;
      if (!next) return "";
      return `
        <div style="padding:12px 14px">
          <div class="simple-stage-name" style="font-size:15px;margin-bottom:4px">${next.label.replace(/& Stamp;/g, "&")}</div>
          <div class="simple-stage-hint" style="margin-bottom:12px">${next.hint || ""}</div>
          <button class="simple-stamp-btn" style="padding:14px" onclick="openStampFromSimple('${doc.id}','${next.key}')">Stamp</button>
        </div>${nodHtml}`;
    };
    stageHtml = `
      <div class="simple-stage-name" style="margin-bottom:16px">Phase 3 — Parallel Evaluation</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="background:var(--s1);border:1px solid var(--b1);border-radius:8px;overflow:hidden">
          <div style="padding:8px 14px;background:var(--s2);border-bottom:1px solid var(--b1);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Legal</div>
          ${trackNext(PHASE3_LEGAL, "p3_legal", "nod_legal")}
        </div>
        <div style="background:var(--s1);border:1px solid var(--b1);border-radius:8px;overflow:hidden">
          <div style="padding:8px 14px;background:var(--s2);border-bottom:1px solid var(--b1);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Technical</div>
          ${trackNext(PHASE3_TECH, "p3_tech", "nod_tech")}
        </div>
        <div style="background:var(--s1);border:1px solid var(--b1);border-radius:8px;overflow:hidden">
          <div style="padding:8px 14px;background:var(--s2);border-bottom:1px solid var(--b1);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Financial</div>
          ${trackNext(PHASE3_FIN, "p3_fin", "nod_fin")}
        </div>
      </div>
      ${
        allP3Done && !p3DecisionSet && !anyNOD
          ? `
        <div style="margin-top:16px;background:var(--s1);border:1px solid rgba(126,184,154,.3);border-radius:8px;padding:16px">
          <div style="font-size:13px;color:var(--green);margin-bottom:8px">✓ All tracks complete — no NOD issued</div>
          <div style="font-size:12px;color:var(--dim);margin-bottom:14px">Confirm findings to proceed to Phase 3A.</div>
          <input type="datetime-local" id="simple-p3-dt" class="fi" value="${nowLocal()}" style="margin-bottom:10px">
          <button class="simple-stamp-btn2" style="padding:14px" onclick="confirmSimpleP3Merge('${doc.id}')">Confirm — Proceed to Phase 3A</button>
        </div>`
          : ""
      }
      ${
        allP3Done && anyNOD && !p3DecisionSet
          ? `
        <div style="margin-top:16px;background:var(--s1);border:1px solid rgba(201,107,90,.3);border-radius:8px;padding:16px">
          <div style="font-size:13px;color:var(--red);margin-bottom:8px">⚠ NOD issued — proceed to Phase 3B</div>
          <button class="simple-stamp-btn" style="padding:14px;background:var(--red)" onclick="confirmSimpleP3B('${doc.id}')">Confirm — Proceed to Phase 3B</button>
        </div>`
          : ""
      }`;
  } else {
    const p3bDone = anyNOD && PHASE3B.every((s) => doc.stages[s.key]);
    const p4bDone = p3bDone && PHASE4B.every((s) => doc.stages[s.key]);
    const certDecSet = !!doc.certOutcome;
    const p5aDone = certDecSet && doc.certOutcome === "approved" && PHASE5A.every((s) => doc.stages[s.key]);
    const p5bDone = certDecSet && doc.certOutcome === "disapproved" && PHASE5B.every((s) => doc.stages[s.key]);
    const p6aDone = p5aDone && PHASE6A.every((s) => doc.stages[s.key]);
    const p6bDone = p5bDone && PHASE6B.every((s) => doc.stages[s.key]);
    if (p3bDone && !p4bDone) {
      stageHtml = `
        <div class="simple-stage-name">Record Acceptance — Deficiency</div>
        <div class="simple-stage-hint">CDO II records acceptance and scans documents.</div>
        <button class="simple-stamp-btn" style="background:var(--red)" onclick="openStampFromSimple('${doc.id}','p4b_cdo_accept')">Stamp</button>`;
    } else if (p4bDone && !doc.p3b_notif_ts) {
      const emailBtnP3b = doc.email_sent_p3b_notify
        ? `<button class="btn btn-ghost btn-xs" disabled>✉ Email Sent</button>`
        : !doc.emailVerified
          ? `<button class="btn btn-ghost btn-xs" disabled title="Email not verified">✉ Unverified</button>`
          : `<button class="btn btn-blue-out btn-xs" onclick="openEmailPrev('p3b_notify','${doc.id}')">✉ Preview</button>`;
      stageHtml = `
        <div class="simple-stage-name">Notify Applicant — Deficiency</div>
        <div class="simple-stage-hint">Record applicant notification timestamp (P4B).</div>
        <div style="margin-bottom:10px">${emailBtnP3b}</div>
        <button class="simple-stamp-btn" style="background:var(--red)" onclick="openTsModal('p3b_notif_ts','Applicant Notified (P4B)','${doc.id}')">Record Notification</button>`;
    } else if (p4bDone && doc.p3b_notif_ts && !doc.p3b_return_ts) {
      stageHtml = `
        <div class="simple-stage-name">Return Application — Deficiency</div>
        <div class="simple-stage-hint">Record date application was returned (P4B).</div>
        <button class="simple-stamp-btn" style="background:var(--red)" onclick="openTsModal('p3b_return_ts','Application Returned (P4B)','${doc.id}')">Record Return</button>`;
    } else if (p6aDone && !doc.p6a_notif_ts) {
      const emailBtnP6a = doc.email_sent_p6a_notify
        ? `<button class="btn btn-ghost btn-xs" disabled>✉ Email Sent</button>`
        : !doc.emailVerified
          ? `<button class="btn btn-ghost btn-xs" disabled title="Email not verified">✉ Unverified</button>`
          : `<button class="btn btn-blue-out btn-xs" onclick="openEmailPrev('p6a_notify','${doc.id}')">✉ Preview</button>`;
      stageHtml = `
        <div class="simple-stage-name">Notify Client — Approved & Stamp; SOA</div>
        <div class="simple-stage-hint">Record client notification before payment can proceed.</div>
        <div style="margin-bottom:10px">${emailBtnP6a}</div>
        <button class="simple-stamp-btn" onclick="openTsModal('p6a_notif_ts','Client Notified — Approved & SOA','${doc.id}')">Record Notification</button>`;
    } else if (p6bDone && !doc.p6b_notif_ts) {
      const emailBtnP6b = doc.email_sent_p6b_notify
        ? `<button class="btn btn-ghost btn-xs" disabled>✉ Email Sent</button>`
        : !doc.emailVerified
          ? `<button class="btn btn-ghost btn-xs" disabled title="Email not verified">✉ Unverified</button>`
          : `<button class="btn btn-blue-out btn-xs" onclick="openEmailPrev('p6b_notify','${doc.id}')">✉ Preview</button>`;
      stageHtml = `
        <div class="simple-stage-name">Notify Client — Disapproval</div>
        <div class="simple-stage-hint">Record client notification timestamp.</div>
        <div style="margin-bottom:10px">${emailBtnP6b}</div>
        <button class="simple-stamp-btn" style="background:var(--red)" onclick="openTsModal('p6b_notif_ts','Client Notified — Disapproval','${doc.id}')">Record Notification</button>`;
    } else if (p6bDone && doc.p6b_notif_ts && !doc.p6b_return_ts) {
      stageHtml = `
        <div class="simple-stage-name">Return Application to Client</div>
        <div class="simple-stage-hint">Record date and time application was returned.</div>
        <button class="simple-stamp-btn" style="background:var(--red)" onclick="openTsModal('p6b_return_ts','Application Returned (6B)','${doc.id}')">Record Return</button>`;
    } else if (nextStage) {
      stageHtml = `
        <div class="simple-stage-name">${nextStage.label.replace(/& Stamp;/g, "&")}</div>
        <div class="simple-stage-hint">${nextStage.hint || ""}</div>
        <button class="simple-stamp-btn" onclick="openStampFromSimple('${doc.id}','${nextStage.key}')">Stamp</button>`;
    } else {
      stageHtml = `
        <div class="simple-stage-name">All stages recorded</div>
        <div class="simple-stage-hint"></div>
        <button class="simple-stamp-btn done" disabled>✓ Done</button>`;
    }
  }

  body.innerHTML = `
    <div class="simple-context">
      <div class="simple-entity">${esc(doc.entity)}</div>
      <div class="simple-phase">${phase}</div>
      <div class="simple-prog-bar"><div class="simple-prog-fill" style="width:${closed ? 0 : pct}%"></div></div>
      <div class="simple-pct">${closed ? "inc" : pct + "%"}</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px 0">
      ${stageHtml}
    </div>
    <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:16px" onclick="selectSimpleDoc(null)">↩ Change Document</button>`;
}

function openStampFromSimple(docId, key) {
  for (const [track, defs] of Object.entries(TRACK_MAP)) {
    const idx = defs.findIndex((s) => s.key === key);
    if (idx !== -1) {
      if (defs[idx].isCertDecision) {
        openApprovalModal(docId);
        return;
      }
      openStamp(docId, track, idx);
      return;
    }
  }
}

async function confirmSimpleP3Merge(docId) {
  const dt = document.getElementById("simple-p3-dt")?.value;
  if (!dt) {
    toast("Please set a timestamp.", true);
    return;
  }
  if (new Date(dt) > new Date()) {
    toast("Cannot be a future time.", true);
    return;
  }
  const doc = docs.find((d) => d.id === docId);
  const ts = new Date(dt).toISOString();
  setLoading(true, "Confirming Phase 3…");
  try {
    await updateDoc(docId, { p3decision: "compliant", p3mergeTs: ts });
    doc.p3decision = "compliant";
    doc.p3mergeTs = ts;
    renderSidebar();
    renderSimple();
    toast("Phase 3 confirmed — proceeding to Phase 3A.");
  } catch (e) {
    console.error(e);
    toast("Failed to save.", true);
  } finally {
    setLoading(false);
  }
}

async function confirmSimpleP3B(docId) {
  const doc = docs.find((d) => d.id === docId);
  setLoading(true, "Activating Phase 3B…");
  try {
    await updateDoc(docId, { p3decision: "nod" });
    doc.p3decision = "nod";
    renderSidebar();
    renderSimple();
    toast("Phase 3B activated.");
  } catch (e) {
    console.error(e);
    toast("Failed to save.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   METRICS
══════════════════════════════════════════════ */
function renderMetrics() {
  const total = docs.length;
  const complete = docs.filter(isComplete).length;
  const closed = docs.filter(isClosed).length;
  const inProg = total - complete - closed;

  const times = {},
    counts = {};
  docs.forEach((doc) => {
    ALL_STAGES.forEach((s, i) => {
      if (!doc.stages[s.key]) return;
      const ts = doc.stages[s.key].stampedAt;
      let prev = doc.createdAt;
      for (let j = i - 1; j >= 0; j--) {
        const ps = ALL_STAGES[j];
        if (doc.stages[ps.key]) {
          prev = doc.stages[ps.key].stampedAt;
          break;
        }
      }
      const h = workMs(prev, ts) / 3600000;
      times[s.key] = (times[s.key] || 0) + h;
      counts[s.key] = (counts[s.key] || 0) + 1;
    });
  });
  let bnKey = null,
    bnAvg = 0;
  ALL_STAGES.forEach((s) => {
    if (!counts[s.key]) return;
    const avg = times[s.key] / counts[s.key];
    if (avg > bnAvg) {
      bnAvg = avg;
      bnKey = s.key;
    }
  });
  const bnStage = ALL_STAGES.find((s) => s.key === bnKey);
  const maxAvg = Math.max(
    1,
    ...ALL_STAGES.map((s) =>
      counts[s.key] ? times[s.key] / counts[s.key] : 0,
    ),
  );

  const rows = ALL_STAGES.map((s) => {
    const avg = counts[s.key]
      ? (times[s.key] / counts[s.key]).toFixed(1)
      : null;
    const pct = avg ? Math.round((parseFloat(avg) / maxAvg) * 100) : 0;
    const cls =
      bnKey === s.key ? "bar-slow" : pct < 30 ? "bar-fast" : "bar-mid";
    return `<div class="stbl-row">
      <div style="color:var(--muted)">${s.label.replace(/& Stamp;/g, "&")}</div>
      <div style="color:${avg ? "var(--text)" : "var(--dim)"}">${avg ? avg + "h" : "—"}</div>
      <div><div class="bar-bg"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div></div>
      <div style="color:var(--dim)">${counts[s.key] || 0}</div>
    </div>`;
  }).join("");

  $("metricsBody").innerHTML = `
    <div class="ph-hd" style="margin-bottom:18px">Overview</div>
    <div class="m-grid">
      <div class="m-card"><div class="m-lbl">Total Documents</div><div class="m-val m-red-m">${total}</div><div class="m-sub">All records</div></div>
      <div class="m-card"><div class="m-lbl">Complete</div><div class="m-val m-green">${complete}</div><div class="m-sub">Certificate released</div></div>
      <div class="m-card"><div class="m-lbl">Closed (Dead-end)</div><div class="m-val m-red">${closed}</div><div class="m-sub">Returned to applicant</div></div>
    </div>
    <div class="m-grid">
      <div class="m-card"><div class="m-lbl">In Progress</div><div class="m-val">${inProg}</div><div class="m-sub">Active documents</div></div>
      <div class="m-card"><div class="m-lbl">Approved</div><div class="m-val m-green">${docs.filter((d) => d.certOutcome === "approved").length}</div><div class="m-sub">Certificate approved</div></div>
      <div class="m-card"><div class="m-lbl">Disapproved</div><div class="m-val m-red">${docs.filter((d) => d.certOutcome === "disapproved").length}</div><div class="m-sub">Certificate disapproved</div></div>
    </div>
    <div class="ph-hd" style="margin-bottom:14px">Bottleneck Stage</div>
    ${
      bnStage
        ? `<div class="bottleneck"><div class="bn-ic">⚠</div><div><div class="bn-lbl">Slowest Stage</div><div class="bn-stage">${bnStage.label.replace(/& Stamp;/g, "&")}</div><div class="bn-time">Avg: ${bnAvg.toFixed(1)}h working time (Mon–Fri, 8AM–5PM)</div></div></div>`
        : `<div class="bottleneck"><div class="bn-ic">⬡</div><div><div class="bn-lbl">Bottleneck</div><div class="bn-stage" style="color:var(--muted)">No data yet</div></div></div>`
    }
    <div class="ph-hd" style="margin-bottom:14px">Average Time per Stage</div>
    <div class="stage-tbl">
      <div class="stbl-hd"><div>Stage</div><div>Avg (hrs)</div><div>Distribution</div><div>Docs</div></div>
      ${rows || `<div style="padding:16px;text-align:center;font-size:12px;color:var(--dim)">No data yet.</div>`}
    </div>`;
}

/* ══════════════════════════════════════════════
   REDACT
══════════════════════════════════════════════ */
function openRedact(docId, key, label, ts) {
  redactCtx = { docId, key };
  $("redact-name").textContent = label;
  $("redact-hint").textContent = "Stamped: " + ts;
  openOv("ov-redact");
}
async function doRedact() {
  if (!redactCtx) return;
  const doc = docs.find((d) => d.id === redactCtx.docId);
  setLoading(true, "Redacting…");
  try {
    if (redactCtx.tsField) {
      const prev = doc[redactCtx.tsField];
      await redactTsField(redactCtx.docId, redactCtx.tsField, prev);
      doc[redactCtx.tsField] = null;
    } else {
      const prev = doc.stages[redactCtx.key];
      await redactStage(redactCtx.docId, redactCtx.key, prev);
      delete doc.stages[redactCtx.key];
    }
    closeOv("ov-redact");
    redactCtx = null;
    renderSidebar();
    renderDetail();
    toast("Stage redacted — timestamp removed.", true);
  } catch (e) {
    console.error(e);
    toast("Failed to redact.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   DOCUMENTS PAGE
══════════════════════════════════════════════ */
function docsPct(doc) {
  const pa = doc.preassess,
    path = [];
  path.push(...PHASE1A);
  if (pa === "incomplete") path.push(...PHASE1B);
  else if (pa === "complete") {
    path.push(...PHASE2, ...PHASE3_LEGAL, ...PHASE3_TECH, ...PHASE3_FIN);
    if (doc.nod_legal || doc.nod_tech || doc.nod_fin) {
      path.push(...PHASE3B, ...PHASE4B);
    } else if (doc.p3decision === "compliant") {
      path.push(...PHASE3A, ...PHASE4A, ...PHASE5);
      if (doc.certOutcome === "approved")
        path.push(...PHASE5A, ...PHASE6A, ...PHASE7, ...PHASE8);
      else if (doc.certOutcome === "disapproved")
        path.push(...PHASE5B, ...PHASE6B);
    }
  }
  const total = Math.max(path.length, 1);
  const done = path.filter((s) => doc.stages[s.key]).length;
  return Math.round((done / total) * 100);
}

function docsStatusInfo(doc) {
  if (isComplete(doc)) return { txt: "Complete", cls: "dsp-complete" };
  if (isClosed(doc)) return { txt: "Closed", cls: "dsp-closed" };
  if (!doc.preassess) return { txt: "Pending", cls: "dsp-pending" };
  return { txt: "In Progress", cls: "dsp-inprog" };
}

function docsCurrentPhase(doc) {
  if (!doc.preassess) return "—";
  if (isComplete(doc)) return "Phase 8";
  if (isClosed(doc)) {
    if (doc.preassess === "incomplete") return "Phase 1B";
    if (doc.certOutcome === "disapproved") return "Phase 6B";
    return "Phase 4B";
  }
  const label = lastLabel(doc);
  if (!label) return "—";
  const phaseMap = [
    [PHASE1A, "Phase 1A"],
    [PHASE1B, "Phase 1B"],
    [PHASE2, "Phase 2"],
    [PHASE3_LEGAL, "Phase 3"],
    [PHASE3_TECH, "Phase 3"],
    [PHASE3_FIN, "Phase 3"],
    [PHASE3A, "Phase 3A"],
    [PHASE3B, "Phase 3B"],
    [PHASE4A, "Phase 4A"],
    [PHASE4B, "Phase 4B"],
    [PHASE5, "Phase 5"],
    [PHASE5A, "Phase 5A"],
    [PHASE5B, "Phase 5B"],
    [PHASE6A, "Phase 6A"],
    [PHASE6B, "Phase 6B"],
    [PHASE7, "Phase 7"],
    [PHASE8, "Phase 8"],
  ];
  for (const [arr, name] of phaseMap) {
    if (arr.some((s) => s.label === label)) return name;
  }
  return "—";
}

function renderDocsPage() {
  const body = $("docsPageBody");
  if (!body) return;

  let list = [...docs];
  if (docsFilter !== "all") {
    list = list.filter((d) => {
      if (docsFilter === "complete") return isComplete(d);
      if (docsFilter === "closed") return isClosed(d);
      if (docsFilter === "pending")
        return !d.preassess && !isComplete(d) && !isClosed(d);
      if (docsFilter === "inprog")
        return d.preassess && !isComplete(d) && !isClosed(d);
      return true;
    });
  }
  if (docsSearch.trim()) {
    const q = docsSearch.trim().toLowerCase();
    list = list.filter(
      (d) =>
        d.entity.toLowerCase().includes(q) ||
        d.contact.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        (d.remarks || "").toLowerCase().includes(q),
    );
  }
  list.sort((a, b) => {
    switch (docsSort) {
      case "created_desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "created_asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "entity_asc":
        return a.entity.localeCompare(b.entity);
      case "entity_desc":
        return b.entity.localeCompare(a.entity);
      case "progress_desc":
        return docsPct(b) - docsPct(a);
      case "progress_asc":
        return docsPct(a) - docsPct(b);
      default:
        return 0;
    }
  });

  const counts = {
    all: docs.length,
    complete: docs.filter(isComplete).length,
    closed: docs.filter(isClosed).length,
    pending: docs.filter((d) => !d.preassess && !isComplete(d) && !isClosed(d))
      .length,
    inprog: docs.filter((d) => d.preassess && !isComplete(d) && !isClosed(d))
      .length,
  };
  const filterBtns = ["all", "inprog", "complete", "closed", "pending"]
    .map((f) => {
      const labels = {
        all: "All",
        inprog: "In Progress",
        complete: "Complete",
        closed: "Closed",
        pending: "Pending",
      };
      return `<button class="dsp-chip ${docsFilter === f ? "on" : ""}" onclick="docsFilter='${f}';renderDocsPage()">${labels[f]} <span class="dsp-chip-ct">${counts[f]}</span></button>`;
    })
    .join("");

  const thSort = (label, asc, desc) => {
    const active = docsSort === asc || docsSort === desc;
    const arrow = docsSort === asc ? " ↑" : docsSort === desc ? " ↓" : "";
    return `<div class="dsp-th ${active ? "dsp-th-on" : ""}" onclick="docsSort=docsSort==='${asc}'?'${desc}':'${asc}';renderDocsPage()">${label}${arrow}</div>`;
  };

  const rows = list.length
    ? list
        .map((d) => {
          const pct = docsPct(d);
          const { txt, cls } = docsStatusInfo(d);
          const phase = docsCurrentPhase(d);
          const barClr = isComplete(d)
            ? "var(--green)"
            : isClosed(d)
              ? "var(--red)"
              : "var(--blue)";
          const created = new Date(d.createdAt).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return `<div class="dsp-row">
      <div class="dsp-td dsp-td-entity"><div class="dsp-entity">${esc(d.entity)}</div><div class="dsp-sub">${esc(d.contact)} · ${esc(d.email)}</div></div>
      <div class="dsp-td"><span class="dsp-status ${cls}">${txt}</span></div>
      <div class="dsp-td dsp-td-prog">
        <div class="dsp-prog-wrap">
          <div class="dsp-prog-bar"><div class="dsp-prog-fill" style="width:${isClosed(d) ? 0 : pct}%;background:${barClr}"></div></div>
          <span class="dsp-prog-pct">${isClosed(d) ? "inc" : pct + "%"}</span>
        </div>
      </div>
      <div class="dsp-td dsp-td-phase">${phase}</div>
      <div class="dsp-td dsp-td-stage">${esc(lastLabel(d))}</div>
      <div class="dsp-td dsp-td-date">${created}</div>
      <div class="dsp-td dsp-td-act">
        <button class="dsp-open-btn" onclick="docsOpenTracker('${d.id}')" title="Open in Tracker">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </button>
        <button class="dsp-del-btn" onclick="docsConfirmDelete('${d.id}')" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`;
        })
        .join("")
    : `<div class="dsp-empty"><div class="dsp-empty-ic">⬡</div><div>${docsSearch || docsFilter !== "all" ? "No documents match." : "No documents yet."}</div></div>`;

  body.innerHTML = `
    <div class="dsp-toolbar">
      <div class="dsp-search-wrap">
        <svg class="dsp-search-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="dsp-search" type="text" placeholder="Search entity, contact, email…" value="${esc(docsSearch)}" oninput="docsSearch=this.value;renderDocsPage()">
        ${docsSearch ? `<button class="dsp-clear" onclick="docsSearch='';renderDocsPage()">✕</button>` : ""}
      </div>
      <div class="dsp-chips">${filterBtns}</div>
      <div class="dsp-count">${list.length} of ${docs.length}</div>
    </div>
    <div class="dsp-table-wrap">
      <div class="dsp-table">
        <div class="dsp-thead">
          ${thSort("Entity", "entity_asc", "entity_desc")}
          <div class="dsp-th">Status</div>
          ${thSort("Progress", "progress_desc", "progress_asc")}
          <div class="dsp-th">Phase</div>
          <div class="dsp-th">Current Stage</div>
          ${thSort("Created", "created_desc", "created_asc")}
          <div class="dsp-th dsp-th-act"></div>
        </div>
        <div class="dsp-tbody">${rows}</div>
      </div>
    </div>`;
}

function docsOpenTracker(id) {
  selId = id;
  goTo("tracker");
  renderSidebar();
  $("emptyView").style.display = "none";
  $("docDetail").classList.add("vis");
  renderDetail();
}

function docsConfirmDelete(docId) {
  const doc = docs.find((d) => d.id === docId);
  if (!doc) return;
  docsDeleteTarget = docId;
  docsPinEntry = "";
  $("del-doc-name").textContent = doc.entity;
  $("del-pin-dots")
    .querySelectorAll(".pin-dot")
    .forEach((d) => {
      d.classList.remove("filled");
      d.classList.remove("shake");
    });
  $("del-pin-err").textContent = "";
  openOv("ov-doc-delete");
}
function syncDelPinDots() {
  $("del-pin-dots")
    .querySelectorAll(".pin-dot")
    .forEach((d, i) => {
      d.classList.toggle("filled", i < docsPinEntry.length);
      d.classList.remove("shake");
    });
}
function delDocKey(v) {
  if (v === "del") docsPinEntry = docsPinEntry.slice(0, -1);
  else if (docsPinEntry.length < 4) docsPinEntry += v;
  syncDelPinDots();
  if (docsPinEntry.length === 4) delDocCheckPin();
}
async function delDocCheckPin() {
  if (docsPinEntry !== PIN) {
    $("del-pin-dots")
      .querySelectorAll(".pin-dot")
      .forEach((d) => d.classList.add("shake"));
    $("del-pin-err").textContent = "Incorrect PIN.";
    setTimeout(() => {
      docsPinEntry = "";
      syncDelPinDots();
      $("del-pin-err").textContent = "";
    }, 700);
    return;
  }
  setLoading(true, "Deleting document…");
  try {
    await deleteDoc(docsDeleteTarget);
    if (selId === docsDeleteTarget) {
      selId = null;
      $("docDetail").classList.remove("vis");
      $("emptyView").style.display = "";
    }
    docs = docs.filter((d) => d.id !== docsDeleteTarget);
    closeOv("ov-doc-delete");
    docsDeleteTarget = null;
    docsPinEntry = "";
    renderSidebar();
    renderDocsPage();
    toast("Document deleted.");
  } catch (e) {
    console.error(e);
    toast("Failed to delete document.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   MODAL UTILS
══════════════════════════════════════════════ */
function openOv(id) {
  $(id).classList.add("open");
}
function closeOv(id) {
  $(id).classList.remove("open");
  if (id === "ov-stamp" && tsCtx) tsCtx = null;
  if (id === "ov-stamp" && stampCtx) stampCtx = null;
}
document.querySelectorAll(".overlay").forEach((el) =>
  el.addEventListener("click", (e) => {
    if (e.target === el) closeOv(el.id);
  }),
);
function clearErrs(ovId) {
  const m = $(ovId);
  m.querySelectorAll(".ferr").forEach((el) => el.classList.remove("on"));
  m.querySelectorAll(".fi").forEach((el) => el.classList.remove("err"));
}
function markErr(fId, eId) {
  $(fId).classList.add("err");
  $(eId).classList.add("on");
}
document
  .querySelectorAll(".fi")
  .forEach((el) =>
    ["input", "change"].forEach((ev) =>
      el.addEventListener(ev, () => el.classList.remove("err")),
    ),
  );

function openSidebar() {
  document.querySelector(".sidebar").classList.add("open");
  $("sbBackdrop").classList.add("open");
  const mp = document.querySelector(".main-panel");
  if (mp) mp.classList.add("sb-open");
}
function closeSidebar() {
  document.querySelector(".sidebar").classList.remove("open");
  $("sbBackdrop").classList.remove("open");
  const mp = document.querySelector(".main-panel");
  if (mp) mp.classList.remove("sb-open");
}
function toggleSidebar() {
  document.querySelector(".sidebar").classList.contains("open")
    ? closeSidebar()
    : openSidebar();
}

async function markEmailVerified(docId) {
  const doc = docs.find((d) => d.id === docId);
  if (!doc) return;
  setLoading(true, "Updating…");
  try {
    await updateDoc(docId, { emailVerified: true });
    doc.emailVerified = true;
    renderDetail();
    toast("Email marked as verified.");
  } catch (e) {
    console.error(e);
    toast("Failed to update.", true);
  } finally {
    setLoading(false);
  }
}

/* ══════════════════════════════════════════════
   EXPOSE GLOBALS (called from inline HTML onclick)
══════════════════════════════════════════════ */
Object.assign(window, {
  selectSimpleDoc: (id) => { if (id) selDoc(id); else { selId = null; renderSidebar(); } renderSimple(); },
  applyTheme,
  cycleTheme,
  goTo,
  doLock,
  toggleSidebar,
  openSidebar,
  closeSidebar,
  openCreate,
  saveDoc,
  onCbChange,
  openPA,
  pickPA,
  confirmPA,
  setNOD,
  confirmP3Merge,
  openStamp,
  doStamp,
  openTsModal,
  openApprovalModal,
  pickAppr,
  confirmAppr,
  openRedact,
  doRedact,
  openEmailPrev,
  openSummary,
  docsConfirmDelete,
  delDocKey,
  docsOpenTracker,
  renderSimple,
  openStampFromSimple,
  confirmSimpleP3Merge,
  confirmSimpleP3B,
  renderDocsPage,
  closeOv, 
  openOv,
  markEmailVerified,
  applyFont,
  openSettings,
});

/* ══════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════ */
applyTheme(loadThemeCookie());
applyFont(loadFontCookie());   
initData();
