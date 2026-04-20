/* ══════════════════════════════════════════════
   FONTS — typography presets + size scale
   ══════════════════════════════════════════════ */

export const FONTS = {
  modern:    { body: "Helvetica, Arial, sans-serif",  heading: "Helvetica, Arial, sans-serif" },
  classic:   { body: "'EB Garamond', Georgia, serif", heading: "'EB Garamond', Georgia, serif" },
  technical: { body: "'DM Mono', monospace",          heading: "'Fraunces', serif" },
};

export const FONT_SIZES = [
  { label: "XS", px: "12px" },
  { label: "S",  px: "14px" },
  { label: "M",  px: "16px" },
  { label: "L",  px: "18px" },
  { label: "XL", px: "21px" },
];

export function getCookie(key) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + key + "=([^;]*)"));
  return m ? m[1] : null;
}

export function setCookie(key, val) {
  document.cookie = `${key}=${val};path=/;max-age=31536000`;
}

export function applyFont(name) {
  const f = FONTS[name] || FONTS.technical;
  document.documentElement.style.setProperty("--font-body", f.body);
  document.documentElement.style.setProperty("--font-heading", f.heading);
  document.body.style.fontFamily = f.body;
  document
    .querySelectorAll(".font-opt")
    .forEach((el) => el.classList.toggle("on", el.id === "font-" + name));
  setCookie("font", name);
}

export function applyFontSize(val) {
  const idx = Math.max(0, Math.min(4, parseInt(val)));
  const scales = [0.82, 0.91, 1, 1.1, 1.22];
  const labels = ["XS", "S", "M", "L", "XL"];

  const onPin = document.getElementById("pg-pin")?.classList.contains("active");
  const onEmpty = document.querySelector(".empty-view")?.offsetParent !== null;

  document.body.style.zoom = onPin || onEmpty ? 1 : scales[idx];

  const labelEl = document.getElementById("fsize-label");
  if (labelEl) labelEl.textContent = labels[idx];

  const slider = document.getElementById("fsize-slider");
  if (slider) {
    slider.value = idx;
    const pct = (idx / 4) * 100;
    slider.style.background =
      `linear-gradient(to right, var(--red) ${pct}%, var(--b2) ${pct}%)`;
  }

  setCookie("fsize", idx);
}

export function loadAppearance() {
  applyFont(getCookie("font") ?? "technical");
  applyFontSize(getCookie("fsize") ?? "2");
}
