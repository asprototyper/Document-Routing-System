import {
  PAGE_W,
  PAGE_H,
  ML,
  MR,
  MT,
  MB,
  CW,
  LINE_H,
} from "./constants.js";
import { clean } from "./utils.js";

export class Report {
  constructor(pdf) {
    this.pdf = pdf;
    this.y = MT;
    this.pageNum = 1;
  }

  need(mm) {
    if (this.y + mm > PAGE_H - MB) {
      this.pdf.addPage();
      this.y = MT;
      this.pageNum++;
      return true;
    }
    return false;
  }

  gap(mm = 3) {
    this.y += mm;
  }

  titleBlock(title, sub, dateMeta, opts = {}) {
    const p = this.pdf;
    const {
      topPad = 0,
      eyebrowToTitle = 6,
      titleToSubtitle = 6,
      subtitleToRule = 5,
      afterRuleGap = 6,
      titleSize = 18,
    } = opts;

    if (topPad > 0) this.gap(topPad);

    p.setFontSize(7.5);
    p.setFont("helvetica", "normal");
    p.setTextColor(120);
    p.text("NATIONAL TELECOMMUNICATIONS COMMISSION", ML, this.y);
    p.text(dateMeta || "", PAGE_W - MR, this.y, { align: "right" });
    this.y += eyebrowToTitle;

    p.setFontSize(titleSize);
    p.setFont("helvetica", "bold");
    p.setTextColor(0);
    p.text(title, ML, this.y);
    this.y += titleToSubtitle;

    if (sub) {
      p.setFontSize(9);
      p.setFont("helvetica", "normal");
      p.setTextColor(80);
      p.text(sub, ML, this.y);
      this.y += subtitleToRule;
    }

    p.setDrawColor(0);
    p.setLineWidth(0.8);
    p.line(ML, this.y, PAGE_W - MR, this.y);
    p.setLineWidth(0.3);
    p.line(ML, this.y + 1.2, PAGE_W - MR, this.y + 1.2);
    this.y += afterRuleGap;
  }

  heading(text) {
    const bandH = 7.5;
    const preGap = 4;
    const postGap = 2;
    this.need(14);
    this.gap(preGap);
    const p = this.pdf;
    p.setFillColor(240, 240, 240);
    p.rect(ML, this.y - 1, CW, bandH, "F");
    p.setFontSize(8);
    p.setFont("helvetica", "bold");
    p.setTextColor(0);
    p.text(text.toUpperCase(), ML + 2, this.y + 4);
    this.y += bandH + postGap;
  }

  field(label, value, labelW = 58) {
    const valW = CW - labelW - 2;
    const p = this.pdf;
    const lines = p.splitTextToSize(String(value ?? "—"), valW);
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

  table(cols, rows) {
    const p = this.pdf;
    const ROW_PAD = 1.5;

    this.need(10);
    let x = ML;

    p.setFillColor(30, 30, 30);
    p.rect(ML, this.y, CW, 7, "F");
    p.setFontSize(7.5);
    p.setFont("helvetica", "bold");
    p.setTextColor(255);
    cols.forEach((col) => {
      const align = col.align || "left";
      const tx = align === "right" ? x + col.w - 1.5 : align === "center" ? x + col.w / 2 : x + 1.5;
      p.text(col.header, tx, this.y + 4.8, { align });
      x += col.w;
    });
    this.y += 8;
    p.setTextColor(0);

    rows.forEach((row, rowIdx) => {
      const cellCache = cols.map((col) => {
        const raw = typeof col.fn === "function" ? col.fn(row) : row[col.key] ?? "—";
        const lines = p.splitTextToSize(clean(String(raw)), col.w - 3);
        return {
          lines,
          align: col.align || "left",
          bold: Boolean(col.bold),
          gray: Boolean(col.gray),
        };
      });

      let maxLines = 1;
      cellCache.forEach(({ lines }) => {
        if (lines.length > maxLines) maxLines = lines.length;
      });
      const rowH = maxLines * LINE_H + ROW_PAD * 2;
      this.need(rowH + 1);

      if (rowIdx % 2 === 0) {
        p.setFillColor(248, 248, 248);
        p.rect(ML, this.y, CW, rowH, "F");
      }

      x = ML;
      p.setFontSize(8);
      cols.forEach((col, colIdx) => {
        const { lines, align, bold, gray } = cellCache[colIdx];
        const tx = align === "right" ? x + col.w - 1.5 : align === "center" ? x + col.w / 2 : x + 1.5;
        p.setFont("helvetica", bold ? "bold" : "normal");
        p.setTextColor(gray ? 100 : 0);
        p.text(lines, tx, this.y + ROW_PAD + LINE_H - 1, { align });
        x += col.w;
      });

      this.y += rowH;
      p.setDrawColor(220);
      p.setLineWidth(0.1);
      p.line(ML, this.y, PAGE_W - MR, this.y);
      p.setDrawColor(0);
    });

    this.gap(2);
  }

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
