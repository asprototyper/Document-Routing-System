/* ══════════════════════════════════════════════
   THEMES — colour palettes + logo variants
   ══════════════════════════════════════════════ */

export const THEMES = {
  dark: {
    "--bg": "#0f0e0c",
    "--s1": "#1a1916",
    "--s2": "#242220",
    "--s3": "#2e2b27",
    "--b1": "#2e2c29",
    "--b2": "#3a3835",
    "--red": "#be2a2a",
    "--red-h": "#a92626",
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
    "--red": "#d11414",
    "--red-h": "#8f060d",
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

export const LOGOS = {
  dark: "img/ntc-logo-dark.png",
  light: "img/ntc-logo-light.png",
  slate: "img/ntc-logo-slate.png",
  warm: "img/ntc-logo-warm.png",
};

export const LOGOS2 = {
  dark: "img/ntc-logo2-dark.png",
  light: "img/ntc-logo2-light.png",
  slate: "img/ntc-logo2-slate.png",
  warm: "img/ntc-logo2-warm.png",
};

export function applyTheme(name) {
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

export function loadThemeCookie() {
  const m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
  return m ? m[1] : "light";
}

const _themeOrder = ["light", "dark", "slate", "warm"];

export function cycleTheme() {
  const cur = document.querySelector(".theme-btn.on")?.dataset.theme || "light";
  const next = _themeOrder[(_themeOrder.indexOf(cur) + 1) % _themeOrder.length];
  applyTheme(next);
}
