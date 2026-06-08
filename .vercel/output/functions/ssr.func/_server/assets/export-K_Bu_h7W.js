import { g as createLucideIcon } from "./router-yLgiv1p7.js";
import { a as jsPDF } from "./jspdf.node.min-LIwg0wSs.js";
import { autoTable } from "./jspdf.plugin.autotable-rNuKHwSj.js";
const __iconNode = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode);
function downloadCSV(filename, rows) {
  const escape = (v) => {
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
function downloadPDF(opts) {
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
  doc.text(`Gerado em ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}`, 14, 27);
  autoTable(doc, {
    startY: 32,
    head: [opts.head],
    body: opts.body.map((r) => r.map((v) => String(v))),
    foot: opts.foot ? [opts.foot.map((v) => String(v))] : void 0,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [233, 30, 99], textColor: 255, fontStyle: "bold" },
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: 40,
      fontStyle: "bold"
    },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    margin: { left: 14, right: 14 }
  });
  doc.save(opts.filename);
}
export {
  Pencil as P,
  downloadPDF as a,
  downloadCSV as d
};
