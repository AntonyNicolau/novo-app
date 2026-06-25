import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type Column = { key: string; label: string };
export type Row = Record<string, string | number>;

export function exportCSV(filename: string, columns: Column[], rows: Row[]) {
  const header = columns.map((c) => `"${c.label}"`).join(";");
  const body = rows
    .map((r) => columns.map((c) => `"${String(r[c.key] ?? "")}"`).join(";"))
    .join("\n");
  const csv = "﻿" + header + "\n" + body; // BOM p/ acentos no Excel
  download(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

export function exportExcel(filename: string, columns: Column[], rows: Row[]) {
  const data = rows.map((r) => {
    const o: Record<string, string | number> = {};
    columns.forEach((c) => (o[c.label] = r[c.key] ?? ""));
    return o;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Relatório");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportPDF(
  title: string,
  filename: string,
  columns: Column[],
  rows: Row[],
) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    `Gerado em ${new Date().toLocaleString("pt-BR")}`,
    14,
    23,
  );
  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.label)],
    body: rows.map((r) => columns.map((c) => String(r[c.key] ?? ""))),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });
  doc.save(`${filename}.pdf`);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
