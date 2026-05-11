import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { brl } from "./format";

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "\uFEFF" + rows.map((r) => r.map(escape).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPDF(opts: {
  filename: string;
  title: string;
  subtitle?: string;
  head: string[];
  body: (string | number)[][];
  foot?: (string | number)[];
}) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(opts.title, 14, 15);
  if (opts.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(opts.subtitle, 14, 21);
  }
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 27);

  autoTable(doc, {
    startY: 32,
    head: [opts.head],
    body: opts.body.map((r) => r.map((v) => String(v))),
    foot: opts.foot ? [opts.foot.map((v) => String(v))] : undefined,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [233, 30, 99], textColor: 255, fontStyle: "bold" },
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: 40,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(opts.filename);
}

export const fmtBRL = brl;
