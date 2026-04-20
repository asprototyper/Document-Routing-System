/* ══════════════════════════════════════════════
   DOC STATUS — pure derivations from a document
   ══════════════════════════════════════════════ */

import { ALL_STAGES } from "./config/stages.js";

export function isComplete(doc) {
  return !!doc.stages["p8_scan"];
}

export function isClosed(doc) {
  const p1bClosed =
    doc.preassess === "incomplete" && !!doc.stages["p1b_return"];
  const p4bClosed =
    (doc.nod_legal || doc.nod_tech || doc.nod_fin) &&
    !!doc.p3b_notif_ts &&
    !!doc.p3b_return_ts;
  const p6bClosed =
    doc.certOutcome === "disapproved" &&
    !!doc.p6b_notif_ts &&
    !!doc.p6b_return_ts;
  return p1bClosed || p4bClosed || p6bClosed;
}

export function docBadge(doc) {
  if (isComplete(doc))
    return `<span class="badge bdg-complete">Complete</span>`;
  if (isClosed(doc)) return `<span class="badge bdg-closed">Closed</span>`;
  if (!doc.preassess) return `<span class="badge bdg-prog">Pending</span>`;
  return `<span class="badge bdg-prog">In Progress</span>`;
}

export function lastLabel(doc) {
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
