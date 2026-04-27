/**
 * pdfExport.js
 * Clean, reliable PDF export using jsPDF.
 * Fixed-column tables, proper line height, no overlapping text.
 */

/* ── lazy-load jsPDF from CDN ─────────────────────────────────────── */
let _jsPDF = null;
async function getJsPDF() {
  if (_jsPDF) return _jsPDF;
  if (window.jspdf?.jsPDF) { _jsPDF = window.jspdf.jsPDF; return _jsPDF; }
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  _jsPDF = window.jspdf.jsPDF;
  return _jsPDF;
}

/* ── constants ────────────────────────────────────────────────────── */
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 14;          // margin left
const MR = 14;          // margin right
const MT = 18;          // margin top
const MB = 18;          // margin bottom (footer clearance)
const CW = PAGE_W - ML - MR;   // 182mm usable width
const LINE_H = 5.2;    // standard line height (mm)


/* ── formatters ───────────────────────────────────────────────────── */
function fmtTs(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    month: "short", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short", day: "2-digit", year: "numeric",
  });
}
function durStr(ms) {
  if (!ms || ms <= 0) return "—";
  const m = Math.round(ms / 60000), h = Math.floor(m / 60), min = m % 60;
  if (h === 0) return `${min}m`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}m`;
}
function workMs(a, b) {
  if (!a || !b) return 0;
  let s = new Date(a), e = new Date(b), ms = 0;
  if (e <= s) return 0;
  let c = new Date(s);
  while (c < e) {
    const d = c.getDay();
    if (d >= 1 && d <= 5) {
      const ws = new Date(c); ws.setHours(8, 0, 0, 0);
      const we = new Date(c); we.setHours(17, 0, 0, 0);
      const ss = c < ws ? ws : c, se = e < we ? e : we;
      if (se > ss) ms += se - ss;
    }
    c = new Date(c); c.setHours(0, 0, 0, 0); c.setDate(c.getDate() + 1);
  }
  return ms;
}
function cap(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function clean(str) {
  return (str || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

/* ══════════════════════════════════════════════════════════════════
   Report class — layout engine
══════════════════════════════════════════════════════════════════ */
class Report {
  constructor(pdf) {
    this.pdf = pdf;
    this.y = MT;
    this.pageNum = 1;
  }

  /* Returns true and adds a new page if `needed` mm won't fit */
  need(mm) {
    if (this.y + mm > PAGE_H - MB) {
      this.pdf.addPage();
      this.y = MT;
      this.pageNum++;
      return true;
    }
    return false;
  }

  gap(mm = 3) { this.y += mm; }

  /* Horizontal rule */
  rule(weight = 0.3, gray = 0) {
    const p = this.pdf;
    p.setDrawColor(gray);
    p.setLineWidth(weight);
    p.line(ML, this.y, PAGE_W - MR, this.y);
    p.setDrawColor(0);
    this.y += 1;
  }

  /* Thin separator between table rows */
  rowRule() {
    const p = this.pdf;
    p.setDrawColor(200);
    p.setLineWidth(0.1);
    p.line(ML, this.y, PAGE_W - MR, this.y);
    p.setDrawColor(0);
    this.y += 0.8;
  }

  /* ── Title block at top of first page ── */
  titleBlock(title, sub, dateMeta) {
    const p = this.pdf;

    // Eyebrow
    p.setFontSize(7.5);
    p.setFont("helvetica", "normal");
    p.setTextColor(120);
    p.text("NATIONAL TELECOMMUNICATIONS COMMISSION", ML, this.y);
    p.text(dateMeta || "", PAGE_W - MR, this.y, { align: "right" });
    this.y += 4.5;

    // Title
    p.setFontSize(18);
    p.setFont("helvetica", "bold");
    p.setTextColor(0);
    p.text(title, ML, this.y);
    this.y += 7;

    // Subtitle
    if (sub) {
      p.setFontSize(9);
      p.setFont("helvetica", "normal");
      p.setTextColor(80);
      p.text(sub, ML, this.y);
      this.y += 5;
    }

    // Heavy rule under title
    p.setDrawColor(0);
    p.setLineWidth(0.8);
    p.line(ML, this.y, PAGE_W - MR, this.y);
    p.setLineWidth(0.3);
    p.line(ML, this.y + 1.2, PAGE_W - MR, this.y + 1.2);
    this.y += 5;
  }

  /* ── Section heading ── */
  heading(text) {
    this.need(14);
    this.gap(4);
    const p = this.pdf;

    // Light background band via rect
    p.setFillColor(240, 240, 240);
    p.rect(ML, this.y - 1, CW, 7, "F");

    p.setFontSize(8);
    p.setFont("helvetica", "bold");
    p.setTextColor(0);
    p.text(text.toUpperCase(), ML + 2, this.y + 4);
    this.y += 9;
  }

  /* ── Key-value pair (two-column field line) ──
     label: left column (fixed width)
     value: right column (wraps if long)
     Returns the height consumed so caller can use it.
  */
  field(label, value, labelW = 58) {
    const valW = CW - labelW - 2;
    const p = this.pdf;
    const valStr = String(value ?? "—");
    const lines = p.splitTextToSize(valStr, valW);
    const rowH = Math.max(lines.length * LINE_H, LINE_H) + 1.5;

    this.need(rowH + 1);

    p.setFontSize(8.5);
    p.setFont("helvetica", "bold");
    p.setTextColor(60);
    p.text(label, ML, this.y + LINE_H - 1.5);

    p.setFont("helvetica", "normal");
    p.setTextColor(0);
    p.text(lines, ML + labelW, this.y + LINE_H - 1.5);

    this.y += rowH;
  }

  /* ── Table ──
     cols: [{ header, key|fn, w (mm), align? }]
     rows: array of data objects
     Each col.w must sum to CW.
  */
  table(cols, rows, _opts = {}) {
    const p = this.pdf;
    const ROW_PAD = 1.5; // vertical padding inside each cell

    // Validate column widths sum (debug helper — remove in prod)
    // const sum = cols.reduce((a,c)=>a+c.w,0);
    // console.assert(Math.abs(sum-CW)<1, `cols sum ${sum} != CW ${CW}`);

    // ── Header row ──
    this.need(10);
    let x = ML;

    // Header background
    p.setFillColor(30, 30, 30);
    p.rect(ML, this.y, CW, 7, "F");

    p.setFontSize(7.5);
    p.setFont("helvetica", "bold");
    p.setTextColor(255);
    cols.forEach(col => {
      const align = col.align || "left";
      const tx = align === "right"  ? x + col.w - 1.5
               : align === "center" ? x + col.w / 2
               : x + 1.5;
      p.text(col.header, tx, this.y + 4.8, { align });
      x += col.w;
    });
    this.y += 8;
    p.setTextColor(0);

    // ── Data rows ──
    rows.forEach((row, rowIdx) => {
      // Measure max height for this row (any cell may wrap)
      let maxLines = 1;
      cols.forEach(col => {
        const raw = typeof col.fn === "function" ? col.fn(row) : row[col.key] ?? "—";
        const str = String(raw);
        const lines = p.splitTextToSize(clean(str), col.w - 3);
        if (lines.length > maxLines) maxLines = lines.length;
      });
      const rowH = maxLines * LINE_H + ROW_PAD * 2;

      this.need(rowH + 1);

      // Alternating row fill
      if (rowIdx % 2 === 0) {
        p.setFillColor(248, 248, 248);
        p.rect(ML, this.y, CW, rowH, "F");
      }

      // Cells
      x = ML;
      p.setFontSize(8);
      cols.forEach(col => {
        const raw = typeof col.fn === "function" ? col.fn(row) : row[col.key] ?? "—";
        const str = clean(String(raw));
        const lines = p.splitTextToSize(str, col.w - 3);
        const align = col.align || "left";
        const tx = align === "right"  ? x + col.w - 1.5
                 : align === "center" ? x + col.w / 2
                 : x + 1.5;

        // Bold first column if flagged
        p.setFont("helvetica", col.bold ? "bold" : "normal");
        p.setTextColor(col.gray ? 100 : 0);
        p.text(lines, tx, this.y + ROW_PAD + LINE_H - 1, { align });
        x += col.w;
      });

      this.y += rowH;

      // Row separator
      p.setDrawColor(220);
      p.setLineWidth(0.1);
      p.line(ML, this.y, PAGE_W - MR, this.y);
      p.setDrawColor(0);
    });

    this.gap(2);
  }

  /* ── Footer on every page ── */
  footer(exportedAt) {
    const p = this.pdf;
    const total = p.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      p.setPage(i);
      p.setDrawColor(0);
      p.setLineWidth(0.3);
      p.line(ML, PAGE_H - 14, PAGE_W - MR, PAGE_H - 14);
      p.setFontSize(7);
      p.setFont("helvetica", "normal");
      p.setTextColor(120);
      p.text(`NTC Document Tracker  ·  Exported: ${exportedAt}`, ML, PAGE_H - 10);
      p.text(`${i} / ${total}`, PAGE_W - MR, PAGE_H - 10, { align: "right" });
    }
  }
}


/* ══════════════════════════════════════════════════════════════════
   EXPORT: DOCUMENT SUMMARY
══════════════════════════════════════════════════════════════════ */
export async function exportSummaryPDF({ doc, events, totalWall, totalWork, maxW, bnLabel }) {
  const jsPDF = await getJsPDF();
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const r = new Report(pdf);

  const exportedAt = new Date().toLocaleString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const statusLabel =
      doc.stages?.p8_scan                                           ? "Complete"
    : doc.preassess === "incomplete" && doc.stages?.p1b_return      ? "Closed"
    : doc.certOutcome === "disapproved" && doc.stages?.p6b_recv_odc ? "Closed"
    : doc.p3decision === "nod" && doc.stages?.p4b_cdo_accept        ? "Closed"
    : !doc.preassess                                                 ? "Pending"
    : "In Progress";

  /* ── Title ── */
  r.titleBlock(
    "Document Summary",
    doc.entity,
    fmtDate(doc.createdAt)
  );

  /* ── Document Information ── */
  r.heading("Document Information");
  r.field("Entity Name",    doc.entity);
  r.field("Contact Person", doc.contact || "—");
  r.field("Email",          doc.email
    ? `${doc.email}  (${doc.emailVerified ? "verified" : "unverified"})`
    : "—");
  r.field("Status",         statusLabel);
  r.field("Created",        fmtTs(doc.createdAt));
  if (doc.remarks) r.field("Remarks", doc.remarks);

  /* ── Assessment & Decisions ── */
  r.heading("Assessment & Decisions");
  r.field("Pre-Assessment",    cap(doc.preassess) || "Pending");
  r.field("Pre-Assessment At", fmtTs(doc.paTs));

  const nods = [doc.nod_legal && "Legal", doc.nod_tech && "Technical", doc.nod_fin && "Financial"].filter(Boolean);
  r.field("NOD Issued",       nods.length ? nods.join(", ") : "None");

  if (doc.p3decision) {
    r.field("Phase 3 Decision", cap(doc.p3decision));
    r.field("Phase 3 Merge At", fmtTs(doc.p3mergeTs));
  }
  if (doc.certOutcome) {
    r.field("Certificate Decision", doc.certOutcome.toUpperCase());
    r.field("Decision Recorded At", fmtTs(doc.certDecisionTs));
  }

  /* ── Notifications (conditional) ── */
  const hasNotifs = doc.p3b_notif_ts || doc.p3b_return_ts
    || doc.p6a_notif_ts || doc.p6b_notif_ts || doc.p6b_return_ts;

  if (hasNotifs) {
    r.heading("Notification & Return Timestamps");
    if (doc.p3b_notif_ts)  r.field("Notified — Phase 3B",       fmtTs(doc.p3b_notif_ts));
    if (doc.p3b_return_ts) r.field("Returned — Phase 3B",        fmtTs(doc.p3b_return_ts));
    if (doc.p6a_notif_ts)  r.field("Client Notified (Approved)", fmtTs(doc.p6a_notif_ts));
    if (doc.p6b_notif_ts)  r.field("Client Notified (Disapproval)", fmtTs(doc.p6b_notif_ts));
    if (doc.p6b_return_ts) r.field("Returned — Phase 6B",        fmtTs(doc.p6b_return_ts));
  }

  /* ── Time Statistics ── */
  r.heading("Time Statistics");
  r.field("Total Elapsed Time",  totalWall > 0 ? durStr(totalWall) : "In progress");
  r.field("Total Working Time",  totalWork > 0 ? durStr(totalWork) : "In progress");
  r.field("Working Hours",       "Mon – Fri, 08:00 – 17:00");
  r.field("Slowest Stage",       bnLabel || "—");
  if (maxW > 0) r.field("Slowest Stage Duration", durStr(maxW) + " working time");
  r.field("Events Recorded",     String((events?.length ?? 1) - 1));

  /* ── Stage-by-Stage Breakdown ── */
  if (events && events.length > 1) {
    r.heading("Stage-by-Stage Breakdown");

    // Pre-compute wall times to find the slowest
    const wallTimes = events.map((ev, i) =>
      i === 0 ? 0 : new Date(ev.ts) - new Date(events[i - 1].ts)
    );
    const maxWall = Math.max(...wallTimes.slice(1));

    // Build rows for the table
    const stageRows = events.map((ev, i) => {
      const wall = wallTimes[i];
      const wk   = i === 0 ? 0 : workMs(events[i - 1].ts, ev.ts);
      return {
        _slowest: i > 0 && wall === maxWall,
        _init:    i === 0,
        label:    clean(ev.label || ev.phase || "—"),
        ts:       fmtTs(ev.ts),
        wall:     i === 0 ? "—" : durStr(wall),
        work:     i === 0 ? "—" : durStr(wk),
        phase:    ev.phase || "—",
      };
    });

    // Stage breakdown table
    // Cols must sum to CW (182mm)
    r.table(
      [
        { header: "Stage / Event", key: "label", w: 74,  bold: true },
        { header: "Timestamp",     key: "ts",    w: 52,  gray: true },
        { header: "Elapsed",       key: "wall",  w: 24,  align: "right" },
        { header: "Work Time",     key: "work",  w: 24,  align: "right" },
        { header: "Phase",         key: "phase", w: 8,   gray: true },
      ],
      stageRows,
    );

    // Totals row
    const p = pdf;
    r.need(9);
    p.setFillColor(220, 220, 220);
    p.rect(ML, r.y, CW, 7.5, "F");
    p.setFontSize(8.5); p.setFont("helvetica", "bold"); p.setTextColor(0);
    p.text("TOTAL", ML + 1.5, r.y + 5);
    p.text(durStr(totalWall), PAGE_W - MR - 32, r.y + 5, { align: "right" });
    p.text(durStr(totalWork), PAGE_W - MR - 8,  r.y + 5, { align: "right" });
    r.y += 9;
  }

  r.footer(exportedAt);
  pdf.save(`summary_${doc.entity.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.pdf`);
}


/* ══════════════════════════════════════════════════════════════════
   EXPORT: METRICS REPORT
══════════════════════════════════════════════════════════════════ */
export async function exportMetricsPDF({ docs, ALL_STAGES, isComplete, isClosed }) {
  const jsPDF = await getJsPDF();
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const r = new Report(pdf);

  const exportedAt = new Date().toLocaleString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  /* ── Aggregates ── */
  const total       = docs.length;
  const complete    = docs.filter(isComplete).length;
  const closed      = docs.filter(isClosed).length;
  const inProg      = docs.filter(d => d.preassess && !isComplete(d) && !isClosed(d)).length;
  const pending     = docs.filter(d => !d.preassess && !isComplete(d) && !isClosed(d)).length;
  const approved    = docs.filter(d => d.certOutcome === "approved").length;
  const disapproved = docs.filter(d => d.certOutcome === "disapproved").length;
  const withNOD     = docs.filter(d => d.nod_legal || d.nod_tech || d.nod_fin).length;
  const compRate    = total > 0 ? ((complete / total) * 100).toFixed(1) : "0.0";

  /* ── Title ── */
  r.titleBlock(
    "Metrics Report",
    `${total} document${total !== 1 ? "s" : ""} tracked`,
    fmtDate(new Date().toISOString())
  );

  /* ── Overview ── */
  r.heading("Overview");
  r.field("Total Documents",    String(total));
  r.field("Complete",           `${complete}  (${compRate}% completion rate)`);
  r.field("In Progress",        String(inProg));
  r.field("Pending",            `${pending}  (no pre-assessment)`);
  r.field("Closed",             `${closed}  (dead-end paths)`);
  r.field("Approved",           String(approved));
  r.field("Disapproved",        String(disapproved));
  r.field("NOD Issued",         String(withNOD));

  /* ── Stage Bottleneck Analysis ── */
  const times = {}, counts = {};
  docs.forEach(doc => {
    ALL_STAGES.forEach((s, i) => {
      if (!doc.stages?.[s.key]) return;
      const ts = doc.stages[s.key].stampedAt;
      let prev = doc.createdAt;
      for (let j = i - 1; j >= 0; j--) {
        if (doc.stages?.[ALL_STAGES[j].key]) {
          prev = doc.stages[ALL_STAGES[j].key].stampedAt;
          break;
        }
      }
      const h = workMs(prev, ts) / 3600000;
      times[s.key]  = (times[s.key]  || 0) + h;
      counts[s.key] = (counts[s.key] || 0) + 1;
    });
  });

  const stagesWithData = ALL_STAGES
    .filter(s => counts[s.key])
    .map(s => ({
      label: s.label,
      avg:   times[s.key] / counts[s.key],
      total: times[s.key],
      count: counts[s.key],
    }))
    .sort((a, b) => b.avg - a.avg);

  if (stagesWithData.length > 0) {
    r.heading("Stage Processing Time — Slowest to Fastest");

    // Tag slowest/fastest
    const tagged = stagesWithData.map((s, i) => ({
      ...s,
      note: i === 0 ? "SLOWEST"
          : i === stagesWithData.length - 1 ? "fastest"
          : "—",
      avgFmt:   s.avg.toFixed(2) + " h",
      totalFmt: s.total.toFixed(1) + " h",
      countFmt: String(s.count),
    }));

    // Cols: 182mm total
    r.table(
      [
        { header: "Stage",       key: "label",    w: 100 },
        { header: "Avg (hrs)",   key: "avgFmt",   w: 22, align: "right" },
        { header: "Total (hrs)", key: "totalFmt", w: 22, align: "right" },
        { header: "# Docs",      key: "countFmt", w: 20, align: "right" },
        { header: "Note",        key: "note",     w: 18, gray: true },
      ],
      tagged,
    );
  }

  /* ── Document List ── */
  r.heading("Document List");

  const resolvePhase = (d) => {
    if (!d.preassess) return "—";
    if (isComplete(d)) return "Ph 8";
    if (isClosed(d)) {
      if (d.preassess === "incomplete")       return "Ph 1B";
      if (d.certOutcome === "disapproved")    return "Ph 6B";
      return "Ph 4B";
    }
    const phaseKeys = [
      [["p8_recv_client","p8_release","p8_scan"],                                           "Ph 8"],
      [["p7_payment"],                                                                       "Ph 7"],
      [["p6b_recv_odc"],                                                                     "Ph 6B"],
      [["p6a_recv_dir"],                                                                     "Ph 6A"],
      [["p5b_chief_nod","p5b_dir_review","p5b_odc_issue"],                                  "Ph 5B"],
      [["p5a_eng_soa","p5a_chief_soa","p5a_dir_soa"],                                       "Ph 5A"],
      [["p5_receipt"],                                                                       "Ph 5"],
      [["p4b_cdo_accept"],                                                                   "Ph 4B"],
      [["p4a_cdo_accept","p4a_eng_briefer","p4a_chief_review","p4a_dir_rec","p4a_odc"],     "Ph 4A"],
      [["p3b_nod","p3b_endorse"],                                                            "Ph 3B"],
      [["p3a_endorse"],                                                                      "Ph 3A"],
      [["p3_legal_recv","p3_legal_back","p3_tech_recv","p3_tech_back","p3_fin_recv","p3_fin_back"], "Ph 3"],
      [["p2_cdo_scan","p2_cdo_route"],                                                       "Ph 2"],
      [["p1a_eng_accept"],                                                                   "Ph 1A"],
    ];
    for (const [keys, label] of phaseKeys)
      if (keys.some(k => d.stages?.[k])) return label;
    return "—";
  };

  const docRows = [...docs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(d => {
      const doneCt = ALL_STAGES.filter(s => d.stages?.[s.key]).length;
      const pct = isComplete(d) ? "100%"
                : isClosed(d)   ? "cls"
                : `${Math.round((doneCt / Math.max(ALL_STAGES.length, 1)) * 100)}%`;
      return {
        entity:  d.entity,
        status:  isComplete(d) ? "Complete"
               : isClosed(d)   ? "Closed"
               : !d.preassess  ? "Pending"
               : "In Progress",
        phase:   resolvePhase(d),
        pct,
        cert:    d.certOutcome ? cap(d.certOutcome) : "—",
        created: fmtDate(d.createdAt),
      };
    });

  // Cols: 182mm total
  r.table(
    [
      { header: "Entity",      key: "entity",  w: 68 },
      { header: "Status",      key: "status",  w: 26 },
      { header: "Phase",       key: "phase",   w: 18, align: "center" },
      { header: "Progress",    key: "pct",     w: 18, align: "right" },
      { header: "Certificate", key: "cert",    w: 22, align: "center" },
      { header: "Created",     key: "created", w: 30, gray: true },
    ],
    docRows,
  );

  r.footer(exportedAt);
  pdf.save(`metrics_report_${Date.now()}.pdf`);
}