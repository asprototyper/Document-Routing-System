import { jsPDF } from "jspdf";
import { Report } from "./report.js";
import { cap, durStr, fmtDate, nowLongTs, workMs } from "./utils.js";

function resolvePhase(d, isComplete, isClosed) {
  if (!d.preassess) return "—";
  if (isComplete(d)) return "Ph 8";
  if (isClosed(d)) {
    if (d.preassess === "incomplete") return "Ph 1B";
    if (d.certOutcome === "disapproved") return "Ph 6B";
    return "Ph 4B";
  }

  const phaseKeys = [
    [["p8_recv_client", "p8_release", "p8_scan"], "Ph 8"],
    [["p7_payment"], "Ph 7"],
    [["p6b_recv_odc"], "Ph 6B"],
    [["p6a_recv_dir"], "Ph 6A"],
    [["p5b_chief_nod", "p5b_dir_review", "p5b_odc_issue"], "Ph 5B"],
    [["p5a_eng_soa", "p5a_chief_soa", "p5a_dir_soa"], "Ph 5A"],
    [["p5_receipt"], "Ph 5"],
    [["p4b_cdo_accept"], "Ph 4B"],
    [["p4a_cdo_accept", "p4a_eng_briefer", "p4a_chief_review", "p4a_dir_rec", "p4a_odc"], "Ph 4A"],
    [["p3b_nod", "p3b_endorse"], "Ph 3B"],
    [["p3a_endorse"], "Ph 3A"],
    [["p3_legal_recv", "p3_legal_back", "p3_tech_recv", "p3_tech_back", "p3_fin_recv", "p3_fin_back"], "Ph 3"],
    [["p2_cdo_scan", "p2_cdo_route"], "Ph 2"],
    [["p1a_eng_accept"], "Ph 1A"],
  ];
  for (const [keys, label] of phaseKeys) {
    if (keys.some((k) => d.stages?.[k])) return label;
  }
  return "—";
}

export async function exportMetricsPDF({ docs, ALL_STAGES, isComplete, isClosed }) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const r = new Report(pdf);
  const exportedAt = nowLongTs();

  const total = docs.length;
  const complete = docs.filter(isComplete).length;
  const closed = docs.filter(isClosed).length;
  const inProg = docs.filter((d) => d.preassess && !isComplete(d) && !isClosed(d)).length;
  const pending = docs.filter((d) => !d.preassess && !isComplete(d) && !isClosed(d)).length;
  const approved = docs.filter((d) => d.certOutcome === "approved").length;
  const disapproved = docs.filter((d) => d.certOutcome === "disapproved").length;
  const withNOD = docs.filter((d) => d.nod_legal || d.nod_tech || d.nod_fin).length;
  const compRate = total > 0 ? ((complete / total) * 100).toFixed(1) : "0.0";

  r.titleBlock(
    "Metrics Report",
    `${total} document${total !== 1 ? "s" : ""} tracked`,
    fmtDate(new Date().toISOString()),
    {
      topPad: 1.5,
      eyebrowToTitle: 6.5,
      titleToSubtitle: 6.5,
      subtitleToRule: 5.5,
      afterRuleGap: 7,
    },
  );

  r.heading("Overview");
  r.field("Total Documents", String(total));
  r.field("Complete", `${complete}  (${compRate}% completion rate)`);
  r.field("In Progress", String(inProg));
  r.field("Pending", `${pending}  (no pre-assessment)`);
  r.field("Closed", `${closed}  (dead-end paths)`);
  r.field("Approved", String(approved));
  r.field("Disapproved", String(disapproved));
  r.field("NOD Issued", String(withNOD));

  const times = {};
  const counts = {};
  docs.forEach((doc) => {
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
      times[s.key] = (times[s.key] || 0) + h;
      counts[s.key] = (counts[s.key] || 0) + 1;
    });
  });

  const stagesWithData = ALL_STAGES
    .filter((s) => counts[s.key])
    .map((s) => ({
      label: s.label,
      avg: times[s.key] / counts[s.key],
      total: times[s.key],
      count: counts[s.key],
    }))
    .sort((a, b) => b.avg - a.avg);

  if (stagesWithData.length > 0) {
    r.heading("Stage Processing Time — Slowest to Fastest");
    const tagged = stagesWithData.map((s, i) => ({
      ...s,
      note: i === 0 ? "SLOWEST" : i === stagesWithData.length - 1 ? "fastest" : "—",
      avgFmt: `${s.avg.toFixed(2)} h`,
      totalFmt: `${s.total.toFixed(1)} h`,
      countFmt: String(s.count),
    }));

    r.table(
      [
        { header: "Stage", key: "label", w: 100 },
        { header: "Avg (hrs)", key: "avgFmt", w: 22, align: "right" },
        { header: "Total (hrs)", key: "totalFmt", w: 22, align: "right" },
        { header: "# Docs", key: "countFmt", w: 20, align: "right" },
        { header: "Note", key: "note", w: 18, gray: true },
      ],
      tagged,
    );
  }

  r.heading("Document List");
  const docRows = [...docs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((d) => {
      const doneCt = ALL_STAGES.filter((s) => d.stages?.[s.key]).length;
      const pct = isComplete(d) ? "100%" : isClosed(d) ? "cls" : `${Math.round((doneCt / Math.max(ALL_STAGES.length, 1)) * 100)}%`;
      return {
        entity: d.entity,
        status: isComplete(d) ? "Complete" : isClosed(d) ? "Closed" : !d.preassess ? "Pending" : "In Progress",
        phase: resolvePhase(d, isComplete, isClosed),
        pct,
        cert: d.certOutcome ? cap(d.certOutcome) : "—",
        created: fmtDate(d.createdAt),
      };
    });

  r.table(
    [
      { header: "Entity", key: "entity", w: 68 },
      { header: "Status", key: "status", w: 26 },
      { header: "Phase", key: "phase", w: 18, align: "center" },
      { header: "Progress", key: "pct", w: 18, align: "right" },
      { header: "Certificate", key: "cert", w: 22, align: "center" },
      { header: "Created", key: "created", w: 30, gray: true },
    ],
    docRows,
  );

  r.footer(exportedAt);
  pdf.save(`metrics_report_${Date.now()}.pdf`);
}
