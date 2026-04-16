import { jsPDF } from "jspdf";
import { Report } from "./report.js";
import { CW, ML, MR, PAGE_W } from "./constants.js";
import {
  fmtDate,
  fmtTs,
  durStr,
  workMs,
  cap,
  clean,
  safeFilePart,
  nowLongTs,
} from "./utils.js";

export async function exportSummaryPDF({ doc, events, totalWall, totalWork, maxW, bnLabel }) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const r = new Report(pdf);
  const exportedAt = nowLongTs();

  const statusLabel =
      doc.stages?.p8_scan ? "Complete"
    : doc.preassess === "incomplete" && doc.stages?.p1b_return ? "Closed"
    : doc.certOutcome === "disapproved" && doc.stages?.p6b_recv_odc ? "Closed"
    : doc.p3decision === "nod" && doc.stages?.p4b_cdo_accept ? "Closed"
    : !doc.preassess ? "Pending"
    : "In Progress";

  r.titleBlock("Document Summary", doc.entity, fmtDate(doc.createdAt));

  r.heading("Document Information");
  r.field("Entity Name", doc.entity);
  r.field("Contact Person", doc.contact || "—");
  r.field("Email", doc.email ? `${doc.email}  (${doc.emailVerified ? "verified" : "unverified"})` : "—");
  r.field("Status", statusLabel);
  r.field("Created", fmtTs(doc.createdAt));
  if (doc.remarks) r.field("Remarks", doc.remarks);

  r.heading("Assessment & Decisions");
  r.field("Pre-Assessment", cap(doc.preassess) || "Pending");
  r.field("Pre-Assessment At", fmtTs(doc.paTs));
  const nods = [doc.nod_legal && "Legal", doc.nod_tech && "Technical", doc.nod_fin && "Financial"].filter(Boolean);
  r.field("NOD Issued", nods.length ? nods.join(", ") : "None");

  if (doc.p3decision) {
    r.field("Phase 3 Decision", cap(doc.p3decision));
    r.field("Phase 3 Merge At", fmtTs(doc.p3mergeTs));
  }
  if (doc.certOutcome) {
    r.field("Certificate Decision", doc.certOutcome.toUpperCase());
    r.field("Decision Recorded At", fmtTs(doc.certDecisionTs));
  }

  const hasNotifs = doc.p3b_notif_ts || doc.p3b_return_ts || doc.p6a_notif_ts || doc.p6b_notif_ts || doc.p6b_return_ts;
  if (hasNotifs) {
    r.heading("Notification & Return Timestamps");
    if (doc.p3b_notif_ts) r.field("Notified — Phase 3B", fmtTs(doc.p3b_notif_ts));
    if (doc.p3b_return_ts) r.field("Returned — Phase 3B", fmtTs(doc.p3b_return_ts));
    if (doc.p6a_notif_ts) r.field("Client Notified (Approved)", fmtTs(doc.p6a_notif_ts));
    if (doc.p6b_notif_ts) r.field("Client Notified (Disapproval)", fmtTs(doc.p6b_notif_ts));
    if (doc.p6b_return_ts) r.field("Returned — Phase 6B", fmtTs(doc.p6b_return_ts));
  }

  r.heading("Time Statistics");
  r.field("Total Elapsed Time", totalWall > 0 ? durStr(totalWall) : "In progress");
  r.field("Total Working Time", totalWork > 0 ? durStr(totalWork) : "In progress");
  r.field("Working Hours", "Mon – Fri, 08:00 – 17:00");
  r.field("Slowest Stage", bnLabel || "—");
  if (maxW > 0) r.field("Slowest Stage Duration", `${durStr(maxW)} working time`);
  r.field("Events Recorded", String((events?.length ?? 1) - 1));

  if (events && events.length > 1) {
    r.heading("Stage-by-Stage Breakdown");
    const wallTimes = events.map((ev, i) => (i === 0 ? 0 : new Date(ev.ts) - new Date(events[i - 1].ts)));
    const maxWall = Math.max(...wallTimes.slice(1));

    const stageRows = events.map((ev, i) => {
      const wall = wallTimes[i];
      const wk = i === 0 ? 0 : workMs(events[i - 1].ts, ev.ts);
      return {
        _slowest: i > 0 && wall === maxWall,
        _init: i === 0,
        label: clean(ev.label || ev.phase || "—"),
        ts: fmtTs(ev.ts),
        wall: i === 0 ? "—" : durStr(wall),
        work: i === 0 ? "—" : durStr(wk),
        phase: ev.phase || "—",
      };
    });

    r.table(
      [
        { header: "Stage / Event", key: "label", w: 74, bold: true },
        { header: "Timestamp", key: "ts", w: 52, gray: true },
        { header: "Elapsed", key: "wall", w: 24, align: "right" },
        { header: "Work Time", key: "work", w: 24, align: "right" },
        { header: "Phase", key: "phase", w: 8, gray: true },
      ],
      stageRows,
    );

    const p = pdf;
    r.need(9);
    p.setFillColor(220, 220, 220);
    p.rect(ML, r.y, CW, 7.5, "F");
    p.setFontSize(8.5);
    p.setFont("helvetica", "bold");
    p.setTextColor(0);
    p.text("TOTAL", ML + 1.5, r.y + 5);
    p.text(durStr(totalWall), PAGE_W - MR - 32, r.y + 5, { align: "right" });
    p.text(durStr(totalWork), PAGE_W - MR - 8, r.y + 5, { align: "right" });
    r.y += 9;
  }

  r.footer(exportedAt);
  pdf.save(`summary_${safeFilePart(doc.entity)}_${Date.now()}.pdf`);
}
