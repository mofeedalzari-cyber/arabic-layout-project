import * as XLSX from "xlsx";

export type SummaryRow = { label: string; value: string | number };
export type TableSection = { title: string; cols: string[]; rows: (string | number)[][] };

/**
 * تصدير البيانات إلى ملف Excel
 */
export function exportToExcel(fileName: string, summary: SummaryRow[], sections: TableSection[]) {
  const wb = XLSX.utils.book_new();

  // ورقة الملخص
  const sumAoA: (string | number)[][] = [["البند", "القيمة"], ...summary.map((s) => [s.label, s.value])];
  const wsSum = XLSX.utils.aoa_to_sheet(sumAoA);
  wsSum["!cols"] = [{ wch: 28 }, { wch: 20 }];
  (wsSum as unknown as { "!rtl": boolean })["!rtl"] = true;
  XLSX.utils.book_append_sheet(wb, wsSum, "الملخص");

  // كل قسم في ورقة منفصلة
  sections.forEach((sec) => {
    const aoa: (string | number)[][] = [sec.cols, ...sec.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = sec.cols.map(() => ({ wch: 20 }));
    (ws as unknown as { "!rtl": boolean })["!rtl"] = true;
    const sheetName = sec.title.slice(0, 30);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * بناء HTML التقرير (بدون أزرار) لاستخدامه في المتصفح أو Capacitor Browser
 */
export function buildPDFHTML(title: string, summary: SummaryRow[], sections: TableSection[]): string {
  const esc = (v: string | number) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // بناء جدول الملخص
  const summaryHtml = `
    <table>
      <thead><tr><th>البند</th><th>القيمة</th></tr></thead>
      <tbody>${summary.map((s) => `<tr><td>${esc(s.label)}</td><td>${esc(s.value)}</td></tr>`).join("")}</tbody>
    </table>`;

  // بناء جداول الأقسام
  const sectionsHtml = sections
    .map(
      (sec) => `
      <h2>${esc(sec.title)}</h2>
      <table>
        <thead><tr>${sec.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
        <tbody>${
          sec.rows.length === 0
            ? `<tr><td colspan="${sec.cols.length}" style="text-align:center;color:#888">لا توجد بيانات</td></tr>`
            : sec.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")
        }</tbody>
      </table>`,
    )
    .join("");

  const date = new Date().toLocaleString("ar-SA");

  return `<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", "Tahoma", "Arial", sans-serif;
    color: #111;
    margin: 24px;
    background: #fff;
  }
  h1 {
    font-size: 22px;
    margin: 0 0 4px;
    color: #009688;
  }
  h2 {
    font-size: 16px;
    margin: 24px 0 10px;
    border-bottom: 2px solid #009688;
    padding-bottom: 6px;
    color: #333;
  }
  .meta {
    color: #666;
    font-size: 13px;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-bottom: 6px;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 8px 10px;
    text-align: right;
  }
  th {
    background: #f5f5f5;
    font-weight: 700;
    color: #333;
  }
  tbody tr:nth-child(even) td {
    background: #fafafa;
  }
  .footer-note {
    margin-top: 32px;
    font-size: 11px;
    color: #999;
    text-align: center;
    border-top: 1px solid #eee;
    padding-top: 16px;
  }
  @media print {
    body { margin: 10mm; }
    h2 { page-break-after: avoid; }
    tr { page-break-inside: avoid; }
    .footer-note { display: none; }
  }
</style>
</head>
<body>
  <h1>📄 ${esc(title)}</h1>
  <div class="meta">📅 تاريخ التصدير: ${esc(date)}</div>
  
  <h2>📊 الملخص</h2>
  ${summaryHtml}
  
  ${sectionsHtml}
  
  <div class="footer-note">
    — يمكنك الطباعة من قائمة المتصفح (Ctrl+P أو ⌘+P) —
  </div>
</body>
</html>`;
}

/**
 * تصدير PDF (لبيئة الويب) - تفتح نافذة جديدة وتعرض التقرير مع زر طباعة
 * ملاحظة: في تطبيقات Android (Capacitor) يُفضل استخدام buildPDFHTML مع Browser.open()
 */
export function exportToPDF(title: string, summary: SummaryRow[], sections: TableSection[]) {
  const html = buildPDFHTML(title, summary, sections);
  
  // محاولة فتح نافذة جديدة
  const w = window.open("", "_blank", "width=900,height=750,scrollbars=yes,menubar=yes");
  if (!w) {
    alert("يرجى السماح بالنوافذ المنبثقة لتصدير PDF");
    return;
  }
  
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  
  // محاولة استدعاء الطباعة تلقائياً بعد تحميل المحتوى
  w.onload = () => {
    setTimeout(() => {
      w.print();
    }, 500);
  };
}
